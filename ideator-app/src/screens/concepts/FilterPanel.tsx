import Accordion from '@/components/composites/Accordion.tsx'
import Checkbox from '@/components/ui/Checkbox.tsx'
import Button from '@/components/ui/Button.tsx'

export interface LevelFilterData {
  level: 'L1_SPECIFIC' | 'L2_APPROACH' | 'L3_PARADIGM'
  label: string
  domains: string[]
  themes: string[]
}

interface FilterPanelProps {
  levelFilters: LevelFilterData[]
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
  levelFilters,
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
    <aside className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-5">
      {levelFilters.map((lf) => (
        <Accordion key={lf.level} title={lf.label} defaultOpen={true}>
          <div className="flex flex-col gap-3">
            <Checkbox
              label={`All ${lf.label}`}
              checked={selectedLevels.includes(lf.level)}
              onChange={() => onLevelsChange(toggleItem(selectedLevels, lf.level))}
            />

            {lf.domains.length > 0 && (
              <div className="flex flex-col gap-2 pl-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Domains
                </h5>
                {lf.domains.map((d) => (
                  <Checkbox
                    key={d}
                    label={d}
                    checked={selectedDomains.includes(d)}
                    onChange={() => onDomainsChange(toggleItem(selectedDomains, d))}
                  />
                ))}
              </div>
            )}

            {lf.themes.length > 0 && (
              <div className="flex flex-col gap-2 pl-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Themes
                </h5>
                {lf.themes.map((t) => (
                  <Checkbox
                    key={t}
                    label={t}
                    checked={selectedThemes.includes(t)}
                    onChange={() => onThemesChange(toggleItem(selectedThemes, t))}
                  />
                ))}
              </div>
            )}
          </div>
        </Accordion>
      ))}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </aside>
  )
}
