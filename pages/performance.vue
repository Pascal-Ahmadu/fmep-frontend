<script setup lang="ts">
type MarketPerformance = {
  market: string
  line: number
  settled: number
  hit_rate: number
  log_loss: number
  baseline_log_loss: number
  over_rate: number
  mean_prob: number
  hours_before: number
}

const { data, pending, error } = await useFetch<MarketPerformance[]>('/api/fmep/performance', {
  query: { days: 120 },
})

const labels: Record<string, string> = {
  total_corners: 'Corners',
  total_cards: 'Cards',
  total_shots_on_target: 'Shots on target',
  total_goals: 'Goals',
  total_fouls: 'Fouls',
}

const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const advantage = (row: MarketPerformance) => row.baseline_log_loss - row.log_loss
</script>

<template>
  <section>
    <p class="muted intro">
      Every forecast made before kick-off, scored against what happened. This is the only
      ongoing evidence: each market's one-off evaluation season has been spent.
    </p>

    <div v-if="error" class="card error">
      <strong>Could not load accuracy.</strong>
      <p class="muted">{{ error.statusMessage || error.message }}</p>
    </div>

    <p v-else-if="pending" class="muted">Loading…</p>

    <div v-else-if="!data?.length" class="card">
      <p class="muted">Nothing settled yet. Figures appear once forecast fixtures have been played.</p>
    </div>

    <div v-else class="card">
      <table>
        <thead>
          <tr>
            <th>Market</th>
            <th class="num">Line</th>
            <th class="num">Settled</th>
            <th class="num">Hit rate</th>
            <th class="num">Beats baseline by</th>
            <th class="num">Lead time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="`${row.market}-${row.line}`">
            <td>{{ labels[row.market] ?? row.market }}</td>
            <td class="num muted">{{ row.line }}</td>
            <td class="num muted">{{ row.settled }}</td>
            <td class="num strong">{{ percent(row.hit_rate) }}</td>
            <td class="num">
              <Badge :tone="advantage(row) > 0 ? 'good' : 'bad'">
                {{ advantage(row) > 0 ? '+' : '' }}{{ advantage(row).toFixed(4) }}
              </Badge>
            </td>
            <td class="num muted">{{ Math.round(row.hours_before) }}h</td>
          </tr>
        </tbody>
      </table>
      <p class="muted note">
        "Beats baseline by" is the reduction in log loss against always predicting the
        observed rate. Positive is good; a hit rate alone can flatter a one-sided market.
      </p>
    </div>
  </section>
</template>

<style scoped>
.intro { max-width: 46rem; margin: 0 0 1.25rem; font-size: 0.9rem; }
.strong { font-weight: 600; }
.note { font-size: 0.82rem; margin: 1rem 0 0; }
</style>
