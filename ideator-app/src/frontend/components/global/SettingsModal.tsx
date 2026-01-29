// ============================================================================
// IDEATOR — Settings Modal (FE-3.3)
// ============================================================================

import { Modal } from '../composite/Modal';
import { Button } from '../primitives/Button';
import { useAppState } from '../../contexts/AppStateContext';

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useAppState();

  return (
    <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
      <div className="space-y-6">
        {/* API Keys */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">API Keys</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Keys are stored locally and never sent to any server except the provider.
          </p>
          {/* TODO: API key inputs */}
        </section>

        {/* Data */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Data</h3>
          <Button variant="danger">Clear All Data</Button>
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">About</h3>
          <p className="text-xs text-[var(--text-tertiary)]">IDEATOR v0.1.0</p>
        </section>
      </div>
    </Modal>
  );
}
