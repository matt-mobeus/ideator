import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell, MobileBlock } from '@/components/layout'
import { TopNav, SettingsModal } from '@/components/global'
import UploadScreen from '@/screens/upload'
import ConceptsScreen from '@/screens/concepts'
import AnalyzeScreen from '@/screens/analyze/AnalyzeScreen.tsx'
import ResultsScreen from '@/screens/results/ResultsScreen.tsx'
import ExplorerScreen from '@/screens/explorer/ExplorerScreen.tsx'
import ProvenanceScreen from '@/screens/provenance/ProvenanceScreen.tsx'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
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
              <Route path="/upload" element={<UploadScreen />} />

              {/* Concepts screen */}
              <Route path="/concepts" element={<ConceptsScreen />} />

              {/* Analyze screen (with ID param) */}
              <Route path="/analyze/:id" element={<AnalyzeScreen />} />

              {/* Provenance screen (with ID param) */}
              <Route path="/provenance/:id" element={<ProvenanceScreen />} />

              {/* Results screen */}
              <Route path="/results" element={<ResultsScreen />} />

              {/* Explore screen (with ID param) */}
              <Route path="/explore/:id" element={<ExplorerScreen />} />

              {/* Default redirect to upload */}
              <Route path="/" element={<Navigate to="/upload" replace />} />
            </Routes>
          </main>
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </AppShell>
      </BrowserRouter>
    </MobileBlock>
  )
}
