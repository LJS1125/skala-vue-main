// 카드 좌측 보더 & 하단 상태 텍스트에 쓰는 3단계 온도 구간 색상(팔레트에서 색이 허용된 곳 중 하나)
export function getTempAccentColor(temp) {
  if (temp === null || temp === undefined) return '#999999'
  if (temp >= 30) return '#D2481F' // 더움
  if (temp >= 25) return '#B5860F' // 보통
  return '#2C7DBC' // 선선 (24도 이하)
}

export function getTempAccentLabel(temp) {
  if (temp === null || temp === undefined) return ''
  if (temp >= 30) return '더움'
  if (temp >= 25) return '보통'
  return '선선'
}
