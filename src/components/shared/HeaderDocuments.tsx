import { clx } from '@govtechmy/myds-react/utils'

interface TaskTitleProps {
  title?: string
  buttonChildren?: React.ReactNode
  className?: string
  classNameTitle?: string
}

export default function TaskTitle({
  title,
  buttonChildren,
  className,
  classNameTitle,
}: TaskTitleProps) {
  return (
    <div className={clx('mb-6 flex items-center justify-between', className)}>
      {title && (
        <h1
          className={clx(
            'text-heading-2xs font-semibold font-heading text-txt-black-900',
            classNameTitle
          )}
        >
          {title}
        </h1>
      )}
      {buttonChildren}
    </div>
  )
}
