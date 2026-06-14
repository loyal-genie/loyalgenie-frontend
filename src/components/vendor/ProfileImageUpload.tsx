import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/input'
import { readFileAsDataUrl, readFilesAsDataUrls } from '@/lib/file-upload'

interface ProfileImageUploadProps {
  label: string
  hint?: string
  value?: string
  values?: string[]
  onChange?: (dataUrl: string) => void
  onMultiChange?: (dataUrls: string[]) => void
  multiple?: boolean
}

export function ProfileImageUpload({
  label,
  hint,
  value,
  values,
  onChange,
  onMultiChange,
  multiple = false,
}: ProfileImageUploadProps) {
  const previews = multiple ? (values ?? []) : value ? [value] : []

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    try {
      if (multiple && onMultiChange) {
        const urls = await readFilesAsDataUrls(fileList)
        onMultiChange([...(values ?? []), ...urls])
      } else if (onChange) {
        const url = await readFileAsDataUrl(fileList[0])
        onChange(url)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <label className="w-full rounded-xl flex items-center gap-3 px-4 py-4 cursor-pointer transition-all border border-dashed border-v-border bg-v-surface-2 hover:border-v-purple/40 hover:bg-v-surface">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Upload className="w-5 h-5 shrink-0 text-v-text-3" />
        <span className="text-sm text-v-text-2">{hint ?? 'Click to upload'}</span>
      </label>
      {previews.length > 0 && (
        <div className={cn('flex flex-wrap gap-2', multiple && 'grid grid-cols-2 sm:grid-cols-3')}>
          {previews.map((src, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border border-v-border">
              <img
                src={src}
                alt=""
                className={cn('object-cover', multiple ? 'w-full h-24' : 'h-20 w-auto max-w-full')}
              />
              <button
                type="button"
                onClick={() => {
                  if (multiple && onMultiChange) {
                    onMultiChange((values ?? []).filter((_, idx) => idx !== i))
                  } else if (onChange) {
                    onChange('')
                  }
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center cursor-pointer border-0"
                aria-label="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
