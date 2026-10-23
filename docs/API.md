# Backend reference

Everything the frontend needs: the endpoints, what the fields mean, and the
domain rules that should shape the interface. Types are in `types/api.ts`.

Examples below are real responses, captured on 15 October 2026.

## Calling it

```
browser → /api/fmep/<path> → http://backend:8000/api/v1/<path>  (X-API-Key added)
```

Never call the backend from the browser. The key must not ship in client
JavaScript, and in production the API listens only on localhost.

```ts
const { data } = await useFetch<Pick[]>('/api/fmep/picks', {
  query: { market: 'total_fouls', limit: 25 },
})
```

**Authentication:** the backend requires `X-API-Key` when `API_KEYS` is set. With
no keys configured it is open, which is how a local machine runs. The proxy adds
the header from `FMEP_API_KEY`.

**Rate limit:** 120 requests per minute per caller, then HTTP 429 with a
`Retry-After` header. The proxy counts as one caller, so heavy polling from many
browsers shares one budget. Poll no faster than once a minute; the data changes
twice a week.

## Endpoints

| Endpoint | Returns |
| --- | --- |
| `GET /picks` | Ranked picks for one market |
| `GET /fixtures` | Upcoming fixtures |
| `GET /fixtures/{id}/predictions` | Every market's forecast for one fixture |
| `GET /fixtures/{id}/distributions` | The probability of every exact count |
| `GET /performance` | Live accuracy from settled forecasts |
| `GET /accumulator` | The best combination available, with its true chance |
| `GET /notifications` | Alerts the platform raised about itself |
| `POST /notifications/read` | Mark notifications read |
| `GET /health` | Service and database status (no key needed) |

### GET /picks

| Parameter | Default | Notes |
| --- | --- | --- |
| `market` | `total_corners` | One of the markets; player markets return 409 while paused |
| `line` | the market's reference line | 2.5 goals, 9.5 corners, 4.5 cards, 24.5 fouls, 8.5 shots on target |
| `min_confidence` | `0.05` | Minimum distance of P(over) from 0.5 |
| `competition_id` | — | Filter to one league |
| `limit` | `50` | Maximum 200 |
| `rank_by` | `league` | `league`, `global` or `even` |

```json
[
  {
    "match_id": 37926,
    "kickoff_utc": "2026-11-01T13:30:00Z",
    "competition": "Bundesliga",
    "country": "Austria",
    "home_team": { "team_id": 446, "name": "Salzburg" },
    "away_team": { "team_id": 536, "name": "Austria Lustenau" },
    "market": "total_fouls",
    "entity_type": "match",
    "entity_id": null,
    "entity_name": null,
    "line": 24.5,
    "selection": "under",
    "probability": 0.8865591584287831,
    "confidence": 0.3865591584287831,
    "base_rate": 0.4900086880973067,
    "edge_over_base": 0.37656784652608977,
    "expected_value": 18.726384080202468,
    "model_version": "fouls-team-nb-lgbm-20261012-064759",
    "computed_at": "2026-10-12T06:47:59.850028Z"
  }
]
```

Read that row as: this league goes over 24.5 fouls 49% of the time; the model
says this match goes **under** with 88.7% confidence, expecting 18.7 fouls.

### GET /fixtures/{id}/predictions

Every market for one fixture, each with all its lines and fair odds. Add
`?entity_type=player` for player rows, or `all` for both; the default is `match`,
because a fixture has dozens of player rows and only five match markets.

```json
{
  "match_id": 37826,
  "kickoff_utc": "2026-10-16T16:30:00Z",
  "home_team": { "team_id": 615, "name": "Cottbus" },
  "away_team": { "team_id": 482, "name": "Nürnberg" },
  "markets": [
    {
      "market": "total_cards",
      "model_version": "cards-team-nb-lgbm-20261012-064710",
      "computed_at": "2026-10-12T06:47:10.159101Z",
      "expected_value": 4.381988748427457,
      "lines": [
        {
          "line": 2.5,
          "prob_over": 0.7954536090906633,
          "prob_under": 0.20454639090933668,
          "fair_odds_over": 1.2571443369817223,
          "fair_odds_under": 4.888866508738553
        }
      ]
    }
  ]
}
```

### GET /fixtures/{id}/distributions

The whole shape, not just lines: good for a bar chart, and for pricing any line
the backend does not publish.

```json
{
  "markets": [
    {
      "market": "total_corners",
      "expected_value": 10.395952349574307,
      "probabilities": [
        { "count": 0, "probability": 0.000084 },
        { "count": 1, "probability": 0.000714 },
        { "count": 2, "probability": 0.003101 }
      ],
      "tail": { "at_least": 30, "probability": 0.000011 }
    }
  ]
}
```

`probabilities` plus `tail` sum to 1. P(over 9.5) is the sum of counts above 9.5
plus the tail, and it matches `prob_over` from the predictions endpoint exactly.

### GET /performance

```json
[
  {
    "market": "total_fouls",
    "line": 24.5,
    "settled": 170,
    "hit_rate": 0.611764705882353,
    "log_loss": 0.6585120280647105,
    "baseline_log_loss": 0.6906537580036262,
    "over_rate": 0.5352941176470588,
    "mean_prob": 0.47089238647539616,
    "mean_abs_error": 4.395972483355799,
    "first_kickoff": "2026-09-17T17:00:00Z",
    "last_kickoff": "2026-10-05T18:30:00Z",
    "hours_before": 45.40625480791682
  }
]
```

