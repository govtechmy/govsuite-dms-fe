import type { ReactNode } from 'react'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import {
  SummaryList,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
} from '@govtechmy/myds-react/summary-list'
import { Tag } from '@govtechmy/myds-react/tag'
import type { CurrentUserProfile } from '@/services/auth.svc'
import { resolveUserRoles } from '@/models/userRoles'
import normalizeWord from '@/utils/NormalizeWord'
import { formatDateTimeUpdatedDisplay2 } from '@/utils/formatDate'

interface PengurusanProfilSummaryCardProps {
  profile: CurrentUserProfile | null
  isLoading: boolean
  error: string | null
}

interface ProfileSummaryRow {
  term: string
  detail: ReactNode
}

function getProfileSummaryRows(profile: CurrentUserProfile | null): ProfileSummaryRow[] {
  const roles = resolveUserRoles(profile?.roles)

  return [
    { term: 'Nama Penuh', detail: profile?.fullName || '-' },
    { term: 'Email', detail: profile?.email || '-' },
    {
      term: 'Peranan Pengguna',
      detail: (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <Tag key={role} mode="pill" size="small" variant="primary">
              {normalizeWord(role)}
            </Tag>
          ))}
        </div>
      ),
    },
    { term: 'Log Masuk Terakhir', detail: formatDateTimeUpdatedDisplay2(profile?.lastLoginAt) },
  ]
}

export default function PengurusanProfilSummaryCard({
  profile,
  isLoading,
  error,
}: PengurusanProfilSummaryCardProps) {
  if (error) {
    return (
      <Callout variant="danger">
        <CalloutTitle>Ralat</CalloutTitle>
        <CalloutContent>{error}</CalloutContent>
      </Callout>
    )
  }

  const rows = getProfileSummaryRows(profile)

  return (
    <div className="bg-bg-gray-50 px-6 py-2 rounded-lg border border-otl-gray-200">
      <SummaryList>
        <SummaryListBody>
          {rows.map((row, index) => (
            <SummaryListRow
              key={row.term}
              className={index === rows.length - 1 ? 'border-b-0' : undefined}
            >
              <SummaryListTerm className="font-medium">{row.term}</SummaryListTerm>
              <SummaryListDetail className="break-words">
                {isLoading ? (
                  <div className="h-4 w-32 max-w-full animate-pulse rounded bg-otl-gray-200" />
                ) : (
                  row.detail
                )}
              </SummaryListDetail>
              <SummaryListAction></SummaryListAction>
            </SummaryListRow>
          ))}
        </SummaryListBody>
      </SummaryList>
    </div>
  )
}
