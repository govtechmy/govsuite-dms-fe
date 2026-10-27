import { Button } from '@govtechmy/myds-react/button'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface DocumentPreviewHeaderProps {
  documentId?: string
  title?: string
  children?: ReactNode
}

export default function DocumentPreviewHeader({
  documentId,
  title,
  children,
}: DocumentPreviewHeaderProps) {
  const navigate = useNavigate()
  const { lang } = useParams()

  const handleBukaDokumen = () => {
    if (documentId) {
      navigate(`/${lang}/katalog-dokumen/${documentId}`)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-otl-primary-200 bg-bg-primary-50 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3
          title={title || undefined}
          className="line-clamp-1 break-words text-body-sm font-semibold text-txt-black-900"
        >
          {title || 'Pratonton'}
        </h3>
        {children}
      </div>
      <Button size="small" className="shrink-0" onClick={handleBukaDokumen} disabled={!documentId}>
        Buka Dokumen
      </Button>
    </div>
  )
}
