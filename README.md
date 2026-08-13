
# SKALA Vue - 실시간 날씨 대시보드

Vue 3를 활용하여 제작한 실시간 날씨 및 대기질 대시보드 웹 애플리케이션입니다.

SKALA Vue.js 과정에서 학습한 기초 문법부터 Composition API, 컴포넌트 분리, Vue Router, Pinia, Axios를 단계적으로 적용하고, OpenWeatherMap과 Kakao API를 연동하여 실제 데이터를 처리하도록 구현했습니다.

---

## 1. 프로젝트 개요

Mock 데이터를 활용한 날씨 카드로 시작하여 기능별로 구조를 확장했습니다.

```text
Vue 기본 문법 → Composition API → 컴포넌트 분리 → Vue Router → Pinia → Axios (API 연동)

```

주요 기능으로 실시간 날씨 조회, 도시 검색 및 최근 검색어 관리, 5일 예보, 현재 위치 기반 행정구역 자동 감지, 카카오맵 날씨 지도, 대기질 정보, 생활 지수를 제공합니다.

---

## 2. 주요 기능

### ㆍ 실시간 날씨 및 대시보드

* 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 제주, 울릉도 실시간 기온 및 날씨 정보 표시
* 현재 화면 기준 최고/최저 기온 자동 연산
* 기온 높은 순 / 낮은 순 정렬 및 도시별 즐겨찾기 필터링

### ㆍ 도시 검색

* 주요 지역 외 임의의 도시명 실시간 검색
* 800ms 디바운스(Debounce) 적용 및 최근 검색어 최대 5개 저장 (재검색 및 삭제 가능)

### ㆍ 현재 위치 감지

* 브라우저 Geolocation API로 위도/경도를 구한 뒤, Kakao Local API를 통해 현재 행정구역을 추출하여 해당 지역 날씨 출력

### ㆍ 날씨 상세 및 5일 예보

* 도시별 상세 페이지 (`/detail/:cityId`)
* 3시간 간격의 Forecast 데이터를 날짜별로 그룹화하여 5일 예보 및 시간대별 기온 그래프 제공

### ㆍ 전국 날씨 지도

* Kakao Maps API 기반으로 전국 주요 거점의 기온 오버레이 마커 시각화
* 지도 마커 클릭 시 해당 도시 상세 페이지로 이동

### ㆍ 대기질 현황

* 미세먼지(PM10), 초미세먼지(PM2.5) 농도 및 등급 표시

### ㆍ 기타 기능

* 섭씨(℃) / 화씨(℉) 전역 단위 전환
* 상세 페이지 진입 기반 도시별 조회수 통계 관리
* 외출 준비물 체크리스트 및 404 예외 처리 페이지

---

## 3. 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | Vue 3 |
| Build Tool | Vite |
| State Management | Pinia |
| Routing | Vue Router 4 |
| HTTP Client | Axios |
| UI Library | Element Plus |
| External API | OpenWeatherMap API, Kakao Local API, Kakao Maps API |
| Code Quality | ESLint, Oxlint, Prettier |

---

## 4. 프로젝트 구조

```text
src/
├── api/                  # OpenWeatherMap, Kakao API 통신 모듈
├── assets/               # 공통 스타일시트 (base.css, main.css)
├── components/
│   └── exercise/         # 재사용 UI 컴포넌트 (WeatherCard, SearchBar 등)
├── data/                 # 도시 좌표 및 시드 데이터
├── router/               # Vue Router 라우팅 설정
├── stores/               # Pinia 전역 상태 (weather, location, config, visit 등)
├── utils/                # 지수 계산, 날짜 그룹핑, 카카오맵 로더 등 유틸
├── views/                # 페이지 단위 뷰 컴포넌트
├── App.vue
└── main.js

```

### 주요 Store 역할

| Store | 역할 |
| --- | --- |
| `weatherStore` | 현재 날씨 데이터 및 도시 목록 관리 |
| `forecastStore` | 5일 예보 데이터 관리 및 일별 그룹화 |
| `locationStore` | Geolocation 좌표 및 Kakao 행정구역 변환 |
| `airQualityStore` | 대기질 (PM10, PM2.5) 데이터 관리 |
| `configStore` | 섭씨 / 화씨 단위 상태 관리 |
| `visitStore` | 도시별 상세 페이지 조회수 및 통계 관리 |

---

## 5. 과제별 구현 내용

### 과제 1 — Weather Mockup

* `v-for` 배열 렌더링 및 `v-if` 조건부 렌더링
* `:value` + `@input`을 이용한 데이터 바인딩
* 이벤트 버블링 차단(`@click.stop`) 및 기온별 조건부 스타일 바인딩

### 과제 2 — Weather Composition

* `ref`, `computed`, `watch`, `watchEffect` 활용
* 검색어 필터링, 기온 정렬, 최고/최저 기온 자동 계산
* 800ms 디바운스 적용 최근 검색어 기록 관리

### 과제 3 — Component 분리

* `WeatherParent`에 주요 상태와 로직을 집중하고, 하위 컴포넌트는 Props / Emits로 수두식 연결
* Slot 기반 `BaseDashboardCard` 작성으로 레이아웃 공통화
* 이벤트 명칭 kebab-case 통일

### 과제 4 — Vue Router

* 라우트 분리 (홈, 상세, 지도, 체크리스트, 소개, 404)
* Lazy Loading 및 Catch-all Route 처리
* `router.push()` 기반의 페이지 이동

### 과제 5 — Pinia

* `configStore`: 전역 온도 단위(℃/℉) 스위칭
* `visitStore`: 상세 조회수 통계 연산 및 네비게이션 영역 연동

### 과제 6 — Axios 활용

* OpenWeatherMap API 연동 (현재 날씨, 5일 예보)
* Kakao Local API (좌표 → 행정구역 변환) 및 Kakao Maps API (지도 마커 시각화)
* 기온·습도 기반 옷차림/우산 추천 지수 연산 로직 구현

---

## 6. 설치 및 실행 방법

### 1) 저장소 클론 및 패키지 설치

```bash
git clone <REPOSITORY_URL>
cd skala-vue
npm install

```

### 2) 환경 변수 설정

최상위 루트 경로에 `.env.local` 파일을 생성하고 발급받은 API 키를 입력합니다.

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_KAKAO_API_KEY=your_kakao_rest_api_key
VITE_KAKAO_JS_KEY=your_kakao_javascript_key

```

> `.env.local` 파일은 `.gitignore`에 등록되어 Git 추적에서 제외됩니다.

### 3) 개발 서버 실행

```bash
npm run dev

```

실행 후 브라우저에서 `http://localhost:3000`으로 접속합니다.

### 4) 빌드 및 검사

```bash
# 코드 검사 및 포맷팅
npm run lint
npm run format

# Production 빌드 및 미리보기
npm run build
npm run preview

```
