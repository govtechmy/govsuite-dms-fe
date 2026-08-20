import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import SearchBarKatalogDokumen from '@/components/page/KatalogDokumen/SearchBarKatalogDokumen'
import PengurusanPenggunaDisplaySearch from '@/components/page/Pengurusan/PengurusanPengguna/PengurusanPenggunaDisplaySearch'
import SelectPengurusanPengguna from '@/components/page/Pengurusan/PengurusanPengguna/SelectPengurusanPengguna'
import {
  getDropdownUnits,
  getUserRoles,
  type DropdownUnit,
  type DropdownUserRole,
} from '@/services/dropdown.svc'
// Tahap Keselamatan lookup endpoint isn't released yet — re-enable once backend is ready.
// import { getAccessLevels, type AccessLevel } from '@/services/dropdown.svc'
import {
  getPenggunaList,
  type GetPenggunaListResponse,
  type PenggunaItem,
} from '@/services/pengurusanPengguna.svc'
import extractBackendError from '@/utils/extractBackendError'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function PengurusanPenggunaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('search')?.trim() || ''
  const unit = searchParams.get('unit') || ''
  const tahapAkses = searchParams.get('tahapAkses') || ''
  // Tahap Keselamatan lookup endpoint isn't released yet — re-enable once backend is ready.
  // const tahapKeselamatan = searchParams.get('tahapKeselamatan') || ''
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.max(1, Number(searchParams.get('limit')) || 15)

  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownTahapAkses, setDropdownTahapAkses] = useState<DropdownUserRole[]>([])
  // const [dropdownTahapKeselamatan, setDropdownTahapKeselamatan] = useState<AccessLevel[]>([])

  const [users, setUsers] = useState<PenggunaItem[]>([])
  const [searchMeta, setSearchMeta] = useState<GetPenggunaListResponse['meta'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unitNameById = useMemo(
    () => Object.fromEntries(dropdownUnits.map((unitItem) => [unitItem.code, unitItem.codeName])),
    [dropdownUnits]
  )

  const roleNameByCode = useMemo(
    () => Object.fromEntries(dropdownTahapAkses.map((role) => [role.code, role.name])),
    [dropdownTahapAkses]
  )

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Tahap Keselamatan lookup endpoint isn't released yet — re-enable once backend is ready.
        // const [unitsData, rolesData, accessLevelsData] = await Promise.all([
        //   getDropdownUnits(),
        //   getUserRoles(),
        //   getAccessLevels(),
        // ])
        // setDropdownTahapKeselamatan(accessLevelsData)
        const [unitsData, rolesData] = await Promise.all([getDropdownUnits(), getUserRoles()])
        setDropdownUnits(unitsData)
        setDropdownTahapAkses(rolesData)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    fetchDropdownData()
  }, [])

  useEffect(() => {
    const fetchPenggunaList = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getPenggunaList({
          query,
          unit,
          role: tahapAkses,
          page: pageNumber,
          limit: pageSize,
        })
        setUsers(data.items)
        setSearchMeta(data.meta)
      } catch (err) {
        const backendError = extractBackendError(err)
        setError(backendError?.message ?? 'Gagal memuatkan senarai pengguna')
        console.error('Error fetching pengguna list:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPenggunaList()
  }, [query, unit, tahapAkses, pageNumber, pageSize])

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

  const totalRecords = searchMeta?.totalItems ?? users.length

  return (
    <RightSidePageLayoutWrapper className="h-full">
      <div className="flex h-full flex-col gap-6">
        <MainHeading>Pengurusan Pengguna</MainHeading>
        <div className="flex flex-col gap-3">
          <SearchBarKatalogDokumen />
          <SelectPengurusanPengguna
            dropdownUnits={dropdownUnits}
            dropdownTahapAkses={dropdownTahapAkses}
            // Tahap Keselamatan lookup endpoint isn't released yet — re-enable once backend is ready.
            // dropdownTahapKeselamatan={dropdownTahapKeselamatan}
          />
        </div>

        <PengurusanPenggunaDisplaySearch
          users={users}
          unitNameById={unitNameById}
          roleNameByCode={roleNameByCode}
          isLoading={isLoading}
          error={error}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
