import { Link, useLocation } from 'react-router-dom'
import Accordion from '@/components/composites/Accordion.tsx'
import Checkbox from '@/components/ui/Checkbox.tsx'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'
import type { LevelFilterData } from './FilterPanel.tsx'

interface ConceptsSidebarProps {
  // Navigation context
  selectedConceptId: string | null

  // Pipeline status
  pipelineState: 'idle' | 'running' | 'done' | 'error'
  conceptCount: number
  domainCount: number
  extractionTime?: Date

  // Filter props (pass-through from existing FilterPanel)
  levelFilters: LevelFilterData[]
  selectedDomains: string[]
  selectedThemes: string[]
  selectedLevels: string[]
  onDomainsChange: (domains: string[]) => void
  onThemesChange: (themes: string[]) => void
  onLevelsChange: (levels: string[]) => void
  onClear: () => void
}

function SidebarNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const active = location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
      style={{
        color: active ? 'var(--color-cyan)' : 'var(--text-secondary)',
        background: active ? 'rgba(0, 229, 255, 0.08)' : undefined
      }}
    >
      {children}
    </Link>
  )
}

function getStatusBadge(state: 'idle' | 'running' | 'done' | 'error') {
  switch (state) {
    case 'idle': return <Badge variant="gray">Idle</Badge>
    case 'running': return <Badge variant="cyan">Running</Badge>
    case 'done': return <Badge variant="green">Done</Badge>
    case 'error': return <Badge variant="orange">Error</Badge>
  }
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export default function ConceptsSidebar({
  selectedConceptId,
  pipelineState,
  conceptCount,
  domainCount,
  extractionTime,
  levelFilters,
  selectedDomains,
  selectedThemes,
  selectedLevels,
  onDomainsChange,
  onThemesChange,
  onLevelsChange,
  onClear,
}: ConceptsSidebarProps) {
  const hasFilters = selectedDomains.length > 0 || selectedThemes.length > 0 || selectedLevels.length > 0

  return (
    <aside className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-5">
      {/* Section 1: Navigation */}
      <Accordion title="Navigation" defaultOpen={true}>
        <nav className="flex flex-col gap-2">
          <SidebarNavLink to="/upload">Upload</SidebarNavLink>
          <SidebarNavLink to="/concepts">Concepts</SidebarNavLink>
          <SidebarNavLink to="/results">Results</SidebarNavLink>

          {selectedConceptId && (
            <>
              <SidebarNavLink to={`/analyze/${selectedConceptId}`}>Analyze</SidebarNavLink>
              <SidebarNavLink to={`/provenance/${selectedConceptId}`}>Provenance</SidebarNavLink>
              <SidebarNavLink to={`/explore/${selectedConceptId}`}>Explore</SidebarNavLink>
            </>
          )}
        </nav>
      </Accordion>

      {/* Section 2: Pipeline Status */}
      <Accordion title="Pipeline Status" badge={getStatusBadge(pipelineState)} defaultOpen={true}>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span>{pipelineState}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Concepts</span>
            <span>{conceptCount}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Domains</span>
            <span>{domainCount}</span>
          </div>
          {extractionTime && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Extracted</span>
              <span>{extractionTime.toLocaleString()}</span>
            </div>
          )}
        </div>
      </Accordion>

      {/* Section 3: Filters */}
      <Accordion title="Filters" badge={hasFilters ? <Badge variant="cyan">Active</Badge> : undefined} defaultOpen={true}>
        <div className="flex flex-col gap-4">
          {levelFilters.map((lf) => (
            <div key={lf.level} className="flex flex-col gap-3">
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
          ))}

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear filters
            </Button>
          )}
        </div>
      </Accordion>
    </aside>
  )
}
