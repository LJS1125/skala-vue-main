<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import SearchHistory from './SearchHistory.vue'
import WeatherCard from './WeatherCard.vue'
import TempSummary from './TempSummary.vue'
import FilterToolbar from './FilterToolbar.vue'

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    humidity: 45,
    wind: 2.1,
    isFavorite: false,
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 24,
    status: '비',
    humidity: 82,
    wind: 3.4,
    isFavorite: false,
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    humidity: 68,
    wind: 4.2,
    isFavorite: false,
  },
  {
    id: 'city_04',
    name: '제주',
    temp: 27,
    status: '맑음',
    humidity: 71,
    wind: 5.6,
    isFavorite: false,
  },
  {
    id: 'city_05',
    name: '강릉',
    temp: 22,
    status: '흐림',
    humidity: 60,
    wind: 3.0,
    isFavorite: false,
  },
])

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
  city.isFavorite = !city.isFavorite
}

// 검색어로 필터링 (비어있으면 원본 전체)
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
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

// 상세보기 버튼
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
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
    <h2 class="page-title">🌤️ 과제 3: 날씨 (컴포넌트)</h2>

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

      <TempSummary :hottest-city="hottestCity" :coolest-city="coolestCity" />

      <FilterToolbar
        :sort-order="sortOrder"
        :show-favorites-only="showFavoritesOnly"
        @toggle-sort-desc="toggleSortDesc"
        @toggle-sort-asc="toggleSortAsc"
        @toggle-favorites="toggleFavoritesOnly"
      />

      <p class="search-summary">{{ searchSummary }}</p>

      <WeatherCard
        v-for="city in displayedWeatherList"
        :key="city.id"
        :city="city"
        :is-selected="city.id === selectedCityId"
        @select-card="selectCity"
        @click-detail="showDetail"
        @toggle-favorite="toggleFavorite"
      />

      <p v-if="displayedWeatherList.length === 0" class="empty-msg">
        검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

<style scoped>
.weather-assignment {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  color: #1f2937;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 20px;
  color: #1f2937;
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
  color: #9097a3;
}

.empty-msg {
  margin: 8px 0 0;
  padding: 16px;
  color: #9097a3;
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
</style>
