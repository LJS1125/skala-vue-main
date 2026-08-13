// OpenWeatherMap 아이콘 코드의 앞 두 자리(조건 그룹)를 쉬운 한글 라벨로 매핑한다.
// 설명 문구(description)는 API가 lang=kr로 이미 한글을 주지만 문구가 제각각(예: '온흐림', '튼구름',
// '약간의 구름이 낀 하늘')이라, 아이콘 코드 기준으로 통일된 짧은 라벨을 만들어 전체 화면에서 재사용한다.
const ICON_PREFIX_LABELS = {
  '01': '맑음', // Clear
  '02': '구름 조금', // Few clouds
  '03': '구름 많음', // Scattered clouds
  '04': '흐림', // Broken/Overcast clouds
  '09': '비', // Shower rain
  '10': '비', // Rain
  '11': '천둥번개', // Thunderstorm
  '13': '눈', // Snow
  '50': '안개', // Mist/Fog
}

export function getWeatherLabel(icon) {
  if (!icon) return '흐림'
  return ICON_PREFIX_LABELS[icon.slice(0, 2)] ?? '흐림'
}
