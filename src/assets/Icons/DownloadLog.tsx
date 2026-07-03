type DownloadIconProps = {
  className?: string
}

export default function DownloadIcon({ className }: DownloadIconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 7.95V9.95C0.75 11.2755 1.82452 12.35 3.15 12.35H9.95C11.2755 12.35 12.35 11.2755 12.35 9.95V7.95M6.55 8.35V0.75M9.15 5.55L6.55 8.35L3.95 5.55"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
