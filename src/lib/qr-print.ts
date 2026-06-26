/** Opens a print dialog with a branded standee layout matching the Figma QR card. */

const STANDEE_STARS = [
  { top: '5.95%', right: '16.05%' },
  { top: '23.81%', right: '6.34%' },
  { bottom: '9.72%', left: '8%' },
  { bottom: '10.91%', right: '8.62%' },
  { top: '6.1%', left: '16.57%' },
  { top: '50%', left: '4%' },
  { top: '48.51%', right: '4%' },
  { bottom: '25.05%', left: '3.14%' },
  { top: '25.89%', left: '4.29%' },
  { bottom: '29.36%', right: '4.05%' },
  { bottom: '5.11%', left: '49.14%' },
  { top: '46.43%', right: '4.05%' },
] as const

function starMarkup() {
  return STANDEE_STARS.map((star) => {
    const style = Object.entries(star)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
    return `<span class="star" style="${style}">★</span>`
  }).join('')
}

export function printQrStandee(opts: {
  qrCodeDataUrl: string
  slug: string
  businessName: string
}) {
  const { qrCodeDataUrl, businessName } = opts

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${businessName} — LoyalGenie QR Standee</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 0; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .standee {
      position: relative;
      width: 350px;
      overflow: hidden;
      border-radius: 20px;
      background: linear-gradient(180deg, #420467 58.705%, #2d110d 122.99%);
      color: #fff;
      text-align: center;
      padding: 34px 24px 32px;
    }
    .star {
      position: absolute;
      color: rgba(250, 212, 153, 0.29);
      font-size: 15px;
      line-height: 1;
      pointer-events: none;
    }
    .content { position: relative; }
    .genie { width: 90px; height: 90px; display: block; margin: 0 auto; }
    h1 {
      margin-top: 23px;
      font-size: 24px;
      font-weight: 600;
      text-transform: capitalize;
      color: #fff;
    }
    .tagline {
      margin-top: 4px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .tagline .gold { color: #f6a800; }
    .qr-card {
      margin: 20px auto 0;
      width: 235px;
      padding: 20px 20px 16px;
      border-radius: 10px;
      background: rgba(217, 217, 217, 0.1);
      border: 1px solid rgba(177, 138, 70, 0.31);
    }
    .qr-card img {
      width: 160px;
      height: 160px;
      background: #fff;
      border-radius: 10px;
      display: block;
      margin: 0 auto;
      object-fit: contain;
    }
    .scan {
      margin-top: 17px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }
    .pill {
      margin: 12px auto 0;
      width: 175px;
      height: 29px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: 1px solid #b18a46;
      color: #b18a46;
      font-size: 10px;
      font-weight: 500;
    }
    .pill .upper { text-transform: uppercase; }
    .footer { margin-top: 53px; }
    .logo {
      position: relative;
      display: inline-block;
      font-size: 24px;
      font-weight: 600;
    }
    .logo .gold { color: #f6a800; }
    .sub {
      margin-top: 4px;
      font-size: 10px;
      color: #afadad;
    }
    .biz-name {
      margin-top: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: rgba(255, 255, 255, 0.7);
    }
  </style>
</head>
<body>
  <div class="standee">
    ${starMarkup()}
    <div class="content">
      <img class="genie" src="${window.location.origin}/qr/genie.svg" alt="" />
      <h1>Loyalty Granted</h1>
      <p class="tagline">SHAKE IT! <span class="gold">WIN IT!</span></p>
      <div class="qr-card">
        <img src="${qrCodeDataUrl}" alt="QR Code" />
        <p class="scan">SCAN TO JOIN</p>
        <div class="pill">ONE TAP. <span class="upper">Infinite Rewards</span></div>
      </div>
      <div class="footer">
        <p class="logo">Loyal<span class="gold">Genie</span></p>
        <p class="sub">Magical Interaction for Businesses</p>
        <p class="biz-name">${businessName}</p>
      </div>
    </div>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=400,height=760')
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
