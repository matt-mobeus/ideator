// ============================================================================
// IDEATOR — Filter Engine (BE-8.2)
// Concept and result filtering
// ============================================================================

import type { Concept, AnalysisResult, ConceptFilters, AnalysisFilters } from '../../shared/types';
import { StorageService } from '../storage/StorageService';

export class FilterEngine {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async filterConcepts(filters: ConceptFilters): Promise<Concept[]> {
    return this.storage.getConcepts(filters);
  }

  async filterAnalyses(filters: AnalysisFilters): Promise<AnalysisResult[]> {
    return this.storage.getAnalyses(filters);
  }

  async getAvailableDomains(): Promise<string[]> {
    const concepts = await this.storage.getConcepts();
    const domains = new Set(concepts.map((c) => c.domain));
    return Array.from(domains).sort();
  }

  async getAvailableSourceFiles(): Promise<Array<{ id: string; name: string }>> {
    const files = await this.storage.getAllFiles();
    return files.map((f) => ({ id: f.id, name: f.name }));
  }
}
