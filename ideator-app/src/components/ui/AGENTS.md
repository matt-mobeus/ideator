<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Base UI Components

## Purpose

Foundational UI primitives providing consistent, reusable building blocks. Implements design system patterns with variants, sizes, and states. All components are fully typed, accessible, and styled with Tailwind utilities following design tokens.

## Key Files

| File | Description |
|------|-------------|
| `Button.tsx` | Button with variants (primary, secondary, ghost) and sizes |
| `Input.tsx` | Text input with validation states and icons |
| `Icon.tsx` | Icon component with extensive icon set |
| `Select.tsx` | Dropdown select with keyboard navigation |
| `Checkbox.tsx` | Checkbox input with label support |
| `Radio.tsx` | Radio button input |
| `Toggle.tsx` | Toggle switch component |
| `TextArea.tsx` | Multi-line text input |
| `Badge.tsx` | Label/badge with color variants |
| `Tag.tsx` | Removable tag/chip component |
| `Tooltip.tsx` | Hover tooltip with positioning |
| `index.ts` | Component exports |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Variants**: Use `variant` prop for visual styles (primary, secondary, etc.)
2. **Sizes**: Support sm, md, lg sizes where applicable
3. **States**: Disabled, loading, error states with visual feedback
4. **Accessibility**: Include ARIA attributes, keyboard support

### Testing

- Test all variants and sizes render correctly
- Verify disabled and loading states
- Test keyboard navigation (Tab, Enter, Space)
- Validate ARIA attributes with accessibility tools

### Common Patterns

- **Props Interface**: `interface ButtonProps extends React.ButtonHTMLAttributes`
- **Class Composition**: `clsx(baseClasses, variantClasses[variant], className)`
- **Forward Ref**: `React.forwardRef` for native element access
- **Icon Integration**: Support `icon` or `leftIcon`/`rightIcon` props

## Dependencies

### Internal
- `clsx` for conditional classes
- Design tokens via CSS custom properties
- Type definitions for props

### External
- **React 19** - Component framework
- **Tailwind CSS** - Utility classes

<!-- MANUAL: -->
