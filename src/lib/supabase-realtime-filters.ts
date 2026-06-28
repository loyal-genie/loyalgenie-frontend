/** Build Supabase Realtime `in` filter for text campaign ids (nanoid-safe quoting). */
export function campaignIdsRealtimeFilter(campaignIds: string[]): string | undefined {
  if (campaignIds.length === 0) return undefined
  const list = campaignIds.map(id => `"${id}"`).join(',')
  return `campaign_id=in.(${list})`
}
