<script setup>
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
</script>

<template>
  <p v-if="hottestCity && coolestCity" class="temp-summary">
    <template v-if="hottestCity.id === coolestCity.id">
      🌡️ {{ hottestCity.name }} {{ hottestCity.temp }}°C
    </template>
    <template v-else>
      🔥 가장 더운 곳: {{ hottestCity.name }} {{ hottestCity.temp }}°C · ❄️ 가장 시원한 곳:
      {{ coolestCity.name }} {{ coolestCity.temp }}°C
    </template>
  </p>
</template>

<style scoped>
.temp-summary {
  margin: 0 0 14px;
  padding: 10px 14px;
  background: #f4f9ff;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
</style>
