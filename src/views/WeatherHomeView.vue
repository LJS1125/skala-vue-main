<script setup>
import { ref, computed, watch, watchEffect, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useVisitStore } from '@/stores/visitStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useLocationStore } from '@/stores/locationStore'
import { useForecastStore } from '@/stores/forecastStore'
import { useConfigStore } from '@/stores/configStore'
import { fetchCurrentWeatherByCoord } from '@/api/openWeatherApi.js'
import { fetchCoordByAddress, fetchCoordByKeyword } from '@/api/kakaoApi.js'
import { getLifestyleIndices } from '@/utils/lifestyleIndex'
import { getTodayHourlySlots } from '@/utils/groupForecastByDay.js'
import { buildDailySummary } from '@/utils/dailySummary.js'
import { getWeatherLabel } from '@/utils/weatherLabel.js'
import { getTempAccentColor, getTempAccentLabel } from '@/utils/tempColor.js'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchHistory from '../components/exercise/SearchHistory.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import TempSummary from '../components/exercise/TempSummary.vue'
import FilterToolbar from '../components/exercise/FilterToolbar.vue'

const router = useRouter()
const visitStore = useVisitStore()
const weatherStore = useWeatherStore()
const locationStore = useLocationStore()
const forecastStore = useForecastStore()
const configStore = useConfigStore()

const toDisplayTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

// 내 위치 날씨 카드: locationStore가 감지한 좌표를 재사용해 날씨·예보를 함께 조회
watch(
  () => locationStore.coords,
  (coords) => {
    if (coords) {
      weatherStore.fetchMyLocationWeather(coords.lat, coords.lon)
      forecastStore.fetchForecastByLocation('my-location', coords.lat, coords.lon)
    }
  },
  { immediate: true },
)

// forecastStore는 상세보기 화면과 공유되므로, 지금 담긴 예보가 실제로 '내 위치' 것일 때만 사용한다
const myLocationTodayHourly = computed(() => {
  if (forecastStore.loadedCityId !== 'my-location') return []
  return getTodayHourlySlots(forecastStore.rawList)
})

const myLocationCity = computed(() => {
  if (weatherStore.myLocationStatus !== 'ready' || !weatherStore.myLocationWeather) return null
  return {
    ...weatherStore.myLocationWeather,
    name: locationStore.regionName ? `내 위치 · ${locationStore.regionName}` : '내 위치',
  }
})

const myLocationIconUrl = computed(() =>
  myLocationCity.value?.icon
    ? `https://openweathermap.org/img/wn/${myLocationCity.value.icon}@2x.png`
    : '',
)

const myLocationLifestyle = computed(() => getLifestyleIndices(myLocationCity.value))
const myLocationWeatherLabel = computed(() => getWeatherLabel(myLocationCity.value?.icon))
const myLocationAccentColor = computed(() => getTempAccentColor(myLocationCity.value?.temp))
const myLocationAccentLabel = computed(() => getTempAccentLabel(myLocationCity.value?.temp))

const myLocationDailySummary = computed(() =>
  buildDailySummary(myLocationCity.value, myLocationTodayHourly.value),
)

const goToMyLocationDetail = () => {
  router.push('/weather/my-location')
}

// 통합 검색: 고정 목록 안에 있으면 하이라이트/스크롤, 없으면 카카오+OpenWeather로 자동 조회
const searchQuery = ref('')
const searchStatus = ref('idle') // idle | loading | success | error
const searchApiResult = ref(null)
const searchError = ref('')

// 타이핑 중 매 글자마다 필터링이 즉시 재계산되지 않도록 300ms 디바운스한 값을 따로 둔다
const debouncedSearchQuery = ref('')
let searchDebounceTimer = null
watch(
  searchQuery,
  (newVal) => {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      debouncedSearchQuery.value = newVal
    }, 300)
  },
  { immediate: true },
)

