export const PASSWORD_MIN_LENGTH = 12

export interface PasswordRequirement {
  key: string
  label: string
  test: (value: string) => boolean
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: 'length',
    label: `Sekurang-kurangnya ${PASSWORD_MIN_LENGTH} aksara`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: 'uppercase',
    label: 'Sekurang-kurangnya 1 huruf besar (A-Z)',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'lowercase',
    label: 'Sekurang-kurangnya 1 huruf kecil (a-z)',
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: 'number',
    label: 'Sekurang-kurangnya 1 nombor (0-9)',
    test: (value) => /[0-9]/.test(value),
  },
  {
    key: 'specialChar',
    label: 'Sekurang-kurangnya 1 aksara khas (cth: ! @ # $ %)',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
]

export const isPasswordPolicyMet = (password: string): boolean =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password))
