import { useRef, useState } from 'react'
import { deleteRecord, resendRecord } from '@/services/deleteResend'
import extractBackendError from '@/utils/extractBackendError'

export type ResubmitProgressState = 'loading' | 'success' | 'error' | null

interface ResubmitErrorState {
  code: string
  message: string
}

export function useResubmitDokumen(recordId?: string) {
  const [progressResubmit, setProgressResubmit] = useState<ResubmitProgressState>(null)
  const [resubmitError, setResubmitError] = useState<ResubmitErrorState | null>(null)
  const [progressDelete, setProgressDelete] = useState<ResubmitProgressState>(null)
  const [deleteError, setDeleteError] = useState<ResubmitErrorState | null>(null)
  const isActionInFlightRef = useRef(false)

  const handleResubmitClick = async () => {
    if (isActionInFlightRef.current) {
      return
    }

    isActionInFlightRef.current = true
    setProgressResubmit('loading')
    setResubmitError(null)

    if (!recordId) {
      setProgressResubmit('error')
      setResubmitError({
        code: 'BAD_REQUEST',
        message: 'Dokumen ID tidak ditemui.',
      })
      isActionInFlightRef.current = false
      return
    }

    try {
      await resendRecord(recordId)

      setProgressResubmit('success')
    } catch (error) {
      console.error('Error resubmitting document:', error)
      const backendError = extractBackendError(error)

      setProgressResubmit('error')
      setResubmitError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message: backendError?.message ?? 'Permintaan hantar semula gagal diproses.',
      })
    } finally {
      isActionInFlightRef.current = false
    }
  }

  const resetResubmitState = () => {
    setProgressResubmit(null)
    setResubmitError(null)
    setProgressDelete(null)
    setDeleteError(null)
  }

  const handleDeleteClick = async () => {
    if (isActionInFlightRef.current) {
      return
    }

    isActionInFlightRef.current = true
    setProgressDelete('loading')
    setDeleteError(null)

    if (!recordId) {
      setProgressDelete('error')
      setDeleteError({
        code: 'BAD_REQUEST',
        message: 'Dokumen ID tidak ditemui.',
      })
      isActionInFlightRef.current = false
      return
    }

    try {
      await deleteRecord(recordId)

      setProgressDelete('success')
    } catch (error) {
      console.error('Error deleting document:', error)
      const backendError = extractBackendError(error)

      setProgressDelete('error')
      setDeleteError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message: backendError?.message ?? 'Permintaan hapus dokumen gagal diproses.',
      })
    } finally {
      isActionInFlightRef.current = false
    }
  }

  return {
    progressResubmit,
    resubmitError,
    progressDelete,
    deleteError,
    handleResubmitClick,
    handleDeleteClick,
    resetResubmitState,
  }
}
