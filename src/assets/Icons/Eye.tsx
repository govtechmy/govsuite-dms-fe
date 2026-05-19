import * as React from 'react'

export function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function EyeOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 3l18 18M10.73 10.73A3.5 3.5 0 0112 8.5c1.93 0 3.5 1.57 3.5 3.5 0 .47-.09.92-.26 1.33M6.53 6.53C4.06 8.36 2.27 10.97 1 12c1.73 4.39 6 7.5 11 7.5 2.03 0 3.96-.5 5.62-1.38M17.47 17.47C19.94 15.64 21.73 13.03 23 12c-1.73-4.39-6-7.5-11-7.5-1.61 0-3.16.25-4.61.7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
