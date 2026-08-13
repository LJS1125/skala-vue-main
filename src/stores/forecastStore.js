import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CITY_SEED } from '@/data/weatherData.js'
import { fetchForecast, fetchForecastByCoord } from '@/api/openWeatherApi.js'
import { groupForecastByDay } from '@/utils/groupForecastByDay.js'

export const useForecastStore = defineStore('forecast', () => {
  const forecastList = ref([])
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
      loadedCityId.value = cityId
    } catch (err) {
      error.value = '5일 예보 정보를 불러오지 못했습니다.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return { forecastList, isLoading, error, loadedCityId, fetchForecastByCity }
})
