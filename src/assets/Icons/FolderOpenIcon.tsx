import type { FunctionComponent, SVGProps } from 'react'

/**
 * Folder Open Icon
 * Not shipped by @govtechmy/myds-react/icon — authored locally to match its
 * icon conventions (20x20 viewBox, 1.5 stroke, round caps/joins, currentColor)
 * so it drops in anywhere a MYDS icon would.
 * @param className
 * @returns FolderOpenIcon
 */
export const FolderOpenIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Icon/folder-open">
      <path
        id="Vector"
        d="M5 11.6667L6.25 9.25A1.6667 1.6667 0 0 1 7.7 8.3333H16.6667A1.6667 1.6667 0 0 1 18.2833 10.4167L17 15.4167A1.6667 1.6667 0 0 1 15.375 16.6667H3.3333A1.6667 1.6667 0 0 1 1.6667 15V4.1667A1.6667 1.6667 0 0 1 3.3333 2.5H6.5833A1.6667 1.6667 0 0 1 7.9917 3.25L8.6667 4.25A1.6667 1.6667 0 0 0 10.0583 5H15A1.6667 1.6667 0 0 1 16.6667 6.6667V8.3333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)
