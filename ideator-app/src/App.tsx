import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell, MobileBlock } from '@/components/layout'
import { TopNav, SettingsModal, PageLayout } from '@/components/global'
import { ErrorBoundary } from '@/components/global/ErrorBoundary'
import UploadScreen from '@/screens/upload'
import ConceptsScreen from '@/screens/concepts'
import AnalyzeScreen from '@/screens/analyze/AnalyzeScreen.tsx'
import ResultsScreen from '@/screens/results/ResultsScreen.tsx'
import ExplorerScreen from '@/screens/explorer/ExplorerScreen.tsx'
import ProvenanceScreen from '@/screens/provenance/ProvenanceScreen.tsx'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <ErrorBoundary>
      <MobileBlock>
        <BrowserRouter>
          <AppShell>
            <TopNav onSettingsClick={() => setSettingsOpen(true)} />
            <main
              className="flex-1 overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <Routes>
                {/* Upload screen */}
                <Route path="/upload" element={<PageLayout><UploadScreen /></PageLayout>} />

                {/* Concepts screen */}
                <Route path="/concepts" element={<PageLayout><ConceptsScreen /></PageLayout>} />

                {/* Analyze screen (with ID param) */}
                <Route path="/analyze/:id" element={<PageLayout><AnalyzeScreen /></PageLayout>} />

                {/* Provenance screen (with ID param) */}
                <Route path="/provenance/:id" element={<PageLayout><ProvenanceScreen /></PageLayout>} />

                {/* Results screen */}
                <Route path="/results" element={<PageLayout><ResultsScreen /></PageLayout>} />

                {/* Explore screen (with ID param) */}
                <Route path="/explore/:id" element={<PageLayout variant="full"><ExplorerScreen /></PageLayout>} />

                {/* Default redirect to upload */}
                <Route path="/" element={<Navigate to="/upload" replace />} />
              </Routes>
            </main>
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </AppShell>
        </BrowserRouter>
      </MobileBlock>
    </ErrorBoundary>
  )
}
