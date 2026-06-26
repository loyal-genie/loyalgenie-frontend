export function parseDateOfBirth(iso?: string): { day: string; month: string; year: string } {
  if (!iso) return { day: '', month: '', year: '' }
  const [year, month, day] = iso.split('-')
  return {
    day: day ?? '',
    month: month ? String(parseInt(month, 10)) : '',
    year: year ?? '',
  }
}

export const PROFILE_FIELD_LABELS = {
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
  email: 'Email',
} as const
