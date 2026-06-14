export const businessTypes = [
  'Café & Bakery',
  'Restaurant',
  'Quick Service Restaurant',
  'Salon & Spa',
  'Gym & Fitness',
  'Retail Store',
  'Pharmacy',
  'Pet Clinic',
  'Other',
]

export const brandColors = [
  '#7C3AED',
  '#EC4899',
  '#06B6D4',
  '#16A34A',
  '#D97706',
  '#DC2626',
  '#1D4ED8',
  '#0D9488',
]

export const onboardingSections = [
  { key: 'business', label: 'Business', steps: 2 },
  { key: 'branches', label: 'Branches', steps: 1 },
  { key: 'branding', label: 'Branding', steps: 2 },
  { key: 'qr', label: 'QR Code', steps: 1 },
] as const

export const formStepsTotal = onboardingSections
  .filter((s) => s.key !== 'qr')
  .reduce((sum, s) => sum + s.steps, 0)
