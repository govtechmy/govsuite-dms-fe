import { clx } from '@govtechmy/myds-react/utils'

interface MainHeadingProps {
  children: React.ReactNode
  className?: string
}
export default function MainHeading({ children, className }: MainHeadingProps) {
  return (
    <div
      className={clx('text-heading-2xs font-heading font-semibold text-txt-black-900', className)}
    >
      {children}
    </div>
  )
}
