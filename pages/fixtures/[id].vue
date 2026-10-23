<script setup lang="ts">
import type { FixturePredictions, FixtureDistributions } from '~/types/api'

const route = useRoute()
const id = route.params.id

const { data: predictions, pending, error } = await useFetch<FixturePredictions>(`/api/fmep/fixtures/${id}/predictions`)
const { data: distributions } = await useFetch<FixtureDistributions>(`/api/fmep/fixtures/${id}/distributions`)

const labels: Record<string, string> = {
  total_corners: 'Corners',
  total_cards: 'Cards',
  total_fouls: 'Fouls',
}

const distributionFor = (market: string) => distributions.value?.markets.find(m => m.market === market)

const kickoff = computed(() => {
  if (!predictions.value) return ''
  return new Date(predictions.value.kickoff_utc).toLocaleString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
})

const percent = (value: number) => `${(value * 100).toFixed(0)}%`
</script>

<template>
  <section>
    <NuxtLink to="/" class="back">&larr; Back to picks</NuxtLink>

    <div v-if="error" class="card error">
      <strong>Could not load this fixture.</strong>
      <p class="muted">{{ error.statusMessage || error.message }}</p>
    </div>

    <p v-else-if="pending" class="muted">Loading…</p>

    <template v-else-if="predictions">
      <div class="header">
        <h2>{{ predictions.home_team.name }} v {{ predictions.away_team.name }}</h2>
        <p class="muted">{{ kickoff }}</p>
      </div>

      <div v-if="!predictions.markets.length" class="card">
        <p class="muted">No forecasts for this fixture yet.</p>
      </div>

      <div v-for="market in predictions.markets" :key="market.market" class="card market-card">
        <div class="market-header">
          <h3>{{ labels[market.market] ?? market.market }}</h3>
          <span v-if="market.expected_value !== null" class="muted">
            Expected: <strong class="ink">{{ market.expected_value.toFixed(1) }}</strong>
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Line</th>
              <th class="num">P(over)</th>
              <th class="num">P(under)</th>
              <th class="num">Fair odds over</th>
              <th class="num">Fair odds under</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in market.lines" :key="line.line">
              <td class="strong">{{ line.line }}</td>
              <td class="num">{{ percent(line.prob_over) }}</td>
              <td class="num">{{ percent(line.prob_under) }}</td>
              <td class="num muted">{{ line.fair_odds_over.toFixed(2) }}</td>
              <td class="num muted">{{ line.fair_odds_under.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <DistributionChart
          v-if="distributionFor(market.market)"
          :probabilities="distributionFor(market.market)!.probabilities"
          :tail="distributionFor(market.market)!.tail"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.back { color: var(--muted); text-decoration: none; font-size: 0.9rem; }
.back:hover { color: var(--ink); }

.header { margin: 1rem 0 1.5rem; }
.header h2 { margin: 0 0 0.3rem; font-size: 1.4rem; }

.market-card { margin-bottom: 1.25rem; }

.market-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem; }
.market-header h3 { margin: 0; font-size: 1.05rem; }

.ink { color: var(--ink); }
.strong { font-weight: 600; }
</style>
