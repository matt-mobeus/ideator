export { searchWeb } from './web-search-client.ts'
export type { SearchApiResponse } from './web-search-client.ts'

export {
  buildMarketQuery,
  buildTechQuery,
  buildInvestmentQuery,
} from './query-builder.ts'

export { enrichResults } from './enrichment.ts'
export type { EnrichedResults } from './enrichment.ts'

export { aggregateSearchResults } from './aggregator.ts'
