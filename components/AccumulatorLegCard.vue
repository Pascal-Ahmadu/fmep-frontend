<script setup lang="ts">
import type { AccumulatorLeg } from '~/types/api'

const { leg } = defineProps<{ leg: AccumulatorLeg }>()

const percent = (value: number) => `${(value * 100).toFixed(0)}%`

const kickoff = computed(() =>
  new Date(leg.kickoff_utc).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }),
)
</script>

<template>
  <div class="leg-card">
    <div class="top">
      <span class="muted small nowrap">{{ kickoff }}</span>
      <span class="muted small">{{ leg.competition }}</span>
    </div>

    <div class="match">{{ leg.fixture }}</div>

    <div class="pick-row">
      <Badge :tone="leg.selection">{{ leg.selection }}</Badge>
      <span class="line">{{ leg.line }}</span>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-label">Probability</span>
        <span class="stat-value strong">{{ percent(leg.probability) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Price</span>
        <span class="stat-value muted">{{ leg.price.toFixed(2) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Edge</span>
        <span class="stat-value" :class="leg.edge > 0 ? 'good' : 'bad'">
          {{ leg.edge > 0 ? '+' : '' }}{{ percent(leg.edge) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leg-card {
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

.match { font-weight: 600; }

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
.good { color: var(--over); }
.bad { color: var(--under); }
</style>
