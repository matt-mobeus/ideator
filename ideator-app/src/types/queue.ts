export type JobType = 'file_processing' | 'concept_extraction' | 'market_analysis' | 'asset_generation' | 'visualization'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Job {
  id: string
  type: JobType
  status: JobStatus
  targetId: string
  progress: number
  progressLabel?: string
  errorMessage?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}