const cardRefs = {}
const setCardRef = (cityId, el) => {
  if (el) cardRefs[cityId] = el
}
const scrollToCard = (cityId) => {
  nextTick(() => {
    cardRefs[cityId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// 카카오 주소 검색으로 먼저 좌표를 찾고, 실패하면 키워드 검색으로 한 번 더 시도
const resolvePlaceCoord = async (query) => {
  const addressRes = await fetchCoordByAddress(query)
  const addressDoc = addressRes.data.documents?.[0]
  if (addressDoc) {
    return { lat: Number(addressDoc.y), lon: Number(addressDoc.x), name: addressDoc.address_name }
  }

  const keywordRes = await fetchCoordByKeyword(query)
  const keywordDoc = keywordRes.data.documents?.[0]
  if (keywordDoc) {
    return { lat: Number(keywordDoc.y), lon: Number(keywordDoc.x), name: keywordDoc.place_name }
  }

  return null
}

const runSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  console.log(`검색 실행: ${query}`)

  // 고정 지역 목록 안에서 먼저 찾아본다
  const localMatches = weatherStore.weatherList.filter((c) => c.name.includes(query))
  if (localMatches.length > 0) {
    searchStatus.value = 'idle'
    searchApiResult.value = null
    searchError.value = ''
    selectedCityId.value = localMatches[0].id
    selectedCityInfo.value = `${localMatches[0].name}이 선택되었습니다.`
    scrollToCard(localMatches[0].id)
    return
  }

  // 목록에 없으면 새 도시로 간주하고 API로 조회
  searchStatus.value = 'loading'
  searchError.value = ''
  searchApiResult.value = null

  try {
    const place = await resolvePlaceCoord(query)
    if (!place) {
      searchError.value = '도시를 찾을 수 없습니다'
      searchStatus.value = 'error'
      return
    }

    const res = await fetchCurrentWeatherByCoord(place.lat, place.lon)
    const result = {
      id: 'search-result',
      name: place.name,
      temp: Math.round(res.data.main.temp),
      status: res.data.weather[0].description,
      icon: res.data.weather[0].icon,
      humidity: res.data.main.humidity,
      wind: res.data.wind.speed,
      lat: place.lat,
      lon: place.lon,
    }
    searchApiResult.value = result
    weatherStore.searchResultWeather = result
    searchStatus.value = 'success'
  } catch (err) {
    console.error(err)
    searchError.value = '도시를 찾을 수 없습니다'
    searchStatus.value = 'error'
  }
}

const goToSearchResultDetail = () => {
  router.push('/weather/search-result')
}

const mostViewedCityName = computed(() => {
  const cityId = visitStore.mostViewedCity
  if (!cityId) return null
  const city = weatherStore.weatherList.find((c) => c.id === cityId)
  return city ? city.name : null
})

// 조사 대상이 항상 "날씨"(받침 없음)로 끝나므로 조사는 항상 '를'
const mostViewedText = computed(() => {
  if (!mostViewedCityName.value) return ''
  return `안녕하세요 :) 오늘 ${mostViewedCityName.value} 날씨를 가장 많이 확인하셨네요`
})

// 기온 정렬 (null | 'desc' | 'asc') — FilterToolbar의 el-radio-group과 v-model:sort-order로 연결
const sortOrder = ref(null)

// 즐겨찾기 필터
const showFavoritesOnly = ref(false)
const toggleFavoritesOnly = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value
}
const toggleFavorite = (city) => {
  weatherStore.toggleFavorite(city)
}

// 검색어로 필터링 (비어있으면 원본 전체). 타이핑이 멈춘 뒤에만 반영되도록 디바운스된 값을 사용
const filteredWeatherList = computed(() => {
  const query = debouncedSearchQuery.value.trim()
  if (!query) return weatherStore.weatherList
  return weatherStore.weatherList.filter((city) => city.name.includes(query))
})

// 정렬 + 즐겨찾기 필터를 합쳐서 실제 화면에 뿌려줄 목록
const displayedWeatherList = computed(() => {
  let list = [...filteredWeatherList.value]

  if (showFavoritesOnly.value) {
    list = list.filter((city) => city.isFavorite)
  }

  if (sortOrder.value === 'desc') {
    list.sort((a, b) => b.temp - a.temp)
  } else if (sortOrder.value === 'asc') {
    list.sort((a, b) => a.temp - b.temp)
  } else if (sortOrder.value === 'favorite') {
    // 즐겨찾기 도시를 최상단으로, 그 외 순서는 그대로 유지(안정 정렬)
    list.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
  }

  return list
})

// 상단 요약(가장 더운/시원한 곳)은 검색·필터와 무관하게 고정 지역 전체 기준
const heroHottestCity = computed(() => {
  if (!weatherStore.weatherList.length) return null
  return weatherStore.weatherList.reduce((a, b) => (b.temp > a.temp ? b : a))
})
const heroCoolestCity = computed(() => {
  if (!weatherStore.weatherList.length) return null
  return weatherStore.weatherList.reduce((a, b) => (b.temp < a.temp ? b : a))
})

// 카드 클릭 시 상태바 문구
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedCityId = ref('')
const selectCity = (city) => {
  if (selectedCityId.value === city.id) {
    selectedCityId.value = ''
    selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
    return
  }
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

// 상세보기 버튼 → 상세 페이지로 라우팅
const goToDetail = (city) => {
  router.push(`/weather/${city.id}`)
}

// watchEffect로 검색어(디바운스)/즐겨찾기/정렬 3개 동시 추적
const searchSummary = ref('')
watchEffect(() => {
  const parts = []
  if (debouncedSearchQuery.value.trim()) parts.push(`검색어 "${debouncedSearchQuery.value.trim()}"`)
  if (showFavoritesOnly.value) parts.push('즐겨찾기만')
  if (sortOrder.value === 'desc') parts.push('높은 순 정렬')
  if (sortOrder.value === 'asc') parts.push('낮은 순 정렬')
  if (sortOrder.value === 'favorite') parts.push('즐겨찾기 우선 정렬')

  searchSummary.value =
    parts.length > 0 ? `현재 조건: ${parts.join(' · ')}` : '주요 도시 표시 중'
})

// 검색 기록 (800ms 디바운스, 최대 5개, 중복/빈값 제외)
const searchHistory = ref([])
let searchHistoryTimer = null
watch(searchQuery, (newVal) => {
  clearTimeout(searchHistoryTimer)
  searchHistoryTimer = setTimeout(() => {
    const query = newVal.trim()
    if (!query || searchHistory.value.includes(query)) return
    searchHistory.value.unshift(query)
    if (searchHistory.value.length > 5) {
      searchHistory.value.pop()
    }
  }, 800)
})

const applyHistorySearch = (query) => {
  clearTimeout(searchDebounceTimer)
  searchQuery.value = query
  debouncedSearchQuery.value = query
  runSearch()
}
const removeHistoryItem = (query) => {
  searchHistory.value = searchHistory.value.filter((q) => q !== query)
}
</script>

<template>
  <div class="weather-assignment">
    <section class="hero-section">
      <span class="hero-deco hero-deco-1" aria-hidden="true"></span>
      <span class="hero-deco hero-deco-2" aria-hidden="true"></span>

      <div class="hero-inner">
        <p v-if="mostViewedCityName" class="hero-visit-hint">{{ mostViewedText }}</p>

        <template v-if="myLocationCity">
          <p class="hero-location-name">
            <span class="pin-icon">📍</span> {{ myLocationCity.name }}
          </p>

          <div class="hero-temp-row">
            <img
              v-if="myLocationIconUrl"
              :src="myLocationIconUrl"
              class="hero-weather-icon"
              :alt="myLocationCity.status"
            />
            <span class="hero-temp">
              {{ toDisplayTemp(myLocationCity.temp) }}{{ configStore.unitSymbol }}
            </span>
          </div>

          <p class="hero-status-line" :style="{ color: myLocationAccentColor }">
            {{ myLocationWeatherLabel }} · {{ myLocationAccentLabel }}
          </p>
          <p v-if="myLocationLifestyle" class="hero-clothing-line">
            {{ myLocationLifestyle.clothing.icon }} {{ myLocationLifestyle.clothing.label }}
          </p>

          <div v-if="myLocationTodayHourly.length" class="hero-hourly-strip">
            <div
              v-for="(slot, index) in myLocationTodayHourly"
              :key="slot.hour"
              class="hero-hour-chip"
              :class="{ 'is-now': index === 0 }"
            >
              <span class="hero-hour-label">{{ index === 0 ? '지금' : slot.label }}</span>
              <img
                v-if="slot.icon"
                :src="`https://openweathermap.org/img/wn/${slot.icon}.png`"
                class="hero-hour-icon"
                :alt="slot.description"
              />
              <span class="hero-hour-temp">{{ toDisplayTemp(slot.temp) }}°</span>
            </div>
          </div>

          <p v-if="myLocationDailySummary" class="hero-summary">{{ myLocationDailySummary }}</p>

          <el-button class="hero-detail-btn" round @click="goToMyLocationDetail">
            상세보기
          </el-button>
        </template>

        <p
          v-else-if="locationStore.isLoading || weatherStore.myLocationStatus === 'loading'"
          class="hero-empty"
        >
          ⏳ 내 위치 날씨를 확인하는 중입니다...
        </p>
        <p v-else class="hero-empty"><span class="pin-icon">📍</span> 위치 정보를 가져올 수 없어요</p>
      </div>
    </section>

    <div class="content-area">
      <BaseDashboardCard>
        <h3 class="section-title">🔍 도시 검색</h3>
        <div class="search-row">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="도시 이름 입력 (목록에 없으면 자동으로 검색해요)"
            @keyup.enter="runSearch"
          />
          <el-button type="primary" @click="runSearch">검색</el-button>
        </div>

        <SearchHistory
          :history="searchHistory"
          @apply-history="applyHistorySearch"
          @remove-history="removeHistoryItem"
        />

        <p v-if="searchStatus === 'loading'" class="empty-msg">검색 중...</p>
        <p v-else-if="searchStatus === 'error'" class="empty-msg">{{ searchError }}</p>
        <WeatherCard
          v-else-if="searchStatus === 'success' && searchApiResult"
          :city="searchApiResult"
          :interactive="false"
          :show-favorite="false"
          @click-detail="goToSearchResultDetail"
        />
      </BaseDashboardCard>

      <BaseDashboardCard>
        <div class="grid-header">
          <h3 class="section-title">🏙️ 전국 주요 거점 도시</h3>
          <TempSummary :hottest-city="heroHottestCity" :coolest-city="heroCoolestCity" />
        </div>

        <p v-if="weatherStore.isLoading" class="empty-msg">⏳ 날씨 정보를 불러오는 중입니다...</p>
        <p v-else-if="weatherStore.error" class="empty-msg">{{ weatherStore.error }}</p>

        <template v-else>
          <FilterToolbar
            v-model:sort-order="sortOrder"
            :show-favorites-only="showFavoritesOnly"
            @toggle-favorites="toggleFavoritesOnly"
          />

          <p class="search-summary">{{ searchSummary }}</p>

          <div class="weather-card-list">
            <div
              v-for="city in displayedWeatherList"
              :key="city.id"
              :ref="(el) => setCardRef(city.id, el)"
            >
              <WeatherCard
                :city="city"
                :is-selected="city.id === selectedCityId"
                @select-card="selectCity"
                @click-detail="goToDetail"
                @toggle-favorite="toggleFavorite"
              />
            </div>
          </div>

          <p v-if="displayedWeatherList.length === 0" class="empty-msg">
            검색 결과와 일치하는 도시가 없습니다.
          </p>
        </template>
      </BaseDashboardCard>

      <p class="status-bar">{{ selectedCityInfo }}</p>
    </div>
  </div>
</template>

<style scoped>
.weather-assignment {
  width: 100%;
  max-width: clamp(320px, 92vw, 1200px);
  margin: 0 auto;
  box-sizing: border-box;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  color: var(--color-text);
}

/* ── 히어로 ── */
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 28px 24px 32px;
  margin-bottom: 20px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-hero, 24px);
}

.hero-deco {
  position: absolute;
  border-radius: 50%;
  background: var(--color-background-mute);
  pointer-events: none;
}

.hero-deco-1 {
  width: 170px;
  height: 170px;
  top: -70px;
  right: -50px;
}

.hero-deco-2 {
  width: 90px;
  height: 90px;
  top: 50px;
  right: 70px;
  background: var(--color-background-mute);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 420px;
}

.pin-icon {
  color: var(--color-pin);
}

.hero-visit-hint {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.hero-location-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading);
}

