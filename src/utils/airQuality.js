// 대한민국 환경부 통합대기환경지수 구간 기준 (㎍/m³)
export function getPm25Grade(value) {
  if (value <= 15) return '좋음'
  if (value <= 35) return '보통'
  if (value <= 75) return '나쁨'
  return '매우나쁨'
}

export function getPm10Grade(value) {
  if (value <= 30) return '좋음'
  if (value <= 80) return '보통'
  if (value <= 150) return '나쁨'
  return '매우나쁨'
}

// PM2.5/PM10 중 더 나쁜 등급을 최종 등급으로 사용
export function getOverallGrade(pm25, pm10) {
  const rank = { 좋음: 0, 보통: 1, 나쁨: 2, 매우나쁨: 3 }
  const gradePm25 = getPm25Grade(pm25)
  const gradePm10 = getPm10Grade(pm10)
  return rank[gradePm25] >= rank[gradePm10] ? gradePm25 : gradePm10
}

// 등급 기반 한 줄 요약 문구
export function getGradeSummary(grade) {
  switch (grade) {
    case '좋음':
      return '야외활동하기 아주 좋은 날이에요'
    case '보통':
      return '가벼운 야외활동에 무리가 없어요'
    case '나쁨':
      return '장시간 야외활동은 피하는 게 좋아요'
    case '매우나쁨':
      return '외출을 자제하고 마스크를 착용하세요'
    default:
      return ''
  }
}

// el-progress용 0~100 퍼센트 환산. 기준치는 '매우나쁨' 상한보다 넉넉히 잡아 막대가 항상 여유 있게 찬다.
export function getPm25Percent(value) {
  return Math.min(100, Math.round((value / 100) * 100))
}

export function getPm10Percent(value) {
  return Math.min(100, Math.round((value / 200) * 100))
}
