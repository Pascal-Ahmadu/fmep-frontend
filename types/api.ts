/**
 * Response types for the prediction API, matching app/schemas.py on the backend.
 *
 * Numbers are never rounded by the API: probabilities arrive as 0.8865591584287831
 * and formatting is the frontend's job (B6.3).
 */

export type MatchMarket =
  | 'total_corners'
  | 'total_cards'
  | 'total_fouls'
  | 'total_shots_on_target'
  | 'total_goals'
export type PlayerMarket = 'player_shots_on_target' | 'player_fouls_committed'
export type Market = MatchMarket | PlayerMarket

/** Player markets are paused while the data source has no per-player statistics. */
export const ACTIVE_MARKETS: MatchMarket[] = [
  'total_corners',
  'total_cards',
  'total_fouls',
  'total_shots_on_target',
  'total_goals',
]

/** The line each market was evaluated at. Other lines are forecast but untested. */
export const REFERENCE_LINE: Record<MatchMarket, number> = {
  total_corners: 9.5,
  total_cards: 4.5,
  total_fouls: 24.5,
  total_shots_on_target: 8.5,
  total_goals: 2.5,
}

export interface TeamSummary {
  team_id: number
  name: string
}

export interface FixtureSummary {
  match_id: number
  kickoff_utc: string // ISO 8601, always UTC
  status: string // "Not Started", "Finished", "Postponed", ...
  home_team: TeamSummary
  away_team: TeamSummary
}

export interface Pick {
  match_id: number
  kickoff_utc: string
  competition: string
  country: string
  home_team: TeamSummary
  away_team: TeamSummary
  market: Market
  entity_type: 'match' | 'player'
  entity_id: number | null
  /** The player's name, for player markets only. */
  entity_name: string | null
  line: number
  selection: 'over' | 'under'
  /** The model's probability for the side named in `selection`. */
  probability: number
  /** Distance of P(over) from 0.5. Used by min_confidence, not for ranking. */
  confidence: number
  /** How often this happens in that league (or for that player). Null if unknown. */
  base_rate: number | null
  /** |P(over) - base_rate|: how unusual the forecast is. This is the ranking. */
  edge_over_base: number | null
  /** The expected count itself, e.g. 18.7 fouls. */
  expected_value: number | null
  model_version: string
  computed_at: string
}

export interface LinePrediction {
  line: number
  prob_over: number
  prob_under: number
  /** 1 / probability. Beat these prices and the bet has value, by this model. */
  fair_odds_over: number
  fair_odds_under: number
}

export interface MarketPrediction {
  market: Market
  entity_type: 'match' | 'player'
  entity_id: number | null
  model_version: string
  computed_at: string
  expected_value: number | null
  lines: LinePrediction[]
}

export interface FixturePredictions {
  match_id: number
  kickoff_utc: string
  home_team: TeamSummary
  away_team: TeamSummary
  markets: MarketPrediction[]
}

export interface CountProbability {
  count: number
  probability: number
}

export interface MarketDistribution {
  market: Market
  entity_type: 'match' | 'player'
  entity_id: number | null
  model_version: string
  computed_at: string
  expected_value: number
  /** Counts 0..29, each with its probability. Sums with `tail` to 1. */
  probabilities: CountProbability[]
  tail: { at_least: number; probability: number }
}

export interface FixtureDistributions {
  match_id: number
  kickoff_utc: string
  home_team: TeamSummary
  away_team: TeamSummary
  markets: MarketDistribution[]
}

export interface MarketPerformance {
  market: Market
  line: number
  /** How many forecasts have been scored against results. */
  settled: number
  hit_rate: number
  log_loss: number
  /** Log loss of always predicting the observed rate. Lower model = better. */
  baseline_log_loss: number
  over_rate: number
  mean_prob: number
  mean_abs_error: number | null
  first_kickoff: string
  last_kickoff: string
  /** Average hours between the forecast and kick-off. */
  hours_before: number
}

export interface AccumulatorLeg {
  match_id: number
  kickoff_utc: string
  fixture: string
  competition: string
  market: Market
  line: number
  selection: 'over' | 'under'
  probability: number
  price: number
  /** probability * price - 1. Above zero is value at that price. */
  edge: number
}

export interface Accumulator {
  legs: AccumulatorLeg[]
  combined_odds: number
  /** The true chance of every leg landing. For 1000x this is about 0.001. */
  probability: number
  /** probability * combined_odds. Above 1.0 is value; below it is not. */
  expected_return: number
  note: string | null
}

export interface Notification {
  notification_id: number
  level: 'info' | 'warning' | 'error'
  category: 'pipeline' | 'value' | 'accuracy'
  title: string
  detail: string | null
  context: Record<string, unknown> | null
  created_at: string
  read_at: string | null
}

export interface NotificationSummary {
  unread: number
  items: Notification[]
}

/** RFC 7807 problem document: every error the API returns looks like this. */
export interface Problem {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  errors?: unknown[]
}
