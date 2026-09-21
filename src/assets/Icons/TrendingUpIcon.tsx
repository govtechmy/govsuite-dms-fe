import type { FunctionComponent, SVGProps } from 'react'

/**
 * Trending Up Icon
 * Not shipped by @govtechmy/myds-react/icon — authored locally to match its
 * icon conventions (20x20 viewBox, 1.5 stroke, round caps/joins, currentColor)
 * so it drops in anywhere a MYDS icon would.
 * @param className
 * @returns TrendingUpIcon
 */
export const TrendingUpIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Icon/trending-up">
      <path
        id="Arrowhead"
        d="M13.3333 5.8333H18.3333V10.8333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        id="Line"
        d="M18.3333 5.8333L11.25 12.9167L7.0833 8.75L1.6667 14.1667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)
