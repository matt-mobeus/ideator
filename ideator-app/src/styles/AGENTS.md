<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Styles and Design Tokens

## Purpose

CSS modules, design tokens, and styling utilities providing consistent visual language across the application. Defines color palettes, typography scales, spacing units, and component-specific styles. Uses CSS custom properties for theming and Tailwind CSS for utility-first styling.

## Key Files

Located in this directory (specific files not enumerated)

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **CSS Custom Properties**: Use `var(--token-name)` in styles
2. **Tailwind Utilities**: Prefer utility classes over custom CSS
3. **Design Tokens**: Define tokens for colors, spacing, typography
4. **Theme Support**: Structure tokens to support light/dark themes
5. **Consistency**: Reference tokens instead of hardcoded values

### Testing

- Verify CSS variables are defined and accessible
- Test theme switching (if implemented)
- Validate responsive breakpoints
- Check color contrast for accessibility

### Common Patterns

- **Token Definition**: `:root { --color-primary: #3b82f6; }`
- **Token Usage**: `color: var(--color-primary);`
- **Tailwind Config**: Extend with custom tokens in `tailwind.config.js`
- **CSS Modules**: `import styles from './Component.module.css'`

## Dependencies

### Internal
- Used by all components for styling
- May reference design system documentation

### External
- **Tailwind CSS 4** - Utility-first framework
- **PostCSS** - CSS processing

<!-- MANUAL: -->
