import { clx } from '@govtechmy/myds-react/utils'

interface RightSidePageLayoutWrapper {
  children: React.ReactNode
  className?: string
}

export default function RightSidePageLayoutWrapper({
  children,
  className,
}: RightSidePageLayoutWrapper) {
  return <div className={clx('p-6 pr-0', className)}>{children}</div>
}
