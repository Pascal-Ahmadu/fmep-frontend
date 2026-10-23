<script setup lang="ts">
import type { Pick } from '~/types/api'

const { pick } = defineProps<{ pick: Pick }>()

const percent = (value: number) => `${(value * 100).toFixed(0)}%`

const kickoff = computed(() =>
  new Date(pick.kickoff_utc).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }),
)

const usual = computed(() => {
  if (pick.base_rate === null) return '—'
  return percent(pick.selection === 'over' ? pick.base_rate : 1 - pick.base_rate)
})

const expected = computed(() => pick.expected_value === null ? '—' : pick.expected_value.toFixed(1))
</script>

<template>
  <div class="pick-card">
    <div class="top">
      <span class="muted small nowrap">{{ kickoff }}</span>
      <span class="muted small">{{ pick.competition }}, {{ pick.country }}</span>
    </div>

    <NuxtLink :to="`/fixtures/${pick.match_id}`" class="match">
      {{ pick.home_team.name }} <span class="muted">v</span> {{ pick.away_team.name }}
    </NuxtLink>

    <div class="pick-row">
      <Badge :tone="pick.selection">{{ pick.selection }}</Badge>
      <span class="line">{{ pick.line }}</span>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-label">Model</span>
        <span class="stat-value strong">{{ percent(pick.probability) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Usual</span>
        <span class="stat-value muted">{{ usual }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Expected</span>
        <span class="stat-value muted">{{ expected }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pick-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--card-radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.top { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.8rem; }
.small { font-size: 0.8rem; }
.nowrap { white-space: nowrap; }

.match { font-weight: 600; color: var(--ink); text-decoration: none; }
.match:hover { color: var(--accent); }

.pick-row { display: flex; align-items: center; gap: 0.5rem; }
.line { font-weight: 600; font-size: 0.9rem; }

.stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.2rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--line);
}

.stat { display: flex; flex-direction: column; gap: 0.15rem; }
.stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
.stat-value { font-variant-numeric: tabular-nums; }
.strong { font-weight: 600; }
.muted { color: var(--muted); }
</style>
