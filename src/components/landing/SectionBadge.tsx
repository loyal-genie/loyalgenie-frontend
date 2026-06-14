export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-gold text-[13px] font-semibold mb-5">
      {children}
    </span>
  )
}
