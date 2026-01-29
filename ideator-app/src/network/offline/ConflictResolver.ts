// ============================================================================
// IDEATOR — Conflict Resolution (NET-7.3)
// Detects and resolves conflicts during offline sync
// ============================================================================

/** Represents a data conflict between local and remote versions */
export interface Conflict {
  id: string;
  entityType: 'concept' | 'analysis' | 'asset';
  entityId: string;
  localVersion: unknown;
  remoteVersion: unknown;
  detectedAt: Date;
  resolved: boolean;
  resolution?: ConflictResolution;
}

export enum ConflictResolution {
  KEEP_LOCAL = 'keep_local',
  KEEP_REMOTE = 'keep_remote',
  MERGE = 'merge',
}

/** Strategy for automatically resolving conflicts */
export enum ConflictStrategy {
  /** Always prefer local changes */
  LOCAL_WINS = 'local_wins',
  /** Always prefer remote changes */
  REMOTE_WINS = 'remote_wins',
  /** Use timestamp — most recent wins */
  LAST_WRITE_WINS = 'last_write_wins',
  /** Queue for manual resolution */
  MANUAL = 'manual',
}

type ConflictCallback = (conflict: Conflict) => void;

export class ConflictResolver {
  private strategy: ConflictStrategy;
  private pendingConflicts: Map<string, Conflict> = new Map();
  private listeners: ConflictCallback[] = [];

  constructor(strategy: ConflictStrategy = ConflictStrategy.LAST_WRITE_WINS) {
    this.strategy = strategy;
  }

  /** Detect if two versions conflict (simple deep-equality check) */
  detectConflict(
    entityType: Conflict['entityType'],
    entityId: string,
    localVersion: unknown,
    remoteVersion: unknown
  ): Conflict | null {
    if (JSON.stringify(localVersion) === JSON.stringify(remoteVersion)) {
      return null;
    }

    const conflict: Conflict = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      localVersion,
      remoteVersion,
      detectedAt: new Date(),
      resolved: false,
    };

    this.pendingConflicts.set(conflict.id, conflict);
    for (const cb of this.listeners) cb(conflict);
    return conflict;
  }

  /** Auto-resolve a conflict based on the configured strategy */
  autoResolve(conflict: Conflict, localTimestamp?: Date, remoteTimestamp?: Date): unknown {
    let resolution: ConflictResolution;

    switch (this.strategy) {
      case ConflictStrategy.LOCAL_WINS:
        resolution = ConflictResolution.KEEP_LOCAL;
        break;
      case ConflictStrategy.REMOTE_WINS:
        resolution = ConflictResolution.KEEP_REMOTE;
        break;
      case ConflictStrategy.LAST_WRITE_WINS: {
        const lt = localTimestamp?.getTime() ?? 0;
        const rt = remoteTimestamp?.getTime() ?? 0;
        resolution = lt >= rt ? ConflictResolution.KEEP_LOCAL : ConflictResolution.KEEP_REMOTE;
        break;
      }
      case ConflictStrategy.MANUAL:
        return null; // Don't auto-resolve
    }

    return this.resolve(conflict.id, resolution);
  }

  /** Manually resolve a conflict */
  resolve(conflictId: string, resolution: ConflictResolution): unknown {
    const conflict = this.pendingConflicts.get(conflictId);
    if (!conflict) throw new Error(`Conflict ${conflictId} not found`);

    conflict.resolved = true;
    conflict.resolution = resolution;
    this.pendingConflicts.delete(conflictId);

    switch (resolution) {
      case ConflictResolution.KEEP_LOCAL:
        return conflict.localVersion;
      case ConflictResolution.KEEP_REMOTE:
        return conflict.remoteVersion;
      case ConflictResolution.MERGE:
        return this.shallowMerge(conflict.localVersion, conflict.remoteVersion);
    }
  }

  /** Get all unresolved conflicts */
  getPendingConflicts(): Conflict[] {
    return Array.from(this.pendingConflicts.values());
  }

  /** Register callback for new conflicts */
  onConflict(callback: ConflictCallback): void {
    this.listeners.push(callback);
  }

  /** Set resolution strategy */
  setStrategy(strategy: ConflictStrategy): void {
    this.strategy = strategy;
  }

  /** Shallow merge: spread remote over local */
  private shallowMerge(local: unknown, remote: unknown): unknown {
    if (
      typeof local === 'object' && local !== null &&
      typeof remote === 'object' && remote !== null &&
      !Array.isArray(local) && !Array.isArray(remote)
    ) {
      return { ...local as Record<string, unknown>, ...remote as Record<string, unknown> };
    }
    return remote;
  }
}