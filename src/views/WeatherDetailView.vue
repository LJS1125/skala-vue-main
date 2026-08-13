<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useVisitStore } from '@/stores/visitStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useForecastStore } from '@/stores/forecastStore'
import { useAirQualityStore } from '@/stores/airQualityStore'
import { getLifestyleIndices } from '@/utils/lifestyleIndex'
import { getWeatherLabel } from '@/utils/weatherLabel'
import { getTempAccentColor, getTempAccentLabel } from '@/utils/tempColor'
import { getTodayHourlySlots } from '@/utils/groupForecastByDay.js'
import ForecastList from '../components/exercise/ForecastList.vue'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const visitStore = useVisitStore()
const weatherStore = useWeatherStore()
const forecastStore = useForecastStore()
const airQualityStore = useAirQualityStore()

// 'city_xx' = 고정 지역, 'my-location' / 'search-result' = 내 위치·자유 검색으로 얻은 도시(재조회 없이 재사용)
const cityKey = computed(() => route.params.cityId)
const isFixedCity = computed(() => cityKey.value?.startsWith('city_') ?? false)

const city = computed(() => {
  if (cityKey.value === 'my-location') return weatherStore.myLocationWeather
  if (cityKey.value === 'search-result') return weatherStore.searchResultWeather
  return weatherStore.weatherList.find((c) => c.id === cityKey.value) || null
})

const cityIconUrl = computed(() =>
  city.value?.icon ? `https://openweathermap.org/img/wn/${city.value.icon}@2x.png` : '',
)

const weatherLabel = computed(() => getWeatherLabel(city.value?.icon))
const accentColor = computed(() => getTempAccentColor(city.value?.temp))
const accentLabel = computed(() => getTempAccentLabel(city.value?.temp))

const airGrade = computed(() =>
  isFixedCity.value ? airQualityStore.getGradeByCityId(cityKey.value) : null,
)
const lifestyle = computed(() => getLifestyleIndices(city.value, airGrade.value))

// 고정 지역은 방문 기록/예보/대기질을 즉시 조회
watch(
  cityKey,
  (key) => {
    if (!key || !key.startsWith('city_')) return
    visitStore.recordView(key)
    forecastStore.fetchForecastByCity(key)
    airQualityStore.fetchAllAirQuality()
  },
  { immediate: true },
)

// 내 위치/검색 결과는 좌표가 준비되는 시점(비동기 완료 후)에 좌표 기반으로 예보를 조회
watch(
  city,
  (c) => {
    if (!c || isFixedCity.value) return
    if (c.lat !== undefined && c.lon !== undefined) {
      forecastStore.fetchForecastByLocation(cityKey.value, c.lat, c.lon)
    }
  },
  { immediate: true },
)

// forecastStore는 여러 화면이 공유하므로, 지금 담긴 예보가 실제로 이 도시 것일 때만 오늘 시간대별 위젯에 사용한다
const todayHourlySlots = computed(() => {
  if (forecastStore.loadedCityId !== cityKey.value) return []
  return getTodayHourlySlots(forecastStore.rawList)
})

// 5일 예보의 첫째(오늘)/둘째(내일) 날짜 최고기온을 비교해 "내일은 오늘보다 N도 낮아요/높아요" 문구를 만든다
const tomorrowComparison = computed(() => {
  const days = forecastStore.forecastList
  if (!days || days.length < 2) return ''
  const diff = days[1].tempMax - days[0].tempMax
  if (diff === 0) return '내일은 오늘과 기온이 비슷해요'
  const word = diff > 0 ? '높아요' : '낮아요'
  return `내일은 오늘보다 ${Math.abs(diff)}도 ${word}`
})

const pageState = computed(() => {
  if (cityKey.value === 'my-location') {
    if (weatherStore.myLocationStatus === 'ready' && city.value) return 'ready'
    if (weatherStore.myLocationStatus === 'error') return 'error'
    return 'loading'
  }
  if (cityKey.value === 'search-result') {
    return city.value ? 'ready' : 'not-found'
  }
  if (weatherStore.isLoading) return 'loading'
  if (weatherStore.error) return 'error'
  return city.value ? 'ready' : 'not-found'
})

const pageErrorMessage = computed(() => {
  if (cityKey.value === 'my-location') return '내 위치 날씨를 가져올 수 없어요'
  return weatherStore.error || '날씨 정보를 불러오지 못했습니다.'
})

