export const CITY_SEED = [
  { id: 'city_01', name: '서울', nameEn: 'Seoul' },
  { id: 'city_02', name: '부산', nameEn: 'Busan' },
  { id: 'city_03', name: '대구', nameEn: 'Daegu' },
  { id: 'city_04', name: '인천', nameEn: 'Incheon' },
  { id: 'city_05', name: '광주', nameEn: 'Gwangju' },
  { id: 'city_06', name: '대전', nameEn: 'Daejeon' },
  { id: 'city_07', name: '울산', nameEn: 'Ulsan' },
  { id: 'city_08', name: '세종', nameEn: 'Sejong' },
  { id: 'city_09', name: '제주', nameEn: 'Jeju' },
  // 울릉도는 OpenWeatherMap의 q=Ulleungdo,KR 지명 검색이 불안정해 좌표 기반 조회로 대체
  { id: 'city_10', name: '울릉도', nameEn: 'Ulleungdo', coord: { lat: 37.48, lon: 130.9 } },
  { id: 'city_11', name: '수원', nameEn: 'Suwon' },
  // 백령도는 q=Baengnyeongdo,KR이 404(city not found)를 반환해 좌표 기반 조회로 대체
  { id: 'city_12', name: '백령도', nameEn: 'Baengnyeongdo', coord: { lat: 37.97, lon: 124.63 } },
  { id: 'city_13', name: '강릉', nameEn: 'Gangneung' },
]
