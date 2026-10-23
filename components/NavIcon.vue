<script setup lang="ts">
import { HomeIcon, ChartBarIcon, CalculatorIcon } from '@heroicons/vue/24/outline'

defineProps<{
  name: 'picks' | 'accuracy' | 'accumulator'
}>()
</script>

<template>
  <HomeIcon v-if="name === 'picks'" />
  <ChartBarIcon v-else-if="name === 'accuracy'" />
  <CalculatorIcon v-else />
</template>
