<template>
  <div class="weather-assignment">
    <h2 class="page-title">🌤️ 과제 1: 날씨 (Mockup)</h2>

    <!-- 검색 섹션 -->
    <section class="dashboard-card">
      <h3 class="section-title">🔍 도시 검색</h3>
      <!-- 3. 양방향 바인딩 : v-model 안 쓰고 :value + @input으로 직접 구현 -->
      <input
        class="search-input"
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="searchQuery"
        @input="onSearchInput"
      />
      <p class="search-echo">검색 중인 도시: {{ searchQuery }}</p>
    </section>

    <!-- 날씨 현황 섹션 -->
    <section class="dashboard-card">
      <h3 class="section-title">📋 지역별 날씨 현황</h3>

      <!-- 정렬 / 즐겨찾기 버튼 -->
      <div class="toolbar">
        <button
          type="button"
          class="sort-btn"
          :class="{ 'is-active': sortOrder === 'desc' }"
          @click="toggleSortDesc"
        >
          ▲ 높은 순
        </button>
        <button
          type="button"
          class="sort-btn"
          :class="{ 'is-active': sortOrder === 'asc' }"
          @click="toggleSortAsc"
        >
          ▼ 낮은 순
        </button>
        <button
          type="button"
          class="favorite-filter-btn"
          :class="{ 'is-active': showFavoritesOnly }"
          @click="toggleFavoritesOnly"
        >
          ⭐ 즐겨찾기만 보기
        </button>
      </div>

      <!-- 1. v-for + :key 필수 -->
      <div
        v-for="city in displayedWeatherList"
        :key="city.id"
        class="weather-row"
        :class="{
          'is-selected': city.id === selectedCityId,
          'is-hot': city.temp >= 25,
          'is-cool': city.temp < 25,
        }"
        tabindex="0"
        @click="selectCity(city)"
        @keyup.enter="selectCity(city)"
      >
        <!-- 즐겨찾기 버튼은 카드 클릭이랑 안 섞이게 .stop -->
        <button type="button" class="favorite-btn" @click.stop="toggleFavorite(city)">
          {{ city.isFavorite ? '⭐' : '☆' }}
        </button>

        <div class="weather-row__info">
          <p class="city-name">{{ city.name }} ({{ city.status }})</p>
          <p class="temp">현재 기온: {{ city.temp }}°C</p>

          <!-- 2. v-if / v-else -->
          <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
          <span v-else class="badge cold">❄️ 선선함 (25도 미만)</span>

          <!-- 5. 본인 데이터 추가 : 습도/바람 필드 -->
          <p class="meta">💧 습도 {{ city.humidity }}% · 🌬️ 바람 {{ city.wind }}m/s</p>
        </div>

        <!-- 4. 버블링 방지(.stop) -->
        <button class="detail-btn" @click.stop="showDetail(city.name, city.status)">
          상세보기
        </button>
      </div>
    </section>

    <!-- 4. 카드 클릭 시 상태바 표시 -->
    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 1. 기본 3개 도시 + 5. 제주·강릉 추가, 습도/바람 필드도 넣음
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

// 기온 정렬 (원본 배열은 안 건드리고 밑에서 computed로 따로 뺌)
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

// 정렬 + 즐겨찾기 필터를 합쳐서 실제 화면에 뿌려줄 목록
const displayedWeatherList = computed(() => {
  let list = [...weatherList.value]

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

// 3. 검색 input
const searchQuery = ref('')
const onSearchInput = (event) => {
  searchQuery.value = event.target.value
}

// 4. 카드 클릭 시 상태바 문구
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

// 4. 상세보기 버튼
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

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

/* 검색박스 / 리스트박스 공통 스타일 */
.dashboard-card {
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(76, 139, 245, 0.06);
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 14px;
  color: #2a5cd8;
}

.search-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #4c8bf5;
  box-shadow: 0 0 0 3px rgba(76, 139, 245, 0.15);
}

.search-echo {
  margin: 10px 0 0;
  font-size: 13px;
  color: #6b7280;
}

/* 정렬 / 즐겨찾기 버튼 줄 */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.sort-btn,
.favorite-filter-btn {
  border: 1px solid #cfd8e3;
  background: #fff;
  color: #374151;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.sort-btn.is-active,
.favorite-filter-btn.is-active {
  background: #4c8bf5;
  border-color: #4c8bf5;
  color: #fff;
}

/* 가로형 리스트 카드 */
.weather-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #eef2f7;
  border-radius: 12px;
  background: #fafcff;
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.weather-row:last-child {
  margin-bottom: 0;
}

.weather-row:hover,
.weather-row:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 139, 245, 0.14);
}

/* 기온 25도 기준으로 배경색 다르게 */
.weather-row.is-hot {
  background: linear-gradient(135deg, #fff6f4 0%, #ffe6e1 100%);
}

.weather-row.is-cool {
  background: linear-gradient(135deg, #f4f9ff 0%, #e7f1ff 100%);
}

/* 선택된 카드는 온도색이랑 어울리게 붉은/파란 계열로 강조 */
.weather-row.is-selected {
  border-color: transparent;
}

.weather-row.is-selected.is-hot {
  border-color: #ff6b5b;
  box-shadow: 0 0 0 3px rgba(255, 107, 91, 0.35);
}

.weather-row.is-selected.is-cool {
  border-color: #4c8bf5;
  box-shadow: 0 0 0 3px rgba(76, 139, 245, 0.35);
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  padding: 4px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #f5a623;
}

.weather-row__info {
  text-align: left;
}

.city-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
}

.temp {
  margin: 0 0 8px;
  font-size: 14px;
  color: #4b5563;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.hot {
  background: #ffe3e0;
  color: #d1483a;
}

.badge.cold {
  background: #e0f0ff;
  color: #2a6fc9;
}

.meta {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9097a3;
}

.detail-btn {
  flex-shrink: 0;
  border: 1px solid #cfd8e3;
  background: #fff;
  color: #374151;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.detail-btn:hover {
  background: #4c8bf5;
  border-color: #4c8bf5;
  color: #fff;
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
