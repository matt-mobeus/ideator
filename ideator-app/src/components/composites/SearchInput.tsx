import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import Icon from '@/components/ui/Icon.tsx'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, className, value, ...props }, ref) => {
    return (
      <div className={clsx('relative', className)}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
          <Icon name="search" size={16} />
        </span>
        <input
          ref={ref}
          type="search"
          value={value}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] py-2 pl-9 pr-8 text-sm outline-none transition-all duration-[var(--transition-default)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:shadow-[var(--glow-cyan)]"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 transition-colors hover:text-[var(--color-red)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Clear search"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'
export default SearchInput
