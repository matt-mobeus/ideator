import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './frontend/layout/AppShell';
import { UploadScreen } from './frontend/screens/UploadScreen';
import { ConceptsScreen } from './frontend/screens/ConceptsScreen';
import { AnalysisScreen } from './frontend/screens/AnalysisScreen';
import { ProvenanceScreen } from './frontend/screens/ProvenanceScreen';
import { ResultsScreen } from './frontend/screens/ResultsScreen';
import { ExplorerScreen } from './frontend/screens/ExplorerScreen';
import { ToastProvider } from './frontend/contexts/ToastContext';
import { AppStateProvider } from './frontend/contexts/AppStateContext';

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <ToastProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/upload" element={<UploadScreen />} />
              <Route path="/concepts" element={<ConceptsScreen />} />
              <Route path="/analyze/:conceptId" element={<AnalysisScreen />} />
              <Route path="/provenance/:conceptId" element={<ProvenanceScreen />} />
              <Route path="/results" element={<ResultsScreen />} />
              <Route path="/explore/:conceptId" element={<ExplorerScreen />} />
            </Routes>
          </AppShell>
        </ToastProvider>
      </AppStateProvider>
    </BrowserRouter>
  );
}
