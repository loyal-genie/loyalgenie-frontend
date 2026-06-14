import { useState } from 'react'
import { Check, Copy, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QrStandeeCard } from '@/components/qr/QrStandeeCard'
import { VendorPageHeader } from '@/components/vendor/VendorPageHeader'
import { useBusinessQr } from '@/hooks/useBusinessProfile'
import { downloadQrPng, printQrStandee } from '@/lib/qr-print'
import { displayJoinPath } from '@/lib/reserved-slugs'

export function VendorQrCodePage() {
  const { data: qr, isLoading, error } = useBusinessQr()
  const [copied, setCopied] = useState(false)

  async function copyUrl() {
    if (!qr) return
    await navigator.clipboard.writeText(qr.joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl">
        <p className="text-v-text-2 text-sm">Loading your QR code…</p>
      </div>
    )
  }

  if (error || !qr) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl">
        <VendorPageHeader title="My QR Code" subtitle="Could not load your QR code. Complete onboarding first." />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl space-y-6">
      <VendorPageHeader
        title="My QR Code"
        subtitle="Share this standee at your counter so customers can scan and join your loyalty program."
      />

      <div className="flex flex-col items-center gap-6">
        <QrStandeeCard
          qrCodeDataUrl={qr.qrCodeDataUrl}
          slug={qr.qrSlug}
          businessName={qr.businessName}
        />

        <Card className="w-full p-4">
          <p className="text-xs font-semibold text-v-text-2 mb-2">Share link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm truncate font-mono text-v-purple">{displayJoinPath(qr.qrSlug)}</code>
            <Button type="button" variant="outline" size="sm" onClick={copyUrl}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3 w-full">
          <Button
            type="button"
            variant="primary"
            className="flex-1 min-w-[140px] w-full sm:w-auto"
            onClick={() => printQrStandee({ qrCodeDataUrl: qr.qrCodeDataUrl, slug: qr.qrSlug, businessName: qr.businessName })}
          >
            <Printer className="w-4 h-4" /> Print Standee
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-w-[140px] w-full sm:w-auto"
            onClick={() => downloadQrPng(qr.qrCodeDataUrl, qr.businessName)}
          >
            <Download className="w-4 h-4" /> Download QR
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-v-text">Order Printed Standee</h2>
            <p className="text-xs text-v-text-3 mt-0.5">We print and courier a branded counter standee within 5 business days.</p>
          </div>
          <Button variant="primary" size="sm">Order Standee →</Button>
        </div>
        <p className="text-xs text-v-text-2 leading-relaxed">
          Your standee includes your business name, QR code, and a clear call-to-action — ready to place next to your billing counter, just like Google Pay or Paytm.
        </p>
      </Card>
    </div>
  )
}
