<script setup>
defineProps({
  forecastList: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <section class="forecast-section">
    <h3 class="section-title">🗓️ 5일 예보</h3>

    <p v-if="isLoading" class="forecast-status">⏳ 5일 예보를 불러오는 중입니다...</p>
    <p v-else-if="error" class="forecast-status forecast-error">{{ error }}</p>

    <div v-else class="forecast-list">
      <div v-for="day in forecastList" :key="day.date" class="forecast-card">
        <p class="forecast-date">{{ day.dateLabel }}</p>
        <img
          class="forecast-icon"
          :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`"
          :alt="day.description"
        />
        <p class="forecast-desc">{{ day.description }}</p>
        <p class="forecast-temp">
          <span class="temp-max">{{ day.tempMax }}°</span>
          <span class="temp-min">{{ day.tempMin }}°</span>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.forecast-section {
  margin-top: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 10px;
  color: #2a5cd8;
}

.forecast-status {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text);
}

.forecast-error {
  color: #d1483a;
}

.forecast-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: 8px;
}

.forecast-card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 6px;
  background: var(--color-background-mute);
  text-align: center;
}

.forecast-date {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-heading);
}

.forecast-icon {
  width: 40px;
  height: 40px;
}

.forecast-desc {
  margin: 0 0 6px;
  font-size: 11px;
  color: var(--color-text);
}

.forecast-temp {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

.temp-max {
  color: #d1483a;
}

.temp-min {
  color: #2a6fc9;
  margin-left: 6px;
  font-weight: 500;
}
</style>
