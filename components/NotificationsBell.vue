<script setup lang="ts">
import { BellIcon } from '@heroicons/vue/24/outline'
import type { NotificationSummary } from '~/types/api'

const { data, refresh } = await useFetch<NotificationSummary>('/api/fmep/notifications')

const open = ref(false)
const unread = computed(() => data.value?.unread ?? 0)
const items = computed(() => data.value?.items ?? [])

async function markRead(ids?: number[]) {
  await $fetch('/api/fmep/notifications/read', {
    method: 'POST',
    body: ids ? { notification_ids: ids } : {},
  })
  await refresh()
}

const relativeTime = (iso: string) => {
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000
  if (hours < 1) return 'just now'
  if (hours < 24) return `${Math.round(hours)}h ago`
  return `${Math.round(hours / 24)}d ago`
}
</script>

<template>
  <div class="wrap">
    <button type="button" class="bell" :class="{ unread: unread > 0 }" @click="open = !open">
      <BellIcon />
      <span v-if="unread > 0" class="dot">{{ unread > 9 ? '9+' : unread }}</span>
    </button>

    <div v-if="open" class="overlay" @click="open = false" />

    <div v-if="open" class="panel card">
      <div class="panel-header">
        <strong>Notifications</strong>
        <button v-if="unread > 0" type="button" class="link" @click="markRead()">Mark all read</button>
      </div>

      <p v-if="!items.length" class="muted empty">No notifications.</p>

      <ul v-else class="list">
        <li
          v-for="item in items"
          :key="item.notification_id"
          class="item"
          :class="{ 'is-unread': !item.read_at }"
          @click="!item.read_at && markRead([item.notification_id])"
        >
          <span class="level" :class="item.level" />
          <div class="item-body">
            <div class="item-title">{{ item.title }}</div>
            <p v-if="item.detail" class="muted item-detail">{{ item.detail }}</p>
            <span class="muted item-time">{{ relativeTime(item.created_at) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wrap { position: relative; }

.bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
}

.bell svg { width: 18px; height: 18px; }
.bell.unread { color: var(--ink); }

.dot {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: var(--under);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.overlay { position: fixed; inset: 0; z-index: 10; }

.panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 22rem;
  max-width: 80vw;
  z-index: 20;
  padding: 0.75rem;
}

.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }

.link {
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--accent);
  padding: 0;
}

.empty { margin: 0.5rem 0 0.25rem; }

.list { list-style: none; margin: 0; padding: 0; max-height: 22rem; overflow-y: auto; }

.item {
  display: flex;
  gap: 0.6rem;
  padding: 0.6rem 0.4rem;
  border-radius: 8px;
  cursor: default;
}

.item.is-unread { background: var(--page); cursor: pointer; }

.level {
  flex: none;
  width: 8px;
  height: 8px;
  margin-top: 0.4rem;
  border-radius: 999px;
  background: var(--accent);
}

.level.warning { background: #b58a00; }
.level.error { background: var(--under); }

.item-body { min-width: 0; }
.item-title { font-weight: 600; font-size: 0.88rem; }
.item-detail { font-size: 0.82rem; margin: 0.15rem 0; }
.item-time { font-size: 0.75rem; }

@media (max-width: 720px) {
  .panel { position: fixed; top: auto; right: 1rem; left: 1rem; width: auto; max-width: none; }
}
</style>
