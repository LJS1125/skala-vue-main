import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CITY_SEED } from '@/data/weatherData.js'
import { fetchCurrentWeather, fetchCurrentWeatherByCoord } from '@/api/openWeatherApi.js'

function fetchSeedWeather(seed) {
  return seed.coord
    ? fetchCurrentWeatherByCoord(seed.coord.lat, seed.coord.lon)
    : fetchCurrentWeather(seed.nameEn)
}

export const useWeatherStore = defineStore('weather', () => {
  const weatherList = ref(
    CITY_SEED.map((seed) => ({
      id: seed.id,
      name: seed.name,
      temp: null,
      status: '',
      humidity: null,
      wind: null,
      isFavorite: false,
    })),
  )
  // 첫 렌더링부터 로딩 상태를 보여주기 위해 true로 시작하되,
  // 중복 호출 방지는 별도의(비반응형) in-flight 플래그로 판단한다.
  const isLoading = ref(true)
  const error = ref(null)
  let fetchPromise = null

  const myLocationWeather = ref(null)
  const myLocationStatus = ref('idle') // idle | loading | ready | error

  // 자유 검색으로 찾은 도시(고정 목록 밖) 날씨. 상세보기 화면에서 재조회 없이 재사용한다.
  const searchResultWeather = ref(null)

  function fetchAllWeather() {
    if (weatherList.value.every((c) => c.temp !== null)) return Promise.resolve()
    if (fetchPromise) return fetchPromise

    isLoading.value = true
    error.value = null
    fetchPromise = Promise.all(CITY_SEED.map((seed) => fetchSeedWeather(seed)))
      .then((results) => {
        results.forEach((res, idx) => {
          const target = weatherList.value[idx]
          target.temp = Math.round(res.data.main.temp)
          target.status = res.data.weather[0].description
          target.icon = res.data.weather[0].icon
          target.humidity = res.data.main.humidity
          target.wind = res.data.wind.speed
        })
      })
      .catch((err) => {
        error.value = '날씨 정보를 불러오지 못했습니다.'
        console.error(err)
      })
      .finally(() => {
        isLoading.value = false
        fetchPromise = null
      })

    return fetchPromise
  }

  function toggleFavorite(city) {
    city.isFavorite = !city.isFavorite
  }

  function fetchMyLocationWeather(lat, lon) {
    myLocationStatus.value = 'loading'
    return fetchCurrentWeatherByCoord(lat, lon)
      .then((res) => {
        myLocationWeather.value = {
          id: 'my-location',
          name: '내 위치',
          temp: Math.round(res.data.main.temp),
          status: res.data.weather[0].description,
          icon: res.data.weather[0].icon,
          humidity: res.data.main.humidity,
          wind: res.data.wind.speed,
          lat,
          lon,
        }
        myLocationStatus.value = 'ready'
      })
      .catch((err) => {
        console.error(err)
        myLocationStatus.value = 'error'
      })
  }

  return {
    weatherList,
    isLoading,
    error,
    fetchAllWeather,
    toggleFavorite,
    myLocationWeather,
    myLocationStatus,
    fetchMyLocationWeather,
    searchResultWeather,
  }
})
