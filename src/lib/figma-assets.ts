/** Local copies of Figma MCP assets under /customer/figma/ */
export function figmaAsset(uuid: string, ext = 'png'): string {
  return `/customer/figma/${uuid}.${ext}`
}

export const FIGMA_ASSETS = {
  phoneVibrate: figmaAsset('0884d5c5-dccf-42bd-8421-bc0a2259ff15'),
} as const
