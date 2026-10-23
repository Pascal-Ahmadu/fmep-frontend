<script setup lang="ts">
import type { Accumulator } from '~/types/api'

const targetOdds = ref<number | null>(null)
const legCount = ref(3)
const minEdge = ref<number | null>(null)
const days = ref<number | null>(null)

const pending = ref(false)
const error = ref<string | null>(null)
const result = ref<Accumulator | null>(null)

async function submit() {
  if (!targetOdds.value || targetOdds.value <= 1) {
    error.value = 'Enter odds above 1.00.'
    return
  }

  pending.value = true
  error.value = null

  try {
    result.value = await $fetch<Accumulator>('/api/fmep/accumulator', {
      query: {
        target_odds: targetOdds.value,
        legs: legCount.value,
        ...(minEdge.value ? { min_edge: minEdge.value } : {}),
        ...(days.value ? { days: days.value } : {}),
      },
    })
  } catch (e: any) {
    error.value = e?.data?.detail || e?.statusMessage || e?.message || 'Could not reach the backend.'
  } finally {
    pending.value = false
  }
}

const percent = (value: number) => `${(value * 100).toFixed(2)}%`
const hasValue = computed(() => result.value && result.value.expected_return > 1)
</script>

<template>
  <section>
    <p class="muted intro">
      Pick a target combined price and the backend finds the best legs available that get close
      to it. The true chance of every leg landing is shown alongside the odds, not hidden behind
      how big the number looks.
    </p>

    <form class="card form" @submit.prevent="submit">
      <label class="field">
        <span>Target odds</span>
        <input v-model.number="targetOdds" type="number" step="0.01" min="1.01" placeholder="e.g. 5.00" required />
      </label>
      <label class="field">
        <span>Legs</span>
        <input v-model.number="legCount" type="number" step="1" min="1" max="10" />
      </label>
      <label class="field">
        <span>Min edge</span>
        <input v-model.number="minEdge" type="number" step="0.01" min="0" placeholder="optional" />
      </label>
      <label class="field">
        <span>Days ahead</span>
        <input v-model.number="days" type="number" step="1" min="1" placeholder="optional" />
      </label>
      <button type="submit" class="submit" :disabled="pending">
        {{ pending ? 'Searching…' : 'Find combination' }}
      </button>
    </form>

    <div v-if="error" class="card error">
      <strong>Could not build an accumulator.</strong>
      <p class="muted">{{ error }}</p>
    </div>

    <template v-else-if="result">
      <div class="card summary">
        <div class="summary-stat">
          <span class="stat-label">Combined odds</span>
          <span class="stat-value strong">{{ result.combined_odds.toFixed(2) }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">True chance</span>
          <span class="stat-value strong">{{ percent(result.probability) }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Expected return</span>
          <Badge :tone="hasValue ? 'good' : 'bad'">{{ result.expected_return.toFixed(2) }}×</Badge>
        </div>
      </div>

      <p v-if="result.note" class="card note muted">{{ result.note }}</p>

      <div v-if="result.legs.length" class="legs-grid">
        <AccumulatorLegCard v-for="leg in result.legs" :key="`${leg.match_id}-${leg.market}`" :leg="leg" />
      </div>
    </template>

    <div v-else class="card">
      <p class="muted">Enter a target price above to search for a combination.</p>
    </div>
  </section>
</template>

<style scoped>
.intro { max-width: 46rem; margin: 0 0 1.25rem; font-size: 0.9rem; }

.form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.field { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; color: var(--muted); }

.field input {
  font: inherit;
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--page);
  color: var(--ink);
  width: 8rem;
}

.submit {
  font: inherit;
  cursor: pointer;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
}

.submit:disabled { opacity: 0.6; cursor: default; }

.summary {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.summary-stat { display: flex; flex-direction: column; gap: 0.3rem; }
.stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
.stat-value { font-variant-numeric: tabular-nums; font-size: 1.1rem; }
.strong { font-weight: 600; }

.note { margin-bottom: 1rem; }

.legs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

@media (max-width: 720px) {
  .form { flex-direction: column; align-items: stretch; }
  .field input { width: 100%; }
}
</style>
