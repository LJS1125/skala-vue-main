<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { weatherList } from '../data/weatherData.js'

const router = useRouter()

const CITY_POSITIONS = [
  { cityId: 'city_01', x: 140, y: 90 }, // 서울 - 위쪽 중앙
  { cityId: 'city_02', x: 140, y: 118 }, // 수원 - 서울 바로 아래
  { cityId: 'city_05', x: 195, y: 110 }, // 강릉 - 오른쪽 위(동해안)
  { cityId: 'city_03', x: 200, y: 290 }, // 부산 - 오른쪽 아래
  { cityId: 'city_04', x: 110, y: 380 }, // 제주 - 맨 아래 별도 섬
]

const mapMarkers = computed(() =>
  CITY_POSITIONS.map((pos) => {
    const city = weatherList.find((c) => c.id === pos.cityId)
    return { ...pos, city }
  }).filter((marker) => marker.city),
)

const goToDetail = (city) => {
  router.push(`/weather/${city.id}`)
}
</script>

<template>
  <div class="map-page">
    <h2 class="page-title">🗺️ 날씨 지도</h2>

    <div class="map-card">
      <svg class="korea-map" viewBox="0 0 300 420" role="img" aria-label="전국 도시별 날씨 지도">
        <path
          class="peninsula"
          d="M 130 40 L 168 34 L 195 68 L 188 108 L 210 148 L 203 198
             L 228 228 L 218 268 L 188 298 L 168 320 L 140 330
             L 118 300 L 98 258 L 90 200 L 96 150 L 80 110 L 90 68 Z"
        />
        <ellipse class="jeju-island" cx="110" cy="380" rx="38" ry="16" />

        <g
          v-for="marker in mapMarkers"
          :key="marker.cityId"
          class="city-marker"
          :class="{ 'is-hot': marker.city.temp >= 25, 'is-cool': marker.city.temp < 25 }"
          tabindex="0"
          role="button"
          :aria-label="`${marker.city.name} 상세보기`"
          @click="goToDetail(marker.city)"
          @keyup.enter="goToDetail(marker.city)"
        >
          <circle :cx="marker.x" :cy="marker.y" r="9" class="marker-dot" />
          <text :x="marker.x + 14" :y="marker.y - 3" class="marker-name">
            {{ marker.city.name }}
          </text>
          <text :x="marker.x + 14" :y="marker.y + 12" class="marker-temp">
            {{ marker.city.temp }}°C
          </text>
        </g>
      </svg>

      <div class="legend">
        <span class="legend-item">
          <span class="legend-dot is-hot"></span>
          25도 이상
        </span>
        <span class="legend-item">
          <span class="legend-dot is-cool"></span>
          25도 미만
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 20px;
  color: var(--color-heading);
}

.map-card {
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(76, 139, 245, 0.08);
}

.korea-map {
  width: 100%;
  height: auto;
  display: block;
}

.peninsula {
  fill: #eef2f7;
  stroke: #cfd8e3;
  stroke-width: 2;
}

.jeju-island {
  fill: #eef2f7;
  stroke: #cfd8e3;
  stroke-width: 2;
}

.city-marker {
  cursor: pointer;
  outline: none;
}

.marker-dot {
  transition: r 0.15s ease;
}

.city-marker.is-hot .marker-dot {
  fill: #ff6b5b;
}

.city-marker.is-cool .marker-dot {
  fill: #4c8bf5;
}

.city-marker:hover .marker-dot,
.city-marker:focus-visible .marker-dot {
  r: 11;
}

.marker-name {
  font-size: 13px;
  font-weight: 700;
  fill: #1f2937;
}

.marker-temp {
  font-size: 11px;
  fill: #6b7280;
}

.city-marker.is-hot .marker-name {
  fill: #d1483a;
}

.city-marker.is-cool .marker-name {
  fill: #2a6fc9;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  font-size: 13px;
  color: #6b7280;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.is-hot {
  background: #ff6b5b;
}

.legend-dot.is-cool {
  background: #4c8bf5;
}
</style>
