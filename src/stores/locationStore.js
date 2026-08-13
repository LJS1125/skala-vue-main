import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchRegionByCoord } from '@/api/kakaoApi.js'

const FALLBACK_REGION = '서울'

export const useLocationStore = defineStore('location', () => {
  const regionName = ref('')
  const coords = ref(null) // { lat, lon } | null
  const isLoading = ref(false)
  const error = ref(null)

  function detectLocation() {
    if (!navigator.geolocation) {
      error.value = '위치 정보를 가져올 수 없어요.'
      return
    }

    isLoading.value = true
    error.value = null

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords
        coords.value = { lat: latitude, lon: longitude }
        try {
          const res = await fetchRegionByCoord(longitude, latitude)
          const region = res.data.documents?.[0]
          regionName.value = region
            ? `${region.region_1depth_name} ${region.region_2depth_name}`
            : FALLBACK_REGION
        } catch (err) {
          error.value = '위치 정보를 변환하지 못했습니다.'
          regionName.value = FALLBACK_REGION
          console.error(err)
        } finally {
          isLoading.value = false
        }
      },
      (err) => {
        console.error('geolocation error:', err)
        error.value = '위치 정보를 가져올 수 없어요.'
        isLoading.value = false
      },
      { timeout: 5000 },
    )
  }

  return { regionName, coords, isLoading, error, detectLocation }
})