`baseline_log_loss - log_loss` is the margin over always predicting the observed
rate: positive is good. Show that, not the raw log loss, which means nothing to a
reader. Parameters: `days` (default 90) and `all_lines` (default false).

### GET /accumulator

Parameters: `legs` (default 3), `target_odds`, `min_edge`, `days`. It returns
one leg per match, and says plainly when it cannot do what was asked:

```json
{
  "legs": [],
  "combined_odds": 1.0,
  "probability": 0.0,
  "expected_return": 0.0,
  "note": "No upcoming fixture has a collected price offering value, so there is nothing to back."
}
```

Always show `note` when present, and always show `probability` next to
`combined_odds`. A 1000x accumulator has about a 1 in 1000 chance however the
legs are chosen, and hiding that would be the dishonest way to present it.

### GET /notifications

```json
{
  "unread": 15,
  "items": [
    {
      "notification_id": 24,
      "level": "warning",
      "category": "pipeline",
      "title": "No match results for 6 days",
      "detail": "The most recent finished match is 05 Oct 2026. Features and forecasts are being built on form that old.",
      "context": { "stale_days": 6 },
      "created_at": "2026-10-12T06:45:24Z",
      "read_at": null
    }
  ]
}
```

Good candidate for a bell icon with the `unread` count. `POST /notifications/read`
with `{"notification_ids": [24]}` marks some, or `{}` marks all.

## Errors

Every error is an RFC 7807 problem document with `application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Player markets are paused: the current data source has no per-player statistics, so these forecasts would be built on stale form.",
  "status": 409,
  "detail": "Player markets are paused: the current data source has no per-player statistics, so these forecasts would be built on stale form.",
  "instance": "/api/v1/picks"
}
```

| Status | Means | What the UI should do |
| --- | --- | --- |
| 401 | Missing or wrong key | A configuration problem, not a user one; show it as such |
| 409 | Player markets paused | Show `detail`; it explains itself |
| 422 | Bad parameter | Check the request; `errors` lists what failed |
| 429 | Rate limited | Back off for `Retry-After` seconds |
| 404 | No such fixture, or no forecast yet | "No forecast yet" is normal for a new fixture |
| 503 | `/health` only: database unreachable | Show the service as degraded |

The proxy passes `detail` through as `statusMessage`.

## What the numbers mean

**`probability` is for the side in `selection`.** It is not always above 50%: a
pick is the side the model favours *relative to the base rate*, so a 43% chance
where the usual rate is 18% is a genuine pick. Showing it as a confidence bar
against 50% would misrepresent it.

**`base_rate` is always P(over).** For an under pick, display `1 - base_rate` so
the comparison is like for like.

**`edge_over_base` is the ranking**, not `confidence`. This matters: on the
2024/25 season, ranking by distance from 50/50 added nothing measurable, while
ranking by distance from the league's own rate added 8.4 points of hit rate.

**Fair odds are `1 / probability`.** A bookmaker price above the fair odds has
value by this model; below it does not, however likely the outcome. Bookmaker
margins on these markets average about 8.7%, so a near-tie is a loss.

**Calibration is the strong point.** Across the tested seasons the stated
probabilities matched observed frequencies within about a point in every band.
Phrases like "70% likely" can be used literally.

## Domain rules worth encoding

1. **Only five markets are live.** Goals, corners, cards, fouls and shots on
   target. The two player markets return 409 until a data source with per-player
   statistics is paid for.
2. **Only the reference lines are tested.** 2.5 goals, 9.5 corners, 4.5 cards,
   24.5 fouls, 8.5 shots on target. Other lines are forecast and look plausible,
   but were never evaluated. Worth a quiet marker in the UI rather than
   presenting them as equals.
3. **Goals are weakest, and only at 2.5.** Away from that line the model picks
   the same side the league's base rate would, so a goals pick at 1.5 or 3.5 is
   not telling the user anything they could not guess. Worth ranking goals below
   the other markets rather than listing it first.
4. **Forecasts refresh twice a week** (Tuesday 09:00, Thursday 18:00), so
   `computed_at` can be days old and that is normal. Show it rather than hiding
   it: a forecast made before team news is worth less than one made after.
5. **Kick-off times are UTC.** Convert for display; do not assume the viewer's
   league is local.
6. **Accuracy is measured, profitability is not.** The models beat their
   baselines consistently; whether they beat bookmaker prices is still being
   collected. Any language suggesting guaranteed profit would be wrong.

## Suggested screens

| Screen | Content | Endpoint |
| --- | --- | --- |
| Picks | Per-market tabs, the model's probability against the usual rate, kick-off and league | `/picks` |
| Fixture | Every market for one match, lines with fair odds, a distribution chart | `/fixtures/{id}/predictions`, `/distributions` |
| Accuracy | The live table, with the margin over baseline and sample size | `/performance` |
| Health | Notifications and `/health`, so a stale pipeline is visible | `/notifications`, `/health` |

A sample size belongs beside every accuracy figure. At 170 settled matches these
numbers carry real uncertainty, and a bare "61.2%" implies more than it should.
