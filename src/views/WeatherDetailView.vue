<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { weatherList } from '../data/weatherData.js'

const route = useRoute()
const router = useRouter()

const city = ref(null)
const journey = ref([])

const TIME_SLOTS = ['06시', '09시', '12시', '15시', '18시', '21시']

// ±3도 범위의 랜덤 오프셋을 가진 Mock 시간대별 온도 생성
const buildJourney = (baseTemp) => {
  return TIME_SLOTS.map((label) => {
    const offset = Math.round(Math.random() * 6 - 3) // -3 ~ +3
    return { label, temp: baseTemp + offset }
  })
}

onMounted(() => {
  const found = weatherList.find((c) => c.id === route.params.cityId)
  if (found) {
    city.value = found
    journey.value = buildJourney(found.temp)
  }
})

// 곡선 그래프 좌표 계산 (Catmull-Rom → Bezier)
const CHART_WIDTH = 320
const CHART_HEIGHT = 120
const CHART_PADDING = 16

const chartPoints = computed(() => {
  if (!journey.value.length) return []
  const temps = journey.value.map((p) => p.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const range = maxTemp - minTemp || 1
  const usableWidth = CHART_WIDTH - CHART_PADDING * 2
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2

  return journey.value.map((point, index) => {
    const x = CHART_PADDING + (usableWidth * index) / (journey.value.length - 1)
    const y = CHART_PADDING + usableHeight * (1 - (point.temp - minTemp) / range)
    return { ...point, x, y }
  })
})

const chartPath = computed(() => {
  const points = chartPoints.value
  if (points.length < 2) return ''

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
})

// 온도/상태 조건에 따른 한 줄 요약 문구
const summaryText = computed(() => {
  if (!city.value) return ''
  const { temp, status } = city.value
  if (status.includes('비')) return '☔ 오늘은 비 소식이 있어요, 우산을 챙기세요'
  if (temp >= 28) return '🥵 무더운 하루예요, 수분 보충을 잊지 마세요'
  if (temp >= 25) return '👕 낮엔 반팔이면 충분해요'
  if (temp < 20) return '🧥 쌀쌀할 수 있어요, 겉옷을 챙기세요'
  return '🙂 무난하고 선선한 하루예요'
})

const toggleFavorite = () => {
  if (city.value) city.value.isFavorite = !city.value.isFavorite
}

const goToChecklist = () => {
  if (city.value) router.push(`/checklist/${city.value.id}`)
}
</script>

<template>
  <div class="detail-page">
    <RouterLink to="/" class="back-link">← 메인으로 돌아가기</RouterLink>

    <div v-if="city" class="journey-card">
      <header class="city-header">
        <div>
          <h2 class="city-name">{{ city.name }}</h2>
          <p class="city-status">{{ city.status }}</p>
        </div>
        <p class="city-temp">{{ city.temp }}°C</p>
      </header>

      <p class="city-meta">💧 습도 {{ city.humidity }}% · 🌬️ 바람 {{ city.wind }}m/s</p>

      <section class="timeline-section">
        <h3 class="section-title">🗓️ 오늘의 여정</h3>
        <svg
          class="journey-chart"
          :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
          role="img"
          aria-label="시간대별 예상 기온 그래프"
        >
          <path class="journey-line" :d="chartPath" fill="none" />
          <g v-for="point in chartPoints" :key="point.label">
            <circle :cx="point.x" :cy="point.y" r="3.5" class="journey-dot" />
            <text :x="point.x" :y="point.y - 8" class="journey-temp-label">
              {{ point.temp }}°
            </text>
            <text :x="point.x" :y="CHART_HEIGHT - 2" class="journey-time-label">
              {{ point.label }}
            </text>
          </g>
        </svg>
      </section>

      <p class="summary-text">{{ summaryText }}</p>

      <div class="action-row">
        <button
          type="button"
          class="favorite-btn"
          :class="{ 'is-active': city.isFavorite }"
          @click="toggleFavorite"
        >
          {{ city.isFavorite ? '⭐ 즐겨찾기됨' : '☆ 즐겨찾기' }}
        </button>
        <button type="button" class="checklist-btn" @click="goToChecklist">
          🎒 오늘 뭐 챙길까요?
        </button>
      </div>
    </div>

    <div v-else class="not-found">
      <p>해당 도시 정보를 찾을 수 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  color: #1f2937;
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: #4c8bf5;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.journey-card {
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(76, 139, 245, 0.08);
}

.city-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.city-name {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
}

.city-status {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.city-temp {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: #2a5cd8;
}

.city-meta {
  margin: 12px 0 0;
  font-size: 12px;
  color: #9097a3;
}

.timeline-section {
  margin-top: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 10px;
  color: #2a5cd8;
}

.journey-chart {
  width: 100%;
  height: auto;
  overflow: visible;
}

.journey-line {
  stroke: #4c8bf5;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.journey-dot {
  fill: #4c8bf5;
}

.journey-temp-label {
  font-size: 9px;
  fill: #374151;
  text-anchor: middle;
  font-weight: 600;
}

.journey-time-label {
  font-size: 8px;
  fill: #9097a3;
  text-anchor: middle;
}

.summary-text {
  margin: 20px 0 0;
  padding: 12px 14px;
  background: #f4f9ff;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.action-row {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.favorite-btn,
.checklist-btn {
  flex: 1;
  border: 1px solid #cfd8e3;
  background: #fff;
  color: #374151;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.favorite-btn.is-active {
  background: #fff6e0;
  border-color: #f5a623;
  color: #b8791a;
}

.checklist-btn:hover {
  background: #4c8bf5;
  border-color: #4c8bf5;
  color: #fff;
}

.not-found {
  padding: 40px 0;
  text-align: center;
  color: #9097a3;
}
</style>
