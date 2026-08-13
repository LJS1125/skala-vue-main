import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CITY_SEED } from '@/data/weatherData.js'
import { fetchForecast, fetchForecastByCoord } from '@/api/openWeatherApi.js'
import { groupForecastByDay } from '@/utils/groupForecastByDay.js'

export const useForecastStore = defineStore('forecast', () => {
  const forecastList = ref([])
  // OpenWeatherMap의 원본 3시간 간격 목록. 오늘 시간대별 위젯처럼 일 단위로 뭉치기 전 데이터가 필요할 때 사용
  const rawList = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const loadedCityId = ref(null)

  async function fetchForecastByCity(cityId) {
    if (loadedCityId.value === cityId) return // 같은 도시면 재요청 생략

    const seed = CITY_SEED.find((c) => c.id === cityId)
    if (!seed) return

    isLoading.value = true
    error.value = null
    try {
      const res = seed.coord
        ? await fetchForecastByCoord(seed.coord.lat, seed.coord.lon)
        : await fetchForecast(seed.nameEn)
      forecastList.value = groupForecastByDay(res.data.list)
      rawList.value = res.data.list
      loadedCityId.value = cityId
    } catch (err) {
      error.value = '5일 예보 정보를 불러오지 못했습니다.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // 고정 지역이 아닌 도시(내 위치, 자유 검색 결과)를 좌표로 조회할 때 사용
  async function fetchForecastByLocation(key, lat, lon) {
    if (loadedCityId.value === key) return
    if (lat === undefined || lon === undefined) return

    isLoading.value = true
    error.value = null
    try {
      const res = await fetchForecastByCoord(lat, lon)
      forecastList.value = groupForecastByDay(res.data.list)
      rawList.value = res.data.list
      loadedCityId.value = key
    } catch (err) {
      error.value = '5일 예보 정보를 불러오지 못했습니다.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    forecastList,
    rawList,
    isLoading,
    error,
    loadedCityId,
    fetchForecastByCity,
    fetchForecastByLocation,
  }
})
