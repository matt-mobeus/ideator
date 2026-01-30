/** Extracts concepts from user input and multiple files using AI analysis */
export { extractConcepts, extractFromMultipleFiles } from './concept-extraction.service.ts';

/** Clusters concepts by similarity and provides access to clustered data */
export { clusterConcepts, getClusteredConcepts } from './clustering.service.ts';

/** Builds AI prompts for concept extraction and clustering tasks */
export { buildExtractionPrompt, buildClusteringPrompt } from './prompt-builder.ts';

/** Manages a job queue for processing tasks with status tracking and lifecycle operations */
export { enqueue, dequeue, updateProgress, complete, fail, cancel, getByStatus, getByTargetId, getPending, getRunning, clearCompleted } from './job-queue.service.ts';

/** Analyzes concepts for market viability and stores analysis results */
export { analyzeConcept, analyzeAndStore } from './market-analysis.service.ts';

/** Processes jobs from the queue with continuous loop support */
export { processNext, processAll, startProcessingLoop } from './job-processor.service.ts';

/** Scores and grades concept validity with tier classification and color coding */
export { calculateCompositeScore, scoreToGrade, tierLabel, tierColor } from './validity-scorer.ts';

/** Generates timeline data for concept development and milestone tracking */
export { generateTimeline } from './timeline-data.service.ts';

/** Generates node map and visualization data for concept relationships */
export { generateNodeMap, generateVisualizationData } from './node-map-data.service.ts';

/** Tracks and stores concept provenance for audit and attribution purposes */
export { extractProvenance, storeProvenance } from './provenance-tracker.ts';

/** Generates formatted documents for export and reporting */
export { generateDocument } from './document-generator.ts';

/** Generates visual representations of concept data */
export { generateVisual } from './visual-generator.ts';
