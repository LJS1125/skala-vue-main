<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVisitStore } from '@/stores/visitStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useLocationStore } from '@/stores/locationStore'
import { fetchCurrentWeatherByCoord } from '@/api/openWeatherApi.js'
import { fetchCoordByAddress, fetchCoordByKeyword } from '@/api/kakaoApi.js'
import { getLifestyleIndices } from '@/utils/lifestyleIndex'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import SearchHistory from '../components/exercise/SearchHistory.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import TempSummary from '../components/exercise/TempSummary.vue'
import FilterToolbar from '../components/exercise/FilterToolbar.vue'

const router = useRouter()
const visitStore = useVisitStore()
const weatherStore = useWeatherStore()
const locationStore = useLocationStore()

onMounted(() => {
  locationStore.detectLocation()
})

// 내 위치 날씨 카드: locationStore가 감지한 좌표를 재사용해 별도로 조회
watch(
  () => locationStore.coords,
  (coords) => {
    if (coords) weatherStore.fetchMyLocationWeather(coords.lat, coords.lon)
  },
  { immediate: true },
)

const myLocationCity = computed(() => {
  if (weatherStore.myLocationStatus !== 'ready' || !weatherStore.myLocationWeather) return null
  return {
    ...weatherStore.myLocationWeather,
    name: locationStore.regionName ? `내 위치 · ${locationStore.regionName}` : '내 위치',
  }
})

const myLocationGreeting = computed(() => {
  if (!myLocationCity.value) return ''
  const lifestyle = getLifestyleIndices(myLocationCity.value)
  if (!lifestyle) return ''
  const place = locationStore.regionName || '내 위치'
  return `📍 현재 위치: ${place}, 오늘은 ${lifestyle.clothing.label}이에요`
})

// 자유 도시 검색 (10개 고정 목록·내 위치 카드와 별개)
const citySearchInput = ref('')
const citySearchStatus = ref('idle') // idle | loading | success | error
const citySearchResult = ref(null)
const citySearchError = ref('')

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

const searchCity = async () => {
  const query = citySearchInput.value.trim()
  if (!query) return

  citySearchStatus.value = 'loading'
  citySearchError.value = ''
  citySearchResult.value = null

  try {
    const place = await resolvePlaceCoord(query)
    if (!place) {
      citySearchError.value = '도시를 찾을 수 없습니다'
      citySearchStatus.value = 'error'
      return
    }

    const res = await fetchCurrentWeatherByCoord(place.lat, place.lon)
    citySearchResult.value = {
      id: `search-${query}`,
      name: place.name,
      temp: Math.round(res.data.main.temp),
      status: res.data.weather[0].description,
      humidity: res.data.main.humidity,
      wind: res.data.wind.speed,
    }
    citySearchStatus.value = 'success'
  } catch (err) {
    console.error(err)
    citySearchError.value = '도시를 찾을 수 없습니다'
    citySearchStatus.value = 'error'
  }
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

// 기온 정렬
const sortOrder = ref(null) // null | 'desc' | 'asc'
const toggleSortDesc = () => {
  sortOrder.value = sortOrder.value === 'desc' ? null : 'desc'
}
const toggleSortAsc = () => {
  sortOrder.value = sortOrder.value === 'asc' ? null : 'asc'
}

// 즐겨찾기 필터
const showFavoritesOnly = ref(false)
const toggleFavoritesOnly = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value
}
const toggleFavorite = (city) => {
  weatherStore.toggleFavorite(city)
}

// 검색어로 필터링 (비어있으면 원본 전체)
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
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
  }

  return list
})

// 최고/최저 기온 도시
const hottestCity = computed(() => {
  if (!displayedWeatherList.value.length) return null
  return displayedWeatherList.value.reduce((a, b) => (b.temp > a.temp ? b : a))
})
const coolestCity = computed(() => {
  if (!displayedWeatherList.value.length) return null
  return displayedWeatherList.value.reduce((a, b) => (b.temp < a.temp ? b : a))
})

// 검색 input
const searchQuery = ref('')

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

// selectedCityInfo 변경 감시
watch(selectedCityInfo, (newVal, oldVal) => {
  console.log(`상태바 변경: ${oldVal} → ${newVal}`)
})

// searchQuery 변경 감시
watchEffect(() => {
  console.log('검색어:', searchQuery.value)
})

