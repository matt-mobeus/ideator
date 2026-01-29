import type { ReactNode } from 'react';
import { TopNav } from '../components/global/TopNav';
import { ToastContainer } from '../components/global/ToastContainer';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile block */}
      <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)] p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            IDEATOR
          </h1>
          <p className="text-[var(--text-secondary)]">
            Please use a desktop or tablet device for the best experience.
          </p>
        </div>
      </div>

      {/* Desktop/tablet layout */}
      <div className="hidden md:flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
