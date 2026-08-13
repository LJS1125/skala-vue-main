<script setup>
import { getWeatherLabel } from '@/utils/weatherLabel'

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
    <p v-if="isLoading" class="forecast-status">⏳ 5일 예보를 불러오는 중입니다...</p>
    <p v-else-if="error" class="forecast-status forecast-error">{{ error }}</p>

    <div v-else class="forecast-list">
      <el-card v-for="day in forecastList" :key="day.date" class="forecast-card" shadow="hover">
        <p class="forecast-date">{{ day.dateLabel }}</p>
        <img
          class="forecast-icon"
          :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`"
          :alt="day.description"
        />
        <p class="forecast-desc">{{ getWeatherLabel(day.icon) }}</p>
        <p class="forecast-temp">
          <span class="temp-max">{{ day.tempMax }}°</span>
          <span class="temp-min">{{ day.tempMin }}°</span>
        </p>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
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
  display: flex;
  gap: 6px;
}

.forecast-card {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-mute);
  text-align: center;
}

.forecast-card :deep(.el-card__body) {
  padding: 10px 4px;
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
  color: var(--color-heading);
}

.temp-min {
  color: var(--color-text-muted);
  margin-left: 6px;
  font-weight: 500;
}
</style>
