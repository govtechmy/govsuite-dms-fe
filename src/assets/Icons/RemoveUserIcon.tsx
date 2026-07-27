type RemoveUserIconProps = {
  className?: string
}

export default function RemoveUserIcon({ className }: RemoveUserIconProps) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 5.55C7.07696 5.55 7.95 4.67696 7.95 3.6C7.95 2.52305 7.07696 1.65 6 1.65C4.92305 1.65 4.05 2.52305 4.05 3.6C4.05 4.67696 4.92305 5.55 6 5.55Z"
        stroke="white"
        stroke-width="0.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M2.9085 10.35H9.0915C9.77664 10.35 10.3044 9.76086 9.98448 9.15504C9.51378 8.26386 8.4408 7.2 6 7.2C3.55921 7.2 2.4862 8.26386 2.01554 9.15504C1.69558 9.76086 2.22335 10.35 2.9085 10.35Z"
        stroke="white"
        stroke-width="0.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M11 15.35C13.4024 15.35 15.35 13.4024 15.35 11C15.35 8.59756 13.4024 6.65 11 6.65C8.59756 6.65 6.65 8.59756 6.65 11C6.65 13.4024 8.59756 15.35 11 15.35Z"
        fill="white"
      />

      <path d="M12.8 9.2L9.2 12.8L12.8 9.2Z" fill="white" />

      <path d="M9.2 9.2L12.8 12.8L9.2 9.2Z" fill="white" />

      <path
        d="M12.8 9.2L9.2 12.8M9.2 9.2L12.8 12.8M15.35 11C15.35 13.4024 13.4024 15.35 11 15.35C8.59756 15.35 6.65 13.4024 6.65 11C6.65 8.59756 8.59756 6.65 11 6.65C13.4024 6.65 15.35 8.59756 15.35 11Z"
        stroke="#DC2626"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
