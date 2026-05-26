interface TaskTitleProps {
  title?: string
  buttonChildren?: React.ReactNode
}

export default function TaskTitle({ title, buttonChildren }: TaskTitleProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      {title && (
        <h1 className="text-heading-2xs font-semibold font-heading text-txt-black-900">{title}</h1>
      )}
      {buttonChildren}
    </div>
  )
}
