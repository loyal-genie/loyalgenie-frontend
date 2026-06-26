/** Opens a print dialog with a branded standee layout matching the onboarding QR card. */
import { customerSignInPath } from '@/lib/reserved-slugs'

export function printQrStandee(opts: {
  qrCodeDataUrl: string
  slug: string
  businessName: string
}) {
  const { qrCodeDataUrl, slug, businessName } = opts
  const joinPath = customerSignInPath(slug)

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${businessName} — LoyalGenie QR Standee</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .standee {
      width: 320px;
      border-radius: 24px;
      overflow: hidden;
      background: linear-gradient(165deg, #1a0b4b 0%, #0d0b28 45%, #12082e 100%);
      color: #fff;
      text-align: center;
      padding: 32px 24px 28px;
      position: relative;
    }
    .nfc {
      position: absolute;
      top: 16px;
      right: 16px;
      opacity: 0.7;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
    }
    .genie { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
    .tagline { font-size: 13px; font-weight: 700; margin-bottom: 20px; }
    .tagline .gold { color: #f0c040; }
    .biz-name {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      opacity: 0.6;
      margin-bottom: 16px;
    }
    .qr-wrap {
      display: inline-block;
      padding: 16px;
      border-radius: 16px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      margin-bottom: 16px;
    }
    .qr-wrap img {
      width: 180px;
      height: 180px;
      background: #fff;
      border-radius: 8px;
      display: block;
    }
    .scan { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; opacity: 0.8; margin-bottom: 16px; }
    .pill {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 999px;
      border: 1px solid rgba(240,192,64,0.5);
      color: #f0c040;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 24px;
    }
    .footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .logo { font-size: 18px; font-weight: 900; }
    .logo .gold { color: #f0c040; }
    .sub { font-size: 10px; opacity: 0.4; margin-top: 4px; }
    .slug { font-size: 12px; color: rgba(240,192,64,0.8); font-family: monospace; margin-top: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="standee">
    <div class="nfc">NFC</div>
    <div class="genie">🧞</div>
    <h1>Loyalty Granted</h1>
    <p class="tagline">SHAKE IT! <span class="gold">GRAB IT!</span></p>
    <p class="biz-name">${businessName}</p>
    <div class="qr-wrap">
      <img src="${qrCodeDataUrl}" alt="QR Code" />
    </div>
    <p class="scan">SCAN OR TAP TO JOIN</p>
    <div class="pill">ONE TAP. INFINITE REWARDS.</div>
    <div class="footer">
      <p class="logo">Loyal<span class="gold">Genie</span> ✦✦✦</p>
      <p class="sub">Magical Interaction for Businesses</p>
      <p class="slug">${joinPath}</p>
    </div>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=400,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
}

export function downloadQrPng(qrCodeDataUrl: string, businessName: string) {
  const a = document.createElement('a')
  a.href = qrCodeDataUrl
  a.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-qr.png`
  a.click()
}
