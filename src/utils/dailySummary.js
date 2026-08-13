const CONDITION_PHRASES = [
  { keyword: '눈', phrase: '눈 오' },
  { keyword: '비', phrase: '비 오' },
  { keyword: '맑', phrase: '맑' },
  { keyword: '구름', phrase: '구름 많' },
  { keyword: '흐', phrase: '흐리' },
]

function getConditionPhrase(status) {
  const matched = CONDITION_PHRASES.find(({ keyword }) => status?.includes(keyword))
  return matched ? matched.phrase : '흐리'
}

function getTempPhrase(tempMax, tempMin) {
  if (tempMax >= 28) return '더운'
  if (tempMax >= 22) return '포근한'
  if (tempMin < 10) return '쌀쌀한'
  return '선선한'
}

function getTimeOfDayLabel(hour) {
  if (hour < 11) return '오전'
  if (hour < 17) return '오후'
  return '저녁'
}

// 오늘 날씨 상태 + 최고/최저 기온 + 시간대별 강수 확률을 조합해 한 줄 요약 문장을 만든다.
// todayHourly는 utils/groupForecastByDay.js의 getTodayHourlySlots() 결과 형태를 기대한다.
export function buildDailySummary(city, todayHourly = []) {
  if (!city || city.temp === null || city.temp === undefined) return ''

  const temps = todayHourly.length ? todayHourly.map((slot) => slot.temp) : [city.temp]
  const tempMax = Math.round(Math.max(...temps))
  const tempMin = Math.round(Math.min(...temps))

  const condition = getConditionPhrase(city.status)
  const tempPhrase = getTempPhrase(tempMax, tempMin)

  const rainiestSlot = todayHourly.reduce(
    (worst, slot) => (!worst || slot.pop > worst.pop ? slot : worst),
    null,
  )

  let summary = `오늘은 ${condition}고 ${tempPhrase} 하루`
  if (rainiestSlot && rainiestSlot.pop >= 40) {
    summary += `, ${getTimeOfDayLabel(rainiestSlot.hour)}엔 비 소식이 있어요`
  } else {
    summary += '예요'
  }

  return `${summary} (최고 ${tempMax}° · 최저 ${tempMin}°)`
}
