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
      🔥 가장 더운 곳 <strong>{{ hottestCity.name }} {{ toDisplayTemp(hottestCity.temp)
      }}{{ configStore.unitSymbol }}</strong> · ❄️ 가장 시원한 곳
      <strong>{{ coolestCity.name }} {{ toDisplayTemp(coolestCity.temp) }}{{ configStore.unitSymbol }}</strong>
    </template>
  </p>
</template>

<style scoped>
.temp-summary {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text);
}

.temp-summary strong {
  font-weight: 800;
  color: var(--color-heading);
}
</style>