const pageNotFoundMessage = computed(() =>
  cityKey.value === 'search-result'
    ? '검색된 도시 정보가 없어요. 메인에서 다시 검색해 주세요.'
    : '해당 도시 정보를 찾을 수 없습니다.',
)

// 화씨 단위 선택 시 표시용 온도 변환
const displayTemp = computed(() => {
  if (!city.value) return null
  if (configStore.unit === 'fahrenheit') {
    return Math.round((city.value.temp * 9) / 5 + 32)
  }
  return city.value.temp
})

const toDisplayTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

// 곡선 그래프 좌표 계산 (Catmull-Rom → Bezier)
const CHART_WIDTH = 320
const CHART_HEIGHT = 120
const CHART_PADDING = 16

// 시간대별 카드와 동일하게 forecastStore의 오늘 예보 데이터(todayHourlySlots)를 그대로 사용해
// 좌표만 계산한다. 두 위젯이 같은 배열을 서로 다른 방식으로 렌더링할 뿐 데이터는 하나다.
const chartPoints = computed(() => {
  const slots = todayHourlySlots.value
  if (!slots.length) return []
  const temps = slots.map((p) => p.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const range = maxTemp - minTemp || 1
  const usableWidth = CHART_WIDTH - CHART_PADDING * 2
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2

  return slots.map((point, index) => {
    const x = CHART_PADDING + (usableWidth * index) / (Math.max(slots.length - 1, 1))
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
  if (city.value) weatherStore.toggleFavorite(city.value)
}

const goToChecklist = () => {
  if (city.value) router.push(`/checklist/${city.value.id}`)
}

const activeTab = ref('today')
</script>

<template>
  <div class="detail-page">
    <RouterLink to="/" class="back-link">← 메인으로 돌아가기</RouterLink>

    <p v-if="pageState === 'loading'" class="empty-msg">⏳ 날씨 정보를 불러오는 중입니다...</p>
    <el-alert
      v-else-if="pageState === 'error'"
      :title="pageErrorMessage"
      type="error"
      show-icon
      :closable="false"
    />

    <template v-else-if="pageState === 'ready'">
      <div class="detail-hero">
        <p class="detail-hero-name">{{ city.name }}</p>
        <div class="detail-hero-temp-row">
          <img v-if="cityIconUrl" :src="cityIconUrl" class="detail-hero-icon" :alt="city.status" />
          <span class="detail-hero-temp">{{ displayTemp }}{{ configStore.unitSymbol }}</span>
        </div>
        <p class="detail-hero-status" :style="{ color: accentColor }">
          {{ weatherLabel }} · {{ accentLabel }}
        </p>
      </div>

      <el-card class="detail-card" shadow="never">
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="🌡️ 오늘 상세" name="today">
            <section class="info-section">
              <h3 class="section-title">실시간 정보</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">💧 습도</span>
                  <span class="info-value">{{ city.humidity }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">🌬️ 바람</span>
                  <span class="info-value">{{ city.wind }}m/s</span>
                </div>
              </div>
              <p v-if="tomorrowComparison" class="tomorrow-line">📅 {{ tomorrowComparison }}</p>
            </section>

            <section v-if="lifestyle" class="lifestyle-section">
              <h3 class="section-title">생활 지수</h3>
              <div class="lifestyle-tags">
                <span class="lifestyle-chip">
                  {{ lifestyle.clothing.icon }} {{ lifestyle.clothing.label }}
                </span>
                <span class="lifestyle-chip">
                  {{ lifestyle.umbrella.icon }} {{ lifestyle.umbrella.label }}
                </span>
                <span class="lifestyle-chip">
                  {{ lifestyle.discomfort.icon }} {{ lifestyle.discomfort.label }}
                </span>
                <span v-if="lifestyle.mask" class="lifestyle-chip">
                  {{ lifestyle.mask.icon }} {{ lifestyle.mask.label }}
                </span>
              </div>
            </section>

            <section v-if="todayHourlySlots.length" class="hourly-section">
              <h3 class="section-title">⏰ 오늘 시간대별 날씨</h3>
              <div class="hourly-strip">
                <div
                  v-for="(slot, index) in todayHourlySlots"
                  :key="slot.hour"
                  class="hour-chip"
                  :class="{ 'is-now': index === 0 }"
                >
                  <span class="hour-chip-label">{{ index === 0 ? '지금' : slot.label }}</span>
                  <img
                    v-if="slot.icon"
                    :src="`https://openweathermap.org/img/wn/${slot.icon}.png`"
                    class="hour-chip-icon"
                    :alt="slot.description"
                  />
                  <span class="hour-chip-temp">{{ toDisplayTemp(slot.temp) }}°</span>
                  <span class="hour-chip-pop">💧{{ slot.pop }}%</span>
                </div>
              </div>
            </section>

            <section v-if="chartPoints.length" class="timeline-section">
              <h3 class="section-title">오늘의 여정</h3>
              <svg
                class="journey-chart"
                :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
                role="img"
                aria-label="시간대별 예상 기온 그래프"
              >
                <path class="journey-line" :d="chartPath" fill="none" />
                <g v-for="point in chartPoints" :key="point.hour">
                  <circle :cx="point.x" :cy="point.y" r="3.5" class="journey-dot" />
                  <text :x="point.x" :y="point.y - 8" class="journey-temp-label">
                    {{ toDisplayTemp(point.temp) }}{{ configStore.unitSymbol }}
                  </text>
                  <text :x="point.x" :y="CHART_HEIGHT - 2" class="journey-time-label">
                    {{ point.label }}
                  </text>
                </g>
              </svg>
            </section>

            <el-alert
              class="summary-alert"
              :title="summaryText"
              :closable="false"
              show-icon
            />

            <div v-if="isFixedCity" class="action-row">
              <el-button
                class="favorite-btn"
                :class="{ 'is-favorited': city.isFavorite }"
                round
                @click="toggleFavorite"
              >
                {{ city.isFavorite ? '⭐ 즐겨찾기됨' : '☆ 즐겨찾기' }}
              </el-button>
              <el-button type="primary" round @click="goToChecklist">
                🎒 오늘 뭐 챙길까요?
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🗓️ 5일 예보" name="forecast">
            <ForecastList
              :forecast-list="forecastStore.forecastList"
              :is-loading="forecastStore.isLoading"
              :error="forecastStore.error"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>

    <el-empty v-else :description="pageNotFoundMessage" />
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  color: var(--color-text);
  background: var(--color-background);
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-heading);
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

/* ── 히어로 ── */
.detail-hero {
  padding: 24px;
  margin-bottom: 16px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-hero, 24px);
}

.detail-hero-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading);
}

.detail-hero-temp-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-hero-icon {
  width: 44px;
  height: 44px;
  margin-left: -6px;
}

.detail-hero-temp {
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-heading);
}

