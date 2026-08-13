// 온도 구간별 옷차림 추천
export function getClothingIndex(temp) {
  if (temp >= 28) return { icon: '👕', label: '반팔 추천' }
  if (temp >= 20) return { icon: '🧶', label: '얇은 가디건' }
  if (temp >= 10) return { icon: '🧥', label: '자켓' }
  return { icon: '🧣', label: '패딩/코트' }
}

// 현재 날씨 상태(비/눈 포함 여부)로 우산 필요 여부 판단
export function getUmbrellaIndex(status) {
  const needsUmbrella = Boolean(status) && (status.includes('비') || status.includes('눈'))
  return needsUmbrella ? { icon: '☂️', label: '우산 챙기세요' } : { icon: '☂️', label: '우산 필요 없음' }
}

// 온도+습도 기반 간이 불쾌지수
export function getDiscomfortIndex(temp, humidity) {
  const di = 0.81 * temp + 0.01 * humidity * (0.99 * temp - 14.3) + 46.3
  if (di >= 80) return { icon: '🥵', label: '매우 후덥지근' }
  if (di >= 75) return { icon: '😓', label: '약간 후덥지근' }
  return { icon: '😌', label: '쾌적함' }
}

// city(temp/status/humidity)를 받아 세 지수를 한 번에 계산
export function getLifestyleIndices(city) {
  if (!city || city.temp === null || city.temp === undefined) return null
  return {
    clothing: getClothingIndex(city.temp),
    umbrella: getUmbrellaIndex(city.status),
    discomfort: getDiscomfortIndex(city.temp, city.humidity ?? 0),
  }
}
