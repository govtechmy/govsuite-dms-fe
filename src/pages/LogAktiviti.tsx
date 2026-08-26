import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import LogDisplaySearch from '@/components/page/LogAktiviti/LogDisplaySearch'
import SearchbarLogAktiviti from '@/components/page/LogAktiviti/SearchbarLogAktiviti'
import SelectLogAktiviti from '@/components/page/LogAktiviti/SelectLogAktiviti'
import { useSearchParams } from 'react-router-dom'

export default function LogAktiviti() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.max(1, Number(searchParams.get('limit')) || 15)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('limit', String(newSize))
    params.set('page', '1')
    setSearchParams(params)
  }

  return (
    <RightSidePageLayoutWrapper className="h-full">
      <div className="flex h-full flex-col gap-6">
        <MainHeading>Log Aktiviti</MainHeading>
        <div className="flex flex-col gap-3">
          <SearchbarLogAktiviti />
          <SelectLogAktiviti dropdownJenisDokumen={[]} />
        </div>

        <LogDisplaySearch
          pageNumber={pageNumber}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
