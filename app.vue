<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

// Shared with pages/index.vue, which filters the picks grid by this value.
const search = useState('pickSearch', () => '')
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="mark">FMEP</span>
        <h1>Football micro-event forecasts</h1>
      </div>

      <div class="actions">
        <label class="search">
          <MagnifyingGlassIcon />
          <input v-model="search" type="search" placeholder="Search teams or competitions" />
        </label>

        <nav>
          <NuxtLink to="/"><NavIcon name="picks" /> Picks</NuxtLink>
          <NuxtLink to="/performance"><NavIcon name="accuracy" /> Accuracy</NuxtLink>
          <NuxtLink to="/accumulator"><NavIcon name="accumulator" /> Accumulator</NuxtLink>
        </nav>
        <NotificationsBell />
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>

    <footer>
      Forecasts are probabilities, not advice. Accuracy is measured; profitability is not yet proven.
    </footer>
  </div>
</template>

<style>
:root {
  --ink: #100f0f;
  --muted: #636363;
  --line: #efefef;
  --surface: #ffffff;
  --page: #f6f6f4;
  --accent: #5742a9;
  --accent-tint: rgba(87, 66, 169, 0.1);
  --over: #096a00;
  --over-tint: rgba(9, 106, 0, 0.1);
  --under: #560617;
  --under-tint: rgba(86, 6, 23, 0.1);
  --card-radius: 12px;
}

* { box-sizing: border-box; }

html, body {
  overflow-x: hidden;
}

body {
  margin: 0;
  background: var(--page);
  color: var(--ink);
  font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
}

.shell {
  max-width: 72rem;
  margin: 0 auto;
  min-height: 100vh;
  padding: 1.5rem 1.5rem 3rem;
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  align-items: center;
  justify-content: space-between;
  margin: -1.5rem calc(-50vw + 50%) 1.75rem;
  padding: 1.1rem calc(50vw - 50%) 1rem;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.brand { display: flex; align-items: baseline; gap: 0.9rem; min-width: 0; }

.mark {
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.actions { display: flex; align-items: center; gap: 1.25rem; }

.search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: var(--page);
  color: var(--muted);
}

.search svg { width: 16px; height: 16px; flex: none; }

.search input {
  font: inherit;
  font-size: 0.9rem;
  border: none;
  outline: none;
  background: none;
  color: var(--ink);
  width: 14rem;
}

.search input::placeholder { color: var(--muted); }

.actions nav { display: flex; gap: 0.35rem; }

.actions nav a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  color: var(--muted);
  text-decoration: none;
}

.actions nav a svg { width: 18px; height: 18px; flex: none; }
.actions nav a:hover { color: var(--ink); }
.actions nav a.router-link-active { color: var(--accent); background: var(--accent-tint); font-weight: 500; }

h1 { font-size: 1.25rem; margin: 0; letter-spacing: -0.01em; }

footer {
  margin-top: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.85rem;
}

@media (max-width: 720px) {
  .shell { padding: 1.25rem 1rem 2rem; }
  .topbar { align-items: flex-start; }
  .brand { flex-direction: column; gap: 0.2rem; }
  .actions { width: 100%; flex-wrap: wrap; justify-content: space-between; }
  .search { order: 1; width: 100%; }
  .search input { width: 100%; }
}

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--card-radius);
  padding: 1rem 1.1rem;
}

.muted { color: var(--muted); }
.error { border-left: 3px solid #d93025; padding-left: 0.9rem; }
</style>
