import type {
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import DokumenContentID from '@/components/page/KatalogDokumen/DokumenID/DokumenContentID'
import { HeaderDokumenID } from '@/components/page/KatalogDokumen/DokumenID/HeaderDokumenID'
import { SearchBarDokumenID } from '@/components/page/KatalogDokumen/DokumenID/SearchBarDokumenID'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPdfGarage, type PdfGarageBase, type PdfGarageError } from '@/services/pdf.svc'
import normalizeWord from '@/utils/NormalizeWord'
import { getMetadata, type MetadataDocument } from '@/services/metadata.svc'
import {
  getAvailableUserGroups,
  getAvailableUsers,
  getCurrentApprovedUsers,
} from '@/services/shareDocument.svc'
import { downloadFile } from '@/utils/downloadFile'
import { putDocumentApproval, putDocumentNotApproved } from '@/services/approval.svc'
import extractBackendError from '@/utils/extractBackendError'
import { useShareDocumentStore } from '@/store/ShareDocumentStore'

export default function DokumenIDPage() {
  const { lang = 'en', DokumenID } = useParams<{ lang: string; DokumenID: string }>()
  const [progressApprove, setProgressApprove] = useState<ProgressState>(null)
  const [progressDisapprove, setProgressDisapprove] = useState<ProgressState>(null)
  const [dokumenFetchState, setDokumenFetchState] = useState<ProgressState>(null)
  const [dokumenFetchError, setDokumenFetchError] = useState<PdfGarageError | null>(null)
  const [pdfData, setPdfData] = useState<PdfGarageBase | null>(null)
  const [metadataDocument, setMetadataDocument] = useState<MetadataDocument | null>(null)
  const [approvalError, setApprovalError] = useState<{ code: string; message: string } | null>(null)
  const [disapprovalError, setDisapprovalError] = useState<{
    code: string
    message: string
  } | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [pdfSearchState, setPdfSearchState] = useState<PdfSearchState>({
    totalMatches: 0,
    currentMatchIndex: -1,
    isIndexing: true,
  })
  const [navigationRequest, setNavigationRequest] = useState<PdfSearchNavigationRequest | null>(
    null
  )
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)

  const setAvailableUsers = useShareDocumentStore((state) => state.setAvailableUsers)
  const setAvailableUserGroups = useShareDocumentStore((state) => state.setAvailableUserGroups)
  const setCurrentApprovedUsers = useShareDocumentStore((state) => state.setCurrentApprovedUsers)
  const navigationTokenRef = useRef(0)
  const shareRequestTokenRef = useRef(0)

  const queueNavigationRequest = (
    action: PdfSearchNavigationRequest['action'],
    targetMatchIndex?: number
  ) => {
    navigationTokenRef.current += 1
    setNavigationRequest({
      action,
      targetMatchIndex,
      token: navigationTokenRef.current,
    })
  }

  const handleApproveDokumen = async () => {
    setProgressApprove('loading')
    setApprovalError(null)

    if (!DokumenID) {
      setProgressApprove('error')
      setApprovalError({
        code: 'BAD_REQUEST',
        message: 'Dokumen ID tidak ditemui.',
      })
      return
    }

    try {
      await putDocumentApproval(DokumenID)

      setProgressApprove('success')
    } catch (error) {
      console.error('Error approving document:', error)
      const backendError = extractBackendError(error)
      setApprovalError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message:
          backendError?.message ??
          (error instanceof Error ? error.message : 'Permintaan kelulusan gagal diproses.'),
      })
      setProgressApprove('error')
    }
  }

  const handleNotApproveDokumen = async (reason: string) => {
    setProgressDisapprove('loading')
    setDisapprovalError(null)

    if (!DokumenID) {
      setProgressDisapprove('error')
      setDisapprovalError({
        code: 'BAD_REQUEST',
        message: 'Dokumen ID tidak ditemui.',
      })
      return
    }

    try {
      await putDocumentNotApproved({
        recordId: DokumenID,
        body: { reason },
      })

      setProgressDisapprove('success')
    } catch (error) {
      console.error('Error rejecting document:', error)
      const backendError = extractBackendError(error)
      setDisapprovalError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message:
          backendError?.message ??
          (error instanceof Error ? error.message : 'Permintaan penolakan gagal diproses.'),
      })
      setProgressDisapprove('error')
    }
  }

  const handleDownloadDokumen = (recordTitle: string) => {
    if (!pdfData?.url) {
      return
    }

    downloadFile({
      url: pdfData.url,
      fileName: recordTitle,
      fallback: `dokumen-${DokumenID}`,
      fileExtension: pdfData.meta?.fileExtension,
    })
  }

  const handleRefetchShareData = async () => {
    try {
      if (!DokumenID) return

      const currentToken = ++shareRequestTokenRef.current

      const [users, approved] = await Promise.all([
        getAvailableUsers(DokumenID),
        getCurrentApprovedUsers(DokumenID),
      ])

      if (shareRequestTokenRef.current === currentToken) {
        setAvailableUsers(users)
        setCurrentApprovedUsers(approved)
      }
    } catch (error) {
      console.error('Error refetching share data:', error)
    }
  }

  useEffect(() => {
    const fetchPDFData = async () => {
      try {
        setDokumenFetchState('loading')
        setDokumenFetchError(null)
        setPdfData(null)

        if (!DokumenID) {
          setDokumenFetchState('error')
          setDokumenFetchError({
            code: 'BAD_REQUEST',
            message: 'Dokumen ID tidak ditemui.',
          })
          return
        }

        const result = await getPdfGarage({ id: DokumenID })

        if (!result.success) {
          setDokumenFetchState('error')
          setDokumenFetchError(result.error)
          return
        }

        setPdfData(result.data)
        setDokumenFetchState('success')
      } catch (err) {
        setDokumenFetchState('error')
        setDokumenFetchError({
          code: 'REQUEST_FAILED',
          message: err instanceof Error ? err.message : 'Gagal memuatkan dokumen.',
        })
        console.error('Error fetching PDF data:', err)
      }
    }

    const fetchMetadata = async () => {
      try {
        if (!DokumenID) {
          setMetadataDocument(null)
          return
        }
        const data = await getMetadata({ recordId: DokumenID })
        setMetadataDocument(data)
      } catch (error) {
        setMetadataDocument(null)
        console.error('Error fetching metadata:', error)
      }
    }

    const fetchAvailableUsers = async () => {
      try {
        if (!DokumenID) {
          setAvailableUsers(null)
          return
        }

        const currentToken = ++shareRequestTokenRef.current
        const data = await getAvailableUsers(DokumenID)
        if (shareRequestTokenRef.current === currentToken) {
          setAvailableUsers(data)
        }
      } catch (error) {
        setAvailableUsers(null)
        console.error('Error fetching available users:', error)
      }
    }

    const fetchAvailableUserGroups = async () => {
      try {
        if (!DokumenID) {
          setAvailableUserGroups(null)
          return
        }

        const currentToken = shareRequestTokenRef.current
        const data = await getAvailableUserGroups(DokumenID)
        if (shareRequestTokenRef.current === currentToken) {
          setAvailableUserGroups(data)
        }
      } catch (error) {
        setAvailableUserGroups(null)
        console.error('Error fetching available user groups:', error)
      }
    }

    const fetchCurrentApprovedUsers = async () => {
      try {
        if (!DokumenID) {
          setCurrentApprovedUsers(null)
          return
        }

        const currentToken = shareRequestTokenRef.current
        const data = await getCurrentApprovedUsers(DokumenID)
        if (shareRequestTokenRef.current === currentToken) {
          setCurrentApprovedUsers(data)
        }
      } catch (error) {
        setCurrentApprovedUsers(null)
        console.error('Error fetching current approved users:', error)
      }
    }

    fetchAvailableUsers()
    fetchAvailableUserGroups()
    fetchCurrentApprovedUsers()
    fetchPDFData()
    fetchMetadata()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DokumenID])

  useEffect(() => {
    setSearchKeyword('')
    setPdfSearchState({
      totalMatches: 0,
      currentMatchIndex: -1,
      isIndexing: true,
    })
    setNavigationRequest(null)
    navigationTokenRef.current = 0
    setIsPdfLoaded(false)
  }, [DokumenID])

  const isApprovalProgressIdle = progressApprove === null && progressDisapprove === null

  return (
    <>
      {isApprovalProgressIdle && dokumenFetchState === 'success' && pdfData && (
        <div className="flex w-full flex-col overflow-auto">
          {pdfData && (
            <HeaderDokumenID
              metadataDocument={metadataDocument}
              recordTitle={pdfData.document?.recordTitle ?? 'Title tidak dijumpai'}
              path={pdfData.document?.path ?? 'Path tidak dijumpai'}
              recordDate={pdfData.document?.recordDate ?? 'Tarikh tidak dijumpai'}
              status={pdfData.document?.status ?? 'Status tidak dijumpai'}
              accessLevel={normalizeWord(
                pdfData.document?.accessLevel || 'Klasifikasi tidak dijumpai'
              )}
              documentProfileCode={normalizeWord(
                pdfData.document?.documentProfileCode || 'Kategori tidak dijumpai'
              )}
              unit={normalizeWord(pdfData.document?.unit || 'Unit tidak dijumpai')}
              onApproveDokumen={handleApproveDokumen}
              onNotApproveDokumen={handleNotApproveDokumen}
              onDownloadDokumen={handleDownloadDokumen}
              onShareDataRefresh={handleRefetchShareData}
            />
          )}
          <SearchBarDokumenID
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            currentMatchIndex={pdfSearchState.currentMatchIndex}
            totalMatches={pdfSearchState.totalMatches}
            onPreviousMatch={() => queueNavigationRequest('previous')}
            onNextMatch={() => queueNavigationRequest('next')}
            isPdfLoaded={isPdfLoaded}
            isIndexing={pdfSearchState.isIndexing}
          />
          <DokumenContentID
            pdfUrl={pdfData.url}
            searchKeyword={searchKeyword}
            navigationRequest={navigationRequest}
            onSearchStateChange={setPdfSearchState}
            onDocumentLoad={() => setIsPdfLoaded(true)}
          />
        </div>
      )}

      {isApprovalProgressIdle && dokumenFetchState === 'loading' && (
        <div className="flex w-full h-full">
          <ProgressResultChecker
            progress={dokumenFetchState}
            loadingDescription="Dokumen sedang dimuatkan. Sila tunggu sebentar."
            errorTitle="Dokumen Gagal Dimuatkan"
            errorDescription={
              <div className="flex flex-col gap-2 items-center justify-center">
                <div>Dokumen gagal dimuatkan, sila cuba lagi atau hubungi pentadbir sistem.</div>
                <div>
                  {dokumenFetchError?.code ?? 'REQUEST_FAILED'} :{' '}
                  {dokumenFetchError?.message ?? 'Gagal memuatkan dokumen.'}
                </div>
              </div>
            }
            errorButtonText="Kembali Ke Katalog Dokumen"
            navigateError={`/${lang}/katalog-dokumen`}
          />
        </div>
      )}

      {isApprovalProgressIdle && dokumenFetchState === 'error' && (
        <div className="flex w-full h-full">
          <ProgressResultChecker
            progress={dokumenFetchState}
            loadingDescription="Dokumen sedang dimuatkan. Sila tunggu sebentar."
            errorTitle="Dokumen Gagal Dimuatkan"
            errorDescription={
              <div className="flex flex-col gap-2 items-center justify-center">
                <div>Dokumen gagal dimuatkan, sila cuba lagi atau hubungi pentadbir sistem.</div>
                <div>
                  {dokumenFetchError?.code ?? 'REQUEST_FAILED'} :{' '}
                  {dokumenFetchError?.message ?? 'Gagal memuatkan dokumen.'}
                </div>
              </div>
            }
            errorButtonText="Kembali Ke Katalog Dokumen"
            navigateError={`/${lang}/katalog-dokumen`}
          />
        </div>
      )}
      {progressApprove && (
        <div className="flex w-full h-full">
          <ProgressResultChecker
            progress={progressApprove}
            loadingDescription="Kelulusan Sedang Diproses"
            successTitle="Dokumen Berjaya Diluluskan"
            successDescription="Dokumen telah berjaya diluluskan dan diterbitkan."
            successButtonText="Kembali Ke Senarai Dokumen"
            errorTitle="Dokumen Gagal Diluluskan!"
            errorDescription={
              <div className="flex flex-col gap-2 items-center justify-center">
                <div>Dokumen gagal diluluskan, sila cuba lagi atau hubungi pentadbir sistem.</div>
                <div>
                  {approvalError?.code ?? 'REQUEST_FAILED'} :{' '}
                  {approvalError?.message ?? 'Permintaan kelulusan gagal diproses.'}
                </div>
              </div>
            }
            errorButtonText="Kembali Ke Senarai Dokumen"
            navigateSuccess={`/${lang}/perlu-kelulusan`}
            navigateError={`/${lang}/perlu-kelulusan`}
          />
        </div>
      )}

      {progressDisapprove && (
        <div className="flex w-full h-full">
          <ProgressResultChecker
            progress={progressDisapprove}
            loadingDescription="Kelulusan Sedang Diproses"
            successTitle="Dokumen Tidak Diluluskan"
            successDescription="Dokumen telah dihantar semula kepada pewujud untuk tindakan seterusnya."
            successButtonText="Kembali Ke Senarai Dokumen"
            errorTitle="Dokumen Gagal Diproses!"
            errorDescription={
              <div className="flex flex-col gap-2 items-center justify-center">
                <div>Dokumen gagal diluluskan, sila cuba lagi atau hubungi pentadbir sistem.</div>
                <div>
                  {disapprovalError?.code ?? 'REQUEST_FAILED'} :{' '}
                  {disapprovalError?.message ?? 'Permintaan penolakan gagal diproses.'}
                </div>
              </div>
            }
            errorButtonText="Kembali Ke Senarai Dokumen"
            navigateSuccess={`/${lang}/perlu-kelulusan`}
            navigateError={`/${lang}/perlu-kelulusan`}
          />
        </div>
      )}
    </>
  )
}
