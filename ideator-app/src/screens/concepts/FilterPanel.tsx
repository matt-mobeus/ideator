import Checkbox from '@/components/ui/Checkbox.tsx'
import Button from '@/components/ui/Button.tsx'

interface FilterPanelProps {
  domains: string[]
  themes: string[]
  levels: string[]
  selectedDomains: string[]
  selectedThemes: string[]
  selectedLevels: string[]
  onDomainsChange: (domains: string[]) => void
  onThemesChange: (themes: string[]) => void
  onLevelsChange: (levels: string[]) => void
  onClear: () => void
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export default function FilterPanel({
  domains,
  themes,
  levels,
  selectedDomains,
  selectedThemes,
  selectedLevels,
  onDomainsChange,
  onThemesChange,
  onLevelsChange,
  onClear,
}: FilterPanelProps) {
  const hasFilters = selectedDomains.length > 0 || selectedThemes.length > 0 || selectedLevels.length > 0

  return (
    <aside className="flex flex-col gap-6 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-4">
      <Section title="Domains">
        {domains.map((d) => (
          <Checkbox
            key={d}
            label={d}
            checked={selectedDomains.includes(d)}
            onChange={() => onDomainsChange(toggleItem(selectedDomains, d))}
          />
        ))}
      </Section>

      <Section title="Themes">
        {themes.map((t) => (
          <Checkbox
            key={t}
            label={t}
            checked={selectedThemes.includes(t)}
            onChange={() => onThemesChange(toggleItem(selectedThemes, t))}
          />
        ))}
      </Section>

      <Section title="Abstraction Levels">
        {levels.map((l) => (
          <Checkbox
            key={l}
            label={l}
            checked={selectedLevels.includes(l)}
            onChange={() => onLevelsChange(toggleItem(selectedLevels, l))}
          />
        ))}
      </Section>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </aside>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {title}
      </h4>
      {children}
    </div>
  )
}
