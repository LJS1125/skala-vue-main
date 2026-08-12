import { reactive } from 'vue'

export const weatherList = reactive([
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
