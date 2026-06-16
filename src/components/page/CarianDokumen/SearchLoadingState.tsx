import { Spinner } from '@govtechmy/myds-react/spinner'

export default function SearchLoadingState() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full">
      <Spinner size="large" />
      <p className="text-body-sm font-normal font-body text-txt-black-700">
        Carian sedang dilakukan
      </p>
    </div>
  )
}
