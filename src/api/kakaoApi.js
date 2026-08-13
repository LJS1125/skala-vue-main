import axios from 'axios'

const API_KEY = import.meta.env.VITE_KAKAO_API_KEY
const client = axios.create({
  baseURL: 'https://dapi.kakao.com/v2/local',
  headers: { Authorization: `KakaoAK ${API_KEY}` },
})

export function fetchRegionByCoord(longitude, latitude) {
  return client.get('/geo/coord2regioncode.json', { params: { x: longitude, y: latitude } })
}

export function fetchCoordByAddress(query) {
  return client.get('/search/address.json', { params: { query } })
}

export function fetchCoordByKeyword(query) {
  return client.get('/search/keyword.json', { params: { query } })
}
