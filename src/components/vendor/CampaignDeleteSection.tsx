import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldInput as Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/lib/api'
import { useDeleteCampaign } from '@/hooks/useCampaigns'

interface CampaignDeleteSectionProps {
  campaignId: string
  campaignName: string
  participations?: number
  onDeleted?: () => void
}

export function CampaignDeleteSection({
  campaignId,
  campaignName,
  participations = 0,
  onDeleted,
}: CampaignDeleteSectionProps) {
  const deleteMutation = useDeleteCampaign()
  const [open, setOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [error, setError] = useState('')

  const canDelete = confirmName.trim() === campaignName.trim()

  const handleDelete = async () => {
    setError('')
    try {
      await deleteMutation.mutateAsync(campaignId)
      onDeleted?.()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete campaign'))
    }
  }

  return (
    <Card className="p-6 border border-red-200 bg-red-50/40">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4 text-v-danger" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-v-danger">Delete campaign</h2>
          <p className="text-xs text-v-text-3 mt-1 leading-relaxed">
            Permanently removes this campaign and all related data: reward tiers, participations,
            game plays, customer rewards, stamp cards, and loyalty cards.
            {participations > 0 && (
              <> This campaign has <strong className="text-v-text">{participations}</strong> participant{participations !== 1 ? 's' : ''}.</>
            )}
            {' '}This cannot be undone.
          </p>

          {error && (
            <p className="text-xs text-v-danger mt-2">{error}</p>
          )}

          {!open ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="mt-4"
              onClick={() => {
                setOpen(true)
                setConfirmName('')
                setError('')
              }}
            >
              <Trash2 className="w-4 h-4" /> Delete campaign
            </Button>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-v-text">
                Type <strong>{campaignName}</strong> to confirm:
              </p>
              <Input
                value={confirmName}
                onChange={e => setConfirmName(e.target.value)}
                placeholder={campaignName}
                autoComplete="off"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    setOpen(false)
                    setConfirmName('')
                    setError('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={!canDelete || deleteMutation.isPending}
                  onClick={() => void handleDelete()}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete permanently
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
