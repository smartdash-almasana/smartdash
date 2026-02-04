/**
 * Risk domain model.
 *
 * This interface represents the stable domain contract used by
 * services, engine logic, server actions and UI components.
 *
 * IMPORTANT:
 * - Database column names (snake_case) are translated in services.
 * - This domain model MUST NOT depend on DB naming conventions.
 */

export interface RiskSnapshot {
  /** Unique snapshot identifier */
  id: string;

  /** Client identifier */
  clientId: string;

  /** Scenario identifier */
  scenarioId: string;

  /** Human-readable scenario description */
  scenarioDescription: string;

  /** Client business vertical */
  vertical: string;

  /** Global risk score (normalized number) */
  globalScore: number;

  /** Risk level label (e.g. low, medium, high, critical) */
  riskLevel: string;

  /** Financial context associated with the risk */
  financialContext: Record<string, unknown>;

  /** Signals used to compute the risk */
  signals: unknown[];

  /** Recommendation category */
  recommendationType: string;

  /** Recommendation text shown to the user */
  recommendationText: string;

  /** Optional deadline to take action */
  actionDeadline: string | null;

  /** Current action status */
  actionStatus: 'pending' | 'completed' | string;

  /** Risk score version used for this snapshot */
  scoreVersion: string;

  /** Snapshot creation timestamp (ISO 8601) */
  createdAt: string;

  /** Snapshot last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Client display name */
  clientName: string;

  /** Client company or organization */
  clientCompany: string;

  /** Client segmentation label */
  clientSegment: string;
}
