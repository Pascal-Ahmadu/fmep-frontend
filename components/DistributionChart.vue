<script setup lang="ts">
import type { CountProbability } from '~/types/api'

const { probabilities, tail } = defineProps<{
  probabilities: CountProbability[]
  tail: { at_least: number; probability: number }
}>()

const bars = computed(() => [
  ...probabilities.map(p => ({ label: String(p.count), probability: p.probability, isTail: false })),
  { label: `${tail.at_least}+`, probability: tail.probability, isTail: true },
])

const max = computed(() => Math.max(...bars.value.map(b => b.probability), 0.0001))
const heightPercent = (probability: number) => `${Math.max((probability / max.value) * 100, 1.5)}%`
const percent = (value: number) => `${(value * 100).toFixed(1)}%`
</script>

<template>
  <div class="chart" role="img" :aria-label="`Probability distribution across ${bars.length} outcomes`">
    <div class="bars">
      <div
        v-for="(bar, index) in bars"
        :key="index"
        class="slot"
        tabindex="0"
      >
        <div class="bar" :class="{ tail: bar.isTail }" :style="{ height: heightPercent(bar.probability) }" />
        <span class="tooltip">{{ bar.isTail ? `${bar.label} outcomes` : bar.label }} &middot; {{ percent(bar.probability) }}</span>
        <span v-if="index % 5 === 0 || bar.isTail" class="tick muted">{{ bar.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart { padding-top: 1.5rem; }

.bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 7rem;
}

.slot {
  position: relative;
  flex: 1;
  min-width: 4px;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  background: var(--accent);
  border-radius: 3px 3px 0 0;
}

.bar.tail { background: var(--accent); opacity: 0.6; }

.slot:hover .bar, .slot:focus-visible .bar { opacity: 0.75; outline: none; }

.tooltip {
  position: absolute;
  bottom: calc(100% + 0.4rem);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: var(--ink);
  color: var(--surface);
  font-size: 0.72rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s;
  z-index: 1;
}

.slot:hover .tooltip, .slot:focus-visible .tooltip { opacity: 1; }

.tick {
  position: absolute;
  top: calc(100% + 0.3rem);
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.68rem;
  white-space: nowrap;
}

.muted { color: var(--muted); }
</style>
