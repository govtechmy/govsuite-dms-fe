import { useState } from 'react'
import { resendRecord } from '@/services/deleteResend'

export type ResubmitProgressState = 'loading' | 'success' | 'error' | null

interface ResubmitErrorState {
  code: string
  message: string
}

export function useResubmitDokumen(recordId?: string) {
  const [progressResubmit, setProgressResubmit] = useState<ResubmitProgressState>(null)
  const [resubmitError, setResubmitError] = useState<ResubmitErrorState | null>(null)

  const handleResubmitClick = async () => {
    setProgressResubmit('loading')
    setResubmitError(null)

    if (!recordId) {
      setProgressResubmit('error')
      setResubmitError({
        code: 'BAD_REQUEST',
        message: 'Dokumen ID tidak ditemui.',
      })
      return
    }

    try {
      const result = await resendRecord(recordId)

      if (!result.success) {
        setProgressResubmit('error')
        setResubmitError({
          code: result.error?.code ?? 'REQUEST_FAILED',
          message: result.error?.message ?? 'Permintaan hantar semula gagal diproses.',
        })
        return
      }

      setProgressResubmit('success')
    } catch (error) {
      console.error('Error resubmitting document:', error)
      setProgressResubmit('error')
      setResubmitError({
        code: 'REQUEST_FAILED',
        message:
          error instanceof Error ? error.message : 'Permintaan hantar semula gagal diproses.',
      })
    }
  }

  const resetResubmitState = () => {
    setProgressResubmit(null)
    setResubmitError(null)
  }

  return {
    progressResubmit,
    resubmitError,
    handleResubmitClick,
    resetResubmitState,
  }
}
