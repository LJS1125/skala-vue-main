<script setup>
import { useConfigStore } from '@/stores/configStore'

defineProps({
  hottestCity: {
    type: Object,
    default: null,
  },
  coolestCity: {
    type: Object,
    default: null,
  },
})

const configStore = useConfigStore()

const toDisplayTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}
</script>

<template>
  <p v-if="hottestCity && coolestCity" class="temp-summary">
    <template v-if="hottestCity.id === coolestCity.id">
      🌡️ {{ hottestCity.name }} {{ toDisplayTemp(hottestCity.temp) }}{{ configStore.unitSymbol }}
    </template>
    <template v-else>
      🔥 가장 더운 곳: {{ hottestCity.name }} {{ toDisplayTemp(hottestCity.temp)
      }}{{ configStore.unitSymbol }} · ❄️ 가장 시원한 곳: {{ coolestCity.name }}
      {{ toDisplayTemp(coolestCity.temp) }}{{ configStore.unitSymbol }}
    </template>
  </p>
</template>

<style scoped>
.temp-summary {
  margin: 0 0 14px;
  padding: 10px 14px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
</style>
