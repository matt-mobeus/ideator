<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Configuration

## Purpose

Centralized configuration for application behavior and network settings. Defines retry policies, timeout values, rate limits, and application-level constants. Provides single source of truth for tunable parameters used across services and network layers.

## Key Files

| File | Description |
|------|-------------|
| `app.config.ts` | Application configuration: batch sizes, delays, feature flags |
| `network.config.ts` | Network configuration: timeouts, retries, rate limiting |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Import Pattern**: `import { appConfig } from '@/config/app.config'`
2. **Modification**: Change config values here, not hardcoded in services
3. **Environment**: Currently no env variable support, all values hardcoded
4. **Type Safety**: Config objects are typed and exported as const

### Testing

- Verify config values are used consistently across codebase
- Test timeout/retry behavior by temporarily lowering values
- Check batch size impacts on performance

### Common Patterns

- **Centralized Values**: All magic numbers should be defined here
- **Sensible Defaults**: Production-ready values with conservative limits
- **Documentation**: Each config value should have inline comment explaining purpose

## Dependencies

### Internal
- Used by `network/` layer for HTTP client configuration
- Used by `services/` for batch processing and delays
- May be used by workers for processing parameters

### External
- None (pure configuration objects)

<!-- MANUAL: -->
