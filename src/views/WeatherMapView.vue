<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { CITY_COORDS } from '@/data/cityCoords.js'
import { loadKakaoMaps } from '@/utils/loadKakaoMaps.js'

const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

const mapContainer = ref(null)
const mapError = ref('')

let mapInstance = null
let kakaoRef = null
let overlays = []
let stopWatchTemps = null

const toDisplayTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const goToDetail = (city) => {
  router.push(`/weather/${city.id}`)
}

function clearOverlays() {
  overlays.forEach((overlay) => overlay.setMap(null))
  overlays = []
}

function renderMarkers() {
  if (!mapInstance || !kakaoRef) return
  clearOverlays()

  weatherStore.weatherList.forEach((city) => {
    const coord = CITY_COORDS[city.id]
    if (!coord || city.temp === null || city.temp === undefined) return

    const position = new kakaoRef.maps.LatLng(coord.lat, coord.lon)
    const iconUrl = city.icon ? `https://openweathermap.org/img/wn/${city.icon}.png` : ''

    const el = document.createElement('div')
    el.className = 'kakao-city-marker'
    el.innerHTML = `
      <span class="kakao-marker-label">
        ${iconUrl ? `<img class="kakao-marker-icon" src="${iconUrl}" alt="${city.status}" />` : ''}
        <span>${city.name} ${toDisplayTemp(city.temp)}${configStore.unitSymbol}</span>
      </span>
    `
    el.addEventListener('click', () => goToDetail(city))

    const overlay = new kakaoRef.maps.CustomOverlay({
      position,
      content: el,
      clickable: true,
    })
    overlay.setMap(mapInstance)
    overlays.push(overlay)
  })
}

onMounted(async () => {
  try {
    const kakao = await loadKakaoMaps()
    kakaoRef = kakao

    // 초기 중심은 대략적인 국토 중앙, 이후 아래 bounds로 13개 지역이 모두 보이도록 재조정한다
    mapInstance = new kakao.maps.Map(mapContainer.value, {
      center: new kakao.maps.LatLng(36.4, 127.8),
      level: 13,
    })

    const bounds = new kakao.maps.LatLngBounds()
    Object.values(CITY_COORDS).forEach(({ lat, lon }) => {
      bounds.extend(new kakao.maps.LatLng(lat, lon))
    })
    mapInstance.setBounds(bounds, 40)

    renderMarkers()

    // 날씨 데이터가 비동기로 채워지면(초기 temp:null → 실제 값) 마커를 다시 그린다
    stopWatchTemps = watch(
      () => weatherStore.weatherList.map((c) => c.temp).join(','),
      renderMarkers,
    )
  } catch (err) {
    console.error(err)
    mapError.value = '카카오맵을 불러오지 못했습니다.'
  }
})

onBeforeUnmount(() => {
  if (stopWatchTemps) stopWatchTemps()
  clearOverlays()
  mapInstance = null
  kakaoRef = null
})
</script>

<template>
  <div class="map-page">
    <h2 class="page-title">🗺️ 날씨 지도</h2>

    <el-card class="map-card" shadow="always">
      <p v-if="mapError" class="empty-msg">{{ mapError }}</p>
      <div v-else ref="mapContainer" class="kakao-map"></div>

      <p v-if="weatherStore.isLoading" class="empty-msg map-note">
        ⏳ 날씨 정보를 불러오는 중입니다...
      </p>
      <p v-else-if="weatherStore.error" class="empty-msg map-note">{{ weatherStore.error }}</p>
    </el-card>
  </div>
</template>

<style scoped>
.map-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  background: var(--color-background);
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 20px;
  color: var(--color-heading);
}

.map-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.map-card :deep(.el-card__body) {
  padding: 24px;
}

.empty-msg {
  margin: 0;
  padding: 16px;
  color: var(--color-text);
  font-size: 13px;
  text-align: center;
}

.map-note {
  padding: 10px 0 0;
}

.kakao-map {
  width: 100%;
  height: 520px;
  border-radius: 12px;
  overflow: hidden;
}
</style>

<style>
/* 카카오맵 CustomOverlay는 Vue 스코프 밖에서 DOM으로 직접 생성되므로 전역 스타일로 정의한다 */
.kakao-city-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transform-origin: center bottom;
  transition: transform 0.15s ease;
}

.kakao-city-marker:hover {
  transform: scale(1.15);
}

/* 카카오맵 CustomOverlay는 raw DOM이라 실제 el-card를 마운트할 수 없어, 팔레트 색상을
   직접 지정해 카드형 팝업과 같은 톤으로만 맞춘다 */
.kakao-marker-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 4px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #eeeeee;
  color: #1a1a1a;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.kakao-marker-icon {
  width: 22px;
  height: 22px;
}
</style>
