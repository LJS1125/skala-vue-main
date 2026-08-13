import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useVisitStore = defineStore('visit', () => {
  const cityViewCounts = ref({})
  const totalVisits = ref(0)

  const mostViewedCity = computed(() => {
    const entries = Object.entries(cityViewCounts.value)
    if (!entries.length) return null
    return entries.reduce((max, cur) => (cur[1] > max[1] ? cur : max))[0]
  })

  function recordView(cityId) {
    cityViewCounts.value[cityId] = (cityViewCounts.value[cityId] || 0) + 1
    totalVisits.value += 1
  }

  return {
    cityViewCounts,
    totalVisits,
    mostViewedCity,
    recordView,
  }
})
