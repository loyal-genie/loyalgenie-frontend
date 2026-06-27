import { getActiveAuthRole, getToken } from './auth'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB per file

export type UploadPurpose = 'logo' | 'cover' | 'interior' | 'exterior'

function assertFileSize(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`File too large (max ${MAX_IMAGE_BYTES / 1024 / 1024}MB)`)
  }
}

function apiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
}

/** Upload image through the API (avoids R2 bucket CORS configuration). */
export async function uploadImageFile(
  file: File,
  purpose: UploadPurpose,
  options?: { index?: number; onboarding?: boolean },
): Promise<string> {
  assertFileSize(file)
  const contentType = file.type || 'image/jpeg'
  const path = options?.onboarding ? '/uploads/direct/onboarding' : '/uploads/direct'
  const params = new URLSearchParams({ purpose })
  if (options?.index != null) params.set('index', String(options.index))

  const role = getActiveAuthRole()
  const token = role ? getToken(role) : getToken()
  const headers: Record<string, string> = { 'Content-Type': contentType }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${apiBaseUrl()}${path}?${params}`, {
    method: 'POST',
    body: file,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = 'Failed to upload image'
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  const json = (await response.json()) as { success: boolean; data: { publicUrl: string } }
  return json.data.publicUrl
}

export async function uploadImageFiles(
  files: FileList | File[],
  purpose: UploadPurpose,
  options?: { onboarding?: boolean },
): Promise<string[]> {
  const list = Array.from(files)
  const urls: string[] = []
  for (let index = 0; index < list.length; index++) {
    urls.push(await uploadImageFile(list[index], purpose, { ...options, index }))
  }
  return urls
}

/** @deprecated Use uploadImageFile — kept for any legacy paths. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    assertFileSize(file)
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export async function readFilesAsDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files)
  return Promise.all(list.map(readFileAsDataUrl))
}
