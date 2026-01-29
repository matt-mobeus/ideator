import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../../contexts/AppStateContext';

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasConcepts, setSearchOpen, setSettingsOpen } = useAppState();

  const handleLogoClick = () => {
    navigate(hasConcepts ? '/concepts' : '/upload');
  };

  const navItems = [
    { path: '/upload', label: 'Upload' },
    { path: '/concepts', label: 'Concepts' },
    { path: '/results', label: 'Results' },
  ];

  return (
    <nav className="h-14 flex items-center justify-between px-6 border-b border-[var(--bg-tertiary)] bg-[var(--bg-secondary)]">
      {/* Logo */}
      <button
        onClick={handleLogoClick}
        className="text-xl font-bold tracking-widest text-[var(--accent-nav)] hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        IDEATOR
      </button>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`text-sm transition-colors ${
              location.pathname.startsWith(item.path)
                ? 'text-[var(--accent-nav)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Search (Ctrl+K)"
        >
          Search
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Settings
        </button>
      </div>
    </nav>
  );
}
