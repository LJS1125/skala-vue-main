import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CITY_SEED } from '@/data/weatherData.js'
import { CITY_COORDS } from '@/data/cityCoords.js'
import { fetchAirPollution } from '@/api/openWeatherApi.js'
import { getOverallGrade } from '@/utils/airQuality.js'

export const useAirQualityStore = defineStore('airQuality', () => {
  const airList = ref(
    CITY_SEED.map((seed) => ({
      id: seed.id,
      name: seed.name,
      pm2_5: null,
      pm10: null,
      grade: null,
    })),
  )
  const isLoading = ref(true)
  const error = ref(null)
  let fetchPromise = null

  function fetchAllAirQuality() {
    if (airList.value.every((c) => c.pm2_5 !== null)) return Promise.resolve()
    if (fetchPromise) return fetchPromise

    isLoading.value = true
    error.value = null
    fetchPromise = Promise.all(
      CITY_SEED.map((seed) => {
        const coord = CITY_COORDS[seed.id]
        return fetchAirPollution(coord.lat, coord.lon)
      }),
    )
      .then((results) => {
        results.forEach((res, idx) => {
          const target = airList.value[idx]
          const components = res.data.list[0].components
          target.pm2_5 = Math.round(components.pm2_5)
          target.pm10 = Math.round(components.pm10)
          target.grade = getOverallGrade(target.pm2_5, target.pm10)
        })
      })
      .catch((err) => {
        error.value = '대기질 정보를 불러오지 못했습니다.'
        console.error(err)
      })
      .finally(() => {
        isLoading.value = false
        fetchPromise = null
      })

    return fetchPromise
  }

  function getGradeByCityId(cityId) {
    return airList.value.find((c) => c.id === cityId)?.grade ?? null
  }

  return { airList, isLoading, error, fetchAllAirQuality, getGradeByCityId }
})
