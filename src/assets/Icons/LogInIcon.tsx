type LoginIconProps = {
  className?: string
}

export default function LoginIcon({ className }: LoginIconProps) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.25 1.64999H9.15C9.81274 1.64999 10.35 2.18725 10.35 2.84999V9.14999C10.35 9.81275 9.81274 10.35 9.15 10.35H5.25"
        stroke="white"
        stroke-width="0.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.81946 7.94999L6.91946 5.99999L4.81946 4.04999M6.91946 5.99999H1.21946"
        stroke="white"
        stroke-width="0.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