// watchEffect로 검색어/즐겨찾기/정렬 3개 동시 추적
const searchSummary = ref('')
watchEffect(() => {
  const parts = []
  if (searchQuery.value.trim()) parts.push(`검색어 "${searchQuery.value.trim()}"`)
  if (showFavoritesOnly.value) parts.push('즐겨찾기만')
  if (sortOrder.value === 'desc') parts.push('높은 순 정렬')
  if (sortOrder.value === 'asc') parts.push('낮은 순 정렬')

  searchSummary.value =
    parts.length > 0 ? `현재 조건: ${parts.join(' · ')}` : '전체 도시 표시 중'
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
  searchQuery.value = query
}
const removeHistoryItem = (query) => {
  searchHistory.value = searchHistory.value.filter((q) => q !== query)
}
</script>

<template>
  <div class="weather-assignment">
    <h2 class="page-title">🌤️ 오늘 뭐 입지? 생활 날씨 대시보드</h2>
    <p v-if="mostViewedCityName" class="greeting-hint">{{ mostViewedText }}</p>
    <p v-if="myLocationGreeting" class="greeting-hint">{{ myLocationGreeting }}</p>
    <p v-else-if="locationStore.isLoading" class="greeting-hint">📍 위치 확인 중...</p>
    <p v-else-if="locationStore.error" class="greeting-hint">📍 위치 정보를 가져올 수 없어요</p>

    <BaseDashboardCard v-if="myLocationCity || locationStore.isLoading || locationStore.error">
      <h3 class="section-title">📍 내 위치 날씨</h3>
      <WeatherCard v-if="myLocationCity" :city="myLocationCity" :interactive="false" />
      <p v-else-if="locationStore.isLoading" class="empty-msg">⏳ 내 위치 날씨를 확인하는 중입니다...</p>
      <p v-else class="empty-msg">위치 정보를 가져올 수 없어요</p>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3 class="section-title">🌍 다른 도시 날씨 검색</h3>
      <div class="city-search-row">
        <input
          v-model="citySearchInput"
          type="text"
          class="city-search-input"
          placeholder="목록에 없는 도시 이름 입력 (예: 춘천)"
          @keyup.enter="searchCity"
        />
        <button type="button" class="city-search-btn" @click="searchCity">검색</button>
      </div>

      <p v-if="citySearchStatus === 'loading'" class="empty-msg">검색 중...</p>
      <p v-else-if="citySearchStatus === 'error'" class="empty-msg">{{ citySearchError }}</p>
      <WeatherCard
        v-else-if="citySearchStatus === 'success' && citySearchResult"
        :city="citySearchResult"
        :interactive="false"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <SearchBar :search-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
      <SearchHistory
        :history="searchHistory"
        @apply-history="applyHistorySearch"
        @remove-history="removeHistoryItem"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3 class="section-title">📋 지역별 날씨 현황</h3>

      <p v-if="weatherStore.isLoading" class="empty-msg">⏳ 날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="weatherStore.error" class="empty-msg">{{ weatherStore.error }}</p>

      <template v-else>
        <TempSummary :hottest-city="hottestCity" :coolest-city="coolestCity" />

        <FilterToolbar
          :sort-order="sortOrder"
          :show-favorites-only="showFavoritesOnly"
          @toggle-sort-desc="toggleSortDesc"
          @toggle-sort-asc="toggleSortAsc"
          @toggle-favorites="toggleFavoritesOnly"
        />

        <p class="search-summary">{{ searchSummary }}</p>

        <div class="weather-card-list">
          <WeatherCard
            v-for="city in displayedWeatherList"
            :key="city.id"
            :city="city"
            :is-selected="city.id === selectedCityId"
            @select-card="selectCity"
            @click-detail="goToDetail"
            @toggle-favorite="toggleFavorite"
          />
        </div>

        <p v-if="displayedWeatherList.length === 0" class="empty-msg">
          검색 결과와 일치하는 도시가 없습니다.
        </p>
      </template>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

<style scoped>
.weather-assignment {
  width: 100%;
  max-width: clamp(320px, 92vw, 1200px);
  margin: 0 auto;
  padding: 32px 24px 48px;
  box-sizing: border-box;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  color: var(--color-text);
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 20px;
  color: var(--color-heading);
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 14px;
  color: #2a5cd8;
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
  background: #eaf6ee;
  border: 1px solid #cfe8d8;
  border-radius: 12px;
  color: #2f7a4d;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
}

.greeting-hint {
  margin: 0 0 20px;
  padding: 12px 16px;
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border);
  border-radius: 12px;
  color: var(--color-accent-text);
  font-weight: 600;
  font-size: 13px;
  text-align: center;
}

.city-search-row {
  display: flex;
  gap: 8px;
}

.city-search-input {
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

.city-search-input:focus {
  border-color: #4c8bf5;
  box-shadow: 0 0 0 3px rgba(76, 139, 245, 0.15);
}

.city-search-btn {
  flex-shrink: 0;
  border: 1px solid #4c8bf5;
  background: #4c8bf5;
  color: #fff;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.city-search-btn:hover {
  background: #3a72d8;
  border-color: #3a72d8;
}

.weather-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

.weather-card-list :deep(.weather-row) {
  margin-bottom: 0;
}
</style>
