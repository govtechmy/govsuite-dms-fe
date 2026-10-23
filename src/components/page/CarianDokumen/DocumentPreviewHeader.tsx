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
    <div className="flex flex-col gap-3 rounded-lg border border-otl-primary-200 bg-bg-primary-50 p-3">
      <div className="flex items-start gap-3">
        <h3
          title={title || undefined}
          className="line-clamp-2 min-w-0 flex-1 break-words text-base font-semibold leading-6 tracking-normal text-txt-black-900"
        >
          {title || 'Pratonton'}
        </h3>
        <Button
          size="small"
          className="shrink-0"
          onClick={handleBukaDokumen}
          disabled={!documentId}
        >
          Buka Dokumen
        </Button>
      </div>
      {children}
    </div>
  )
}
