import { Radio, RadioButton, RadioItem, RadioLabel } from '@govtechmy/myds-react/radio'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_SEARCH_MODE, SEARCH_MODE, SEARCH_MODE_PARAM } from './searchMode'

const SEARCH_MODES = [
  { value: SEARCH_MODE.TEKS, label: 'Carian Teks Penuh' },
  { value: SEARCH_MODE.HIBRID, label: 'Carian Hibrid' },
]

export default function SearchModeRadio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchMode = searchParams.get(SEARCH_MODE_PARAM) || DEFAULT_SEARCH_MODE

  const handleSearchModeChange = (value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value === DEFAULT_SEARCH_MODE) {
      params.delete(SEARCH_MODE_PARAM)
    } else {
      params.set(SEARCH_MODE_PARAM, value)
    }

    setSearchParams(params)
  }

  return (
    <Radio
      value={searchMode}
      onValueChange={handleSearchModeChange}
      aria-label="Jenis carian"
      className="flex flex-row flex-wrap items-center gap-4"
    >
      {SEARCH_MODES.map((mode) => (
        <RadioItem key={mode.value}>
          <RadioButton value={mode.value} id={`searchMode-${mode.value}`} />
          <RadioLabel
            htmlFor={`searchMode-${mode.value}`}
            className="text-body-sm font-medium text-txt-black-900"
          >
            {mode.label}
          </RadioLabel>
        </RadioItem>
      ))}
    </Radio>
  )
}
