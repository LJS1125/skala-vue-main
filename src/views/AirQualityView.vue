<script setup>
import { onMounted } from 'vue'
import { useAirQualityStore } from '@/stores/airQualityStore'
import { getPm25Percent, getPm10Percent, getGradeSummary } from '@/utils/airQuality'

const airQualityStore = useAirQualityStore()

onMounted(() => {
  airQualityStore.fetchAllAirQuality()
})
</script>

<template>
  <div class="air-page">
    <h2 class="page-title">🌫️ 대기질 현황</h2>
    <p class="page-desc">13개 지역의 미세먼지(PM10)·초미세먼지(PM2.5) 농도와 등급을 확인하세요.</p>

    <p v-if="airQualityStore.isLoading" class="empty-msg">⏳ 대기질 정보를 불러오는 중입니다...</p>
    <el-alert
      v-else-if="airQualityStore.error"
      :title="airQualityStore.error"
      type="error"
      show-icon
      :closable="false"
    />

    <div v-else class="air-card-list">
      <el-card v-for="city in airQualityStore.airList" :key="city.id" class="air-card" shadow="hover">
        <div class="air-card-header">
          <p class="air-city-name">{{ city.name }}</p>
          <span class="air-grade-badge">{{ city.grade }}</span>
        </div>

        <div class="air-metric">
          <div class="air-metric-label">
            <span>PM2.5</span>
            <span>{{ city.pm2_5 }}㎍/m³</span>
          </div>
          <el-progress :percentage="getPm25Percent(city.pm2_5)" :show-text="false" :stroke-width="8" />
        </div>

        <div class="air-metric">
          <div class="air-metric-label">
            <span>PM10</span>
            <span>{{ city.pm10 }}㎍/m³</span>
          </div>
          <el-progress :percentage="getPm10Percent(city.pm10)" :show-text="false" :stroke-width="8" />
        </div>

        <p v-if="city.grade" class="air-summary">{{ getGradeSummary(city.grade) }}</p>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.air-page {
  width: 100%;
  max-width: clamp(320px, 92vw, 1200px);
  margin: 0 auto;
  padding: 32px 24px 48px;
  box-sizing: border-box;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  color: var(--color-text);
  background: var(--color-background);
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px;
  color: var(--color-heading);
}

.page-desc {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--color-text);
}

.empty-msg {
  margin: 0;
  padding: 16px;
  color: var(--color-text);
  font-size: 13px;
  text-align: center;
}

.air-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.air-card {
  border-radius: var(--radius-card, 16px);
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.air-card :deep(.el-card__body) {
  padding: 20px;
}

.air-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}

.air-city-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-heading);
}

.air-grade-badge {
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-heading);
}

.air-metric {
  margin-bottom: 14px;
}

.air-metric:last-child {
  margin-bottom: 0;
}

.air-metric-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}

.air-summary {
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
}
</style>
