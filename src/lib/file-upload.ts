const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB per file

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error(`File too large (max ${MAX_IMAGE_BYTES / 1024 / 1024}MB)`))
      return
    }
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