.detail-hero-status {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
}

.detail-card {
  border-radius: var(--radius-card, 16px);
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.info-section,
.lifestyle-section,
.hourly-section,
.timeline-section {
  margin-top: 22px;
}

.info-section {
  margin-top: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 10px;
  color: var(--color-heading);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--color-background-mute);
}

.info-label {
  font-size: 12px;
  color: var(--color-text);
}

.info-value {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-heading);
}

.tomorrow-line {
  margin: 10px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
}

.lifestyle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lifestyle-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
  background: var(--color-background-soft);
}

/* ── 시간대별 스트립 ── */
.hourly-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.hour-chip {
  flex: 1;
  min-width: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  border-radius: 12px;
  background: var(--color-background-mute);
}

.hour-chip.is-now {
  background: var(--color-heading);
}

.hour-chip.is-now .hour-chip-label,
.hour-chip.is-now .hour-chip-temp {
  color: #ffffff;
}

.hour-chip-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-heading);
}

.hour-chip-icon {
  width: 28px;
  height: 28px;
}

.hour-chip-temp {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-heading);
}

.hour-chip-pop {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text);
}

.journey-chart {
  width: 100%;
  height: auto;
  overflow: visible;
}

.journey-line {
  stroke: var(--color-heading);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.journey-dot {
  fill: var(--color-heading);
}

.journey-temp-label {
  font-size: 9px;
  fill: var(--color-heading);
  text-anchor: middle;
  font-weight: 600;
}

.journey-time-label {
  font-size: 8px;
  fill: var(--color-text);
  text-anchor: middle;
}

.summary-alert {
  margin-top: 20px;
}

.action-row {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.action-row .el-button {
  flex: 1;
  margin-left: 0;
}

.favorite-btn.is-favorited {
  background: var(--color-heading);
  border-color: var(--color-heading);
  color: #ffffff;
}

.empty-msg {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text);
  font-size: 13px;
}
</style>
