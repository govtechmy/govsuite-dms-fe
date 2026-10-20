import { useEffect, useState } from 'react'
import type { ProgressState } from '@/components/shared/ProgressResult'
import { apiAuthHeaders } from '@/services/http'
import {
  getPdfConvertStatus,
  postPdfConvert,
  type PdfConvertResult,
} from '@/services/pdfConvert.svc'

const PDF_CONVERT_POLL_INTERVAL_MS = 1000
const PDF_CONVERT_TIMEOUT_MS = 3 * 60 * 1000

type Conversion = {
  pdfUrl: string
  state: ProgressState
  result: PdfConvertResult | null
}

/**
 * Converts the PDF at `pdfUrl` to HTML via pdf-page-cast: fetches the PDF,
 * uploads it as a background job and polls until the HTML is ready.
 * Polling stops when `pdfUrl` changes or the component unmounts.
 */
export function usePdfHtmlConversion(pdfUrl: string | undefined, fileName: string) {
  const [conversion, setConversion] = useState<Conversion | null>(null)

  useEffect(() => {
    if (!pdfUrl) return

    let cancelled = false
    const update = (state: ProgressState, result: PdfConvertResult | null = null) =>
      setConversion({ pdfUrl, state, result })

    const convert = async () => {
      update('loading')

      try {
        const pdfResponse = await fetch(pdfUrl, { headers: apiAuthHeaders() })
        if (!pdfResponse.ok) {
          throw new Error(`Failed to fetch PDF (${pdfResponse.status})`)
        }
        const pdfBlob = await pdfResponse.blob()
        if (cancelled) return

        const { jobId } = await postPdfConvert(pdfBlob, fileName)
        const deadline = Date.now() + PDF_CONVERT_TIMEOUT_MS

        while (!cancelled) {
          const job = await getPdfConvertStatus(jobId)
          if (cancelled) return

          if (job.status === 'completed' && job.result?.html) {
            update('success', job.result)
            return
          }

          if (job.status === 'failed' || job.status === 'completed') {
            throw new Error(job.error ?? 'pdf-page-cast returned no HTML')
          }

          if (Date.now() >= deadline) {
            throw new Error(`pdf-page-cast job ${jobId} timed out`)
          }

          await new Promise((resolve) => setTimeout(resolve, PDF_CONVERT_POLL_INTERVAL_MS))
        }
      } catch (error) {
        console.error('Error converting PDF via pdf-page-cast:', error)
        if (!cancelled) {
          update('error')
        }
      }
    }

    convert()

    return () => {
      cancelled = true
    }
  }, [pdfUrl, fileName])

  // A result belongs to the URL it was converted from; while a new URL is still
  // being picked up, report it as loading instead of exposing the previous document
  if (!pdfUrl) {
    return { state: null, result: null }
  }

  if (conversion?.pdfUrl !== pdfUrl) {
    return { state: 'loading' as ProgressState, result: null }
  }

  return { state: conversion.state, result: conversion.result }
}
