import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const client = axios.create({ baseURL: 'https://api.openweathermap.org/data/2.5' })

export function fetchCurrentWeather(cityNameEn) {
  return client.get('/weather', {
    params: { q: `${cityNameEn},KR`, appid: API_KEY, units: 'metric', lang: 'kr' },
  })
}

export function fetchCurrentWeatherByCoord(lat, lon) {
  return client.get('/weather', {
    params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
  })
}

export function fetchForecast(cityNameEn) {
  return client.get('/forecast', {
    params: { q: `${cityNameEn},KR`, appid: API_KEY, units: 'metric', lang: 'kr' },
  })
}

export function fetchForecastByCoord(lat, lon) {
  return client.get('/forecast', {
    params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
  })
}

export function fetchAirPollution(lat, lon) {
  return client.get('/air_pollution', {
    params: { lat, lon, appid: API_KEY },
  })
}