.hero-temp-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hero-weather-icon {
  width: 44px;
  height: 44px;
  margin-left: -6px;
}

.hero-temp {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-heading);
}

.hero-status-line {
  margin: 6px 0 2px;
  font-size: 14px;
  font-weight: 700;
}

.hero-clothing-line {
  margin: 0 0 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.hero-hourly-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.hero-hour-chip {
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

.hero-hour-chip.is-now {
  background: var(--color-heading);
}

.hero-hour-chip.is-now .hero-hour-label,
.hero-hour-chip.is-now .hero-hour-temp {
  color: #ffffff;
}

.hero-hour-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-heading);
}

.hero-hour-icon {
  width: 28px;
  height: 28px;
}

.hero-hour-temp {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text);
}

.hero-summary {
  margin: 16px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-heading);
}

.hero-detail-btn {
  margin-top: 18px;
  background: var(--color-heading);
  border: none;
  color: #ffffff;
  font-weight: 700;
}

.hero-detail-btn:hover {
  background: #000000;
}

.hero-empty {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

/* ── 히어로 아래 콘텐츠 ── */
.content-area {
  padding: 0 0 48px;
  background: var(--color-background);
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 14px;
  color: var(--color-heading);
}

.grid-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.grid-header .section-title {
  margin-bottom: 0;
}

.search-summary {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--color-text);
}

.empty-msg {
  margin: 8px 0 0;
  padding: 16px;
  color: var(--color-text);
  font-size: 13px;
  text-align: center;
}

.status-bar {
  margin: 0;
  padding: 14px 16px;
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border);
  border-radius: 12px;
  color: var(--color-accent-text);
  font-weight: 600;
  font-size: 14px;
  text-align: center;
}

.search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.search-input {
  flex: 1;
  padding: 11px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background: var(--color-background);
  color: var(--color-heading);
  transition:
    border-color 0.2s ease,
    background-color 0.3s ease,
    color 0.3s ease;
}

.search-input:focus {
  border-color: var(--color-accent-text);
  box-shadow: 0 0 0 3px var(--color-accent-border);
}

.weather-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.weather-card-list :deep(.weather-card) {
  margin-bottom: 0;
  height: 100%;
}
</style>
