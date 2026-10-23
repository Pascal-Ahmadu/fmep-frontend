<script setup lang="ts">
import type { Pick } from '~/types/api'

const markets = [
  { key: 'total_fouls', label: 'Fouls' },
  { key: 'total_cards', label: 'Cards' },
  { key: 'total_corners', label: 'Corners' },
  { key: 'total_shots_on_target', label: 'Shots on target' },
  { key: 'total_goals', label: 'Goals' },
]

const market = ref('total_fouls')
const { data, pending, error, refresh } = await useFetch<Pick[]>('/api/fmep/picks', {
  query: { market, limit: 25, min_confidence: 0.05 },
})

// Set from the search field in app.vue's topbar.
const search = useState('pickSearch', () => '')

const competition = ref<string | null>(null)
watch(market, () => { competition.value = null })

const competitions = computed(() => {
  const counts = new Map<string, number>()
  for (const pick of data.value ?? []) {
    counts.set(pick.competition, (counts.get(pick.competition) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const filtered = computed(() => {
  let list = data.value ?? []
  if (competition.value) list = list.filter(pick => pick.competition === competition.value)
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(pick =>
      pick.home_team.name.toLowerCase().includes(q) ||
      pick.away_team.name.toLowerCase().includes(q) ||
      pick.competition.toLowerCase().includes(q),
    )
  }
  return list
})
</script>

<template>
  <section class="layout">
    <aside class="league-filter">
      <button
        type="button"
        class="league-row"
        :class="{ active: competition === null }"
        @click="competition = null"
      >
        <span>All</span>
        <span class="muted">{{ data?.length ?? 0 }}</span>
      </button>
      <button
        v-for="option in competitions"
        :key="option.name"
        type="button"
        class="league-row"
        :class="{ active: competition === option.name }"
        @click="competition = competition === option.name ? null : option.name"
      >
        <span>{{ option.name }}</span>
        <span class="muted">{{ option.count }}</span>
      </button>
    </aside>

    <div class="content">
      <div class="toolbar">
        <div class="tabs" role="tablist">
          <button
            v-for="option in markets"
            :key="option.key"
            type="button"
            role="tab"
            :aria-selected="market === option.key"
            :class="{ active: market === option.key }"
            @click="market = option.key"
          >
            {{ option.label }}
          </button>
        </div>
        <button type="button" class="refresh" :disabled="pending" @click="refresh()">
          {{ pending ? 'Loading…' : 'Refresh' }}
        </button>
      </div>

      <p class="muted intro">
        Ranked by how far each forecast departs from what that league usually does, which is
        where the model's skill showed up in testing. Not by how confident it looks.
      </p>

      <div v-if="error" class="card error">
        <strong>Could not load picks.</strong>
        <p class="muted">{{ error.statusMessage || error.message }}</p>
      </div>

      <div v-else-if="!filtered.length && !pending" class="card">
        <p v-if="search.trim() || competition" class="muted">No picks match your filters.</p>
        <p v-else class="muted">No picks for this market yet. The next scheduled run will produce them.</p>
      </div>

      <div v-else class="picks-grid">
        <PickCard v-for="pick in filtered" :key="`${pick.match_id}-${pick.market}`" :pick="pick" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.layout { display: flex; gap: 1.5rem; align-items: flex-start; }

.league-filter {
  flex: none;
  width: 190px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.league-row {
  font: inherit;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  border: none;
  background: var(--surface);
  color: var(--ink);
  text-align: left;
}

.league-row span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.league-row:hover { background: var(--page); }
.league-row.active { background: var(--accent-tint); color: var(--accent); font-weight: 600; }
.league-row.active .muted { color: var(--accent); }

.content { flex: 1; min-width: 0; }

.toolbar { display: flex; gap: 1rem; justify-content: space-between; align-items: center; flex-wrap: wrap; }
.tabs { display: flex; gap: 0.25rem; }

.tabs button, .refresh {
  font: inherit;
  cursor: pointer;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--muted);
}

.tabs button.active { color: var(--accent); border-color: var(--accent); background: var(--accent-tint); }
.tabs button:hover, .refresh:hover:not(:disabled) { color: var(--ink); }
.refresh:disabled { opacity: 0.6; cursor: default; }

.intro { max-width: 46rem; margin: 0.9rem 0 1.25rem; font-size: 0.9rem; }

.picks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

@media (max-width: 720px) {
  .layout { flex-direction: column; }
  .league-filter { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .league-row { width: auto; }
}
</style>
