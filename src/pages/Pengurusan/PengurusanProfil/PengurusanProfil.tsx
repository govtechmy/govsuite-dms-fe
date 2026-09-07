import { useEffect, useState } from 'react'
import { AutoToast } from '@govtechmy/myds-react/toast'
import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import PengurusanProfilSummaryCard from '@/components/page/Pengurusan/PengurusanProfil/PengurusanProfilSummaryCard'
import ChangePasswordForm from '@/components/shared/ChangePasswordForm'
import { getCurrentUserProfile, type CurrentUserProfile } from '@/services/auth.svc'
import extractBackendError from '@/utils/extractBackendError'

export default function PengurusanProfilPage() {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getCurrentUserProfile()
        setProfile(data)
      } catch (err) {
        const backendError = extractBackendError(err)
        setError(backendError?.message ?? 'Gagal memuatkan maklumat profil')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return (
    <RightSidePageLayoutWrapper className="h-full">
      <div className="flex h-full flex-col gap-6">
        <MainHeading>Pengurusan Profil</MainHeading>
        <PengurusanProfilSummaryCard profile={profile} isLoading={isLoading} error={error} />
        <ChangePasswordForm />
      </div>
      <AutoToast />
    </RightSidePageLayoutWrapper>
  )
}
