import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBusinessQr } from '@/hooks/useBusinessProfile'
import { displayJoinPath } from '@/lib/reserved-slugs'

export function VendorSettingsQrTab() {
  const { data: qr, isLoading } = useBusinessQr()
  const [copied, setCopied] = useState(false)

  const joinPath = qr ? displayJoinPath(qr.qrSlug) : '…'
  const businessName = qr?.businessName ?? 'Your business'

  async function handleCopy() {
    if (!qr) return
    const url = qr.joinUrl ?? `https://${joinPath}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-base font-bold text-v-text mb-1">QR Code</h2>
        <p className="text-xs text-v-text-3 mb-6">Print and place this on your counter. Customers scan to access all active campaigns.</p>
        <div className="flex flex-col sm:flex-row items-start gap-8">
          <div className="w-36 h-36 rounded-2xl bg-white flex items-center justify-center p-3 border border-v-border shrink-0 mx-auto sm:mx-0">
            {qr?.qrCodeDataUrl ? (
              <img src={qr.qrCodeDataUrl} alt="QR code" className="w-full h-full object-contain" />
            ) : isLoading ? (
              <div className="text-xs text-v-text-3">Loading…</div>
            ) : (
              <div className="text-xs text-v-text-3 text-center px-2">QR unavailable</div>
            )}
          </div>
          <div className="flex-1 w-full">
            <div className="text-xs text-v-text-3 mb-1.5">Customer loyalty URL</div>
            <div className="flex items-center gap-2 mb-5">
              <code className="text-xs text-v-purple bg-v-surface-2 border border-v-border px-3 py-2 rounded-lg flex-1 truncate">{joinPath}</code>
              <Button variant="ghost" size="sm" type="button" onClick={handleCopy} disabled={!qr}>
                {copied ? <Check className="w-3.5 h-3.5 text-v-success" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/vendor/qr-code">
                <Button variant="primary" size="sm"><Download className="w-3.5 h-3.5" /> Full QR Tools</Button>
              </Link>
            </div>
            <p className="text-[11px] text-v-text-3 mt-4 leading-relaxed">
              Place the QR on your counter, menu card, or receipt. Customers scan it with any camera app to instantly join your loyalty program.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-v-text">Counter Standee Preview</h2>
            <p className="text-xs text-v-text-3 mt-0.5">We&apos;ll print and courier this to you within 5 business days.</p>
          </div>
          <Button variant="primary" size="sm">Order Standee →</Button>
        </div>
        <div className="w-48 mx-auto rounded-2xl border border-v-border overflow-hidden shadow-lg">
          <div className="h-16 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1A1840, #7C3AED)' }}>
            <span className="text-lg font-black text-white">Loyal<span style={{ color: '#F5C518' }}>Genie</span></span>
          </div>
          <div className="bg-white p-4 text-center">
            <p className="text-[10px] text-gray-400 mb-2">Scan to win rewards</p>
            <div className="w-20 h-20 bg-gray-100 rounded-xl mx-auto flex items-center justify-center border border-gray-200">
              {qr?.qrCodeDataUrl ? (
                <img src={qr.qrCodeDataUrl} alt="" className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-[9px] text-gray-300">QR code</span>
              )}
            </div>
            <p className="text-xs font-bold text-gray-800 mt-2">{businessName}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
