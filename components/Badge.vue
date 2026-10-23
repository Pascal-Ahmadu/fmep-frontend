<script setup lang="ts">
defineProps<{
  tone: 'over' | 'under' | 'good' | 'bad' | 'neutral'
}>()
</script>

<template>
  <span class="badge" :class="tone">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.3;
}

.badge.over, .badge.good { color: var(--over); background: var(--over-tint); }
.badge.under, .badge.bad { color: var(--under); background: var(--under-tint); }
.badge.neutral { color: var(--accent); background: var(--accent-tint); }
</style>
