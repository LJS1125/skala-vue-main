# skala-vue

SKALA Vue.js 과정 실습/과제 저장소

## 실행

```sh
npm install
npm run dev
```

## 과제 1 - Weather Mockup

`src/components/exercise/WeatherMockup.vue`

### 요구사항 구현

| 요구사항 | 구현 내용 |

| 1. 배열 렌더링 | `weatherList`를 `v-for`로 반복 출력, `:key`에 `id` 바인딩 |
| 2. 조건부 렌더링 | `v-if` / `v-else`로 25도 기준 `🔥 더움` / `❄️ 선선함` 라벨 분기 |
| 3. 양방향 바인딩 | `v-model` 대신 `:value` + `@input`으로 검색 input 구현, 입력한 도시명 출력 |
| 4. 이벤트 & 수식어 | 카드 클릭 시 상태바에 `{도시}이 선택되었습니다.` 표시 (같은 카드 다시 클릭하면 선택 해제) / 상세보기 버튼은 `@click.stop`으로 버블링 차단 후 `window.alert` |
| 5. 본인 데이터 | 아래 참고 |

### 추가한 것

- **데이터** — 제주, 강릉 추가 / `humidity`, `wind` 필드 확장
  → 뒤에 API 붙이는 단원에서 실제 응답 구조랑 맞추려고 미리 넣음
- **정렬** — 기온 높은 순 / 낮은 순 버튼 (같은 버튼 다시 누르면 해제)
  → 원본 배열 안 건드리려고 복사한 뒤 `computed`로 정렬
- **즐겨찾기** — 카드별 ⭐ 토글 + "즐겨찾기만 보기" 필터
  → 카드 클릭이랑 안 겹치게 여기도 `@click.stop`
- **카드 배경색** — 25도 기준 붉은/파란 계열 그라데이션 (`:class` 바인딩)
- **선택 표시** — 처음엔 파란 테두리 고정이었는데 붉은 배경 카드에서 색이 부딪혀서,
  `is-selected.is-hot` / `is-selected.is-cool`로 나눠 배경색 계열에 맞춤
- **키보드 선택** — `tabindex="0"` + `@keyup.enter`
- **레이아웃** — 검색/리스트를 같은 `.dashboard-card` 박스로 통일

## 과제 2 - Weather Composition

`src/components/exercise/WeatherComposition.vue`

과제 1을 복사해서 시작, Composition API(computed/watch/watchEffect)로 검색 필터링과 감시 기능을 추가함.

### 요구사항 구현

| 요구사항 | 구현 내용 |

| 1. 반응형 상태 | `searchQuery`, `selectedCityInfo`, `weatherList` (1일차 동일) |
| 2. 검색 필터 (computed) | `filteredWeatherList` — 도시 이름에 검색어 포함된 것만 필터링 |
| 3. watch | `selectedCityInfo` 감시 → 바뀔 때마다 콘솔에 이전값/새값 로그 |
| 3. watchEffect | `searchQuery` 감시 → 타이핑할 때마다 콘솔 로그 |
| 4. 검색 결과 표시 | 검색어 없으면 전체 / 있으면 필터링 결과 / 없으면 "일치하는 도시가 없습니다" 안내 |
| 5. 본인 추가 | 아래 참고 |

computed는 체인 구조로 연결: `weatherList` → `filteredWeatherList`(검색) → `displayedWeatherList`(즐겨찾기 필터 + 정렬)

### 추가한 것

- **최고/최저 기온 요약** (computed) — 현재 화면에 보이는 도시 중 가장 덥고 시원한 곳을 자동 표시. 목록 바뀌면 같이 갱신됨
- **검색 기록** (반응형 상태 + watch) — 최근 검색어 5개를 뱃지로 저장. 타이핑 도중 값이 다 쌓이지 않도록 800ms 동안 입력 없으면 그때 기록 (디바운스). 뱃지 클릭하면 재검색, x로 개별 삭제
- **검색 조건 요약** (watchEffect) — 검색어/즐겨찾기/정렬 상태 3개를 동시에 추적해서 "현재 조건: 검색어 "부산" · 즐겨찾기만 · 높은 순 정렬" 형태로 화면에 표시 watchEffect가 여러 값을 한번에 자동 추적하는 걸 콘솔 로그 말고 화면에서도 보여주고 싶어서 추가함

### 정리한 것

- 과제 1에서 `is-cool`/`cold`가 섞여 있던 걸 `cool`로 통일 (`coolestCity`, `badge cool`)

# Weather Dashboard — Component 분리 실습 (과제 3)

Vue 3 Composition API로 만든 날씨 대시보드를, 기능 변경 없이 여러 개의 재사용 가능한 컴포넌트로 분리한 실습 과제입니다.

## 프로젝트 구조

```
src/components/exercise/
├── WeatherParent.vue      # 모든 반응형 데이터·로직 보유, 하위 컴포넌트 조립
├── BaseDashboardCard.vue  # 공통 카드 디자인 틀 (slot 전용)
├── SearchBar.vue          # 도시 검색 입력창
├── SearchHistory.vue      # 검색 기록 뱃지 (추가 컴포넌트)
├── TempSummary.vue        # 최고/최저 기온 요약 (추가 컴포넌트)
├── FilterToolbar.vue      # 정렬·즐겨찾기 필터 버튼 (추가 컴포넌트)
└── WeatherCard.vue        # 도시별 날씨 카드
```

## 기능

- **도시 검색**: 실시간 입력으로 도시 목록 필터링
- **검색 기록**: 800ms 디바운스로 최근 검색어 최대 5개 저장, 뱃지 클릭 시 재검색·삭제 가능
- **정렬**: 기온 높은 순 / 낮은 순 토글
- **즐겨찾기**: 카드별 즐겨찾기 지정 및 즐겨찾기만 보기 필터
- **최고/최저 기온 요약**: 현재 표시된 도시 목록 기준으로 자동 계산
- **상세보기**: 카드 클릭 시 선택 상태 표시, 별도 버튼으로 상세 정보 확인
- **빈 결과 안내**: 검색 결과가 없을 때 안내 문구 표시

## 컴포넌트 설계

### Props / Emits 요약

| 컴포넌트 | Props | Emits |
|---|---|---|
| SearchBar | `searchQuery` | `update-query` |
| SearchHistory | `history` | `apply-history`, `remove-history` |
| FilterToolbar | `sortOrder`, `showFavoritesOnly` | `toggle-sort-desc`, `toggle-sort-asc`, `toggle-favorites` |
| TempSummary | `hottestCity`, `coolestCity` | 없음 (표시 전용) |
| WeatherCard | `city`, `isSelected` | `select-card`, `click-detail`, `toggle-favorite` |

### 설계 원칙

- **상태는 최상위(WeatherParent)에 집중**: 모든 반응형 데이터와 computed·watch 로직은 `WeatherParent.vue`에서만 관리하고, 하위 컴포넌트는 props로 받은 값을 표시하거나 emit으로 이벤트만 올려보냄
- **BaseDashboardCard는 순수 레이아웃 컴포넌트**: 로직 없이 `<slot>`만 사용해 검색 영역과 날씨 목록 영역의 디자인을 공통화
- **슬롯 자식과 부모의 직접 바인딩**: `SearchBar`, `SearchHistory`, `WeatherCard`는 시각적으로는 `BaseDashboardCard` 안에 위치하지만, 실제 데이터 바인딩은 `WeatherParent`와 직접 이루어짐 (Vue의 슬롯 컴파일 스코프 특성 활용)
- **이벤트 이름은 kebab-case로 통일** (`update-query`, `select-card` 등)

## 사용 기술

- Vue 3 (Composition API, `<script setup>`)
- `ref`, `computed`, `watch`, `watchEffect`
- Props / Emits (양방향 데이터 흐름)
- Slot (컴포넌트 합성)

## 실행 방법

```bash
npm install
npm run dev
```

## 과제 4. Vue Router 적용

Vue Router로 페이지를 분리했습니다.

- 라우트: 홈 / 도시 상세(`:cityId`) / 지도 / 체크리스트 / 소개 / 404
- Lazy Loading, Catch-all Route 적용
- 상세보기 alert → `router.push()` 로 변경
- 추가 view: 날씨 지도, 준비물 체크리스트

## 과제 5. Pinia 적용

Pinia로 전역 상태를 관리하도록 store를 도입했습니다.

- `stores/configStore.js` — 온도 단위 store
  - state `unit` (초기값 `'celsius'`)
  - getter `unitSymbol` (`℃` / `℉`)
  - action `toggleUnit` (`celsius` ↔ `fahrenheit` 전환)
- `components/exercise/UnitToggler.vue` — 단위 전환 스위치 UI, Navigation Bar 옆에 배치
- 메인(`WeatherHomeView` → `WeatherCard`, `TempSummary`)과 상세(`WeatherDetailView`) 화면의 온도 표시에 `configStore` 적용, `displayTemp` computed로 섭씨/화씨 변환
- 본인 추가 store `stores/visitStore.js` — 도시 상세 조회 통계
  - state `cityViewCounts`(도시별 조회수), `totalVisits`(총 조회수)
  - getter `mostViewedCity` (가장 많이 본 도시)
  - action `recordView(cityId)` (상세 페이지 진입 시 조회수 기록)
  - 메인 화면 인사말과 소개 페이지에 통계 표시

  ## 과제 6. Axios 활용

### 과제 요구사항
1. OpenWeatherMap API를 통해 실제 날씨 데이터를 가져와 적용
2. OpenWeatherMap 내 다른 API를 추가하여 기능 확장
3. 기타 외부 API를 추가하여 기능 확장

### 구현 내용

**1. OpenWeatherMap 현재 날씨 연동**
- axios로 OpenWeatherMap 현재 날씨 API 연동 (`weatherStore`)
- 서울·부산·대구·인천·광주·대전·울산·세종·제주·울릉도 10개 지역 실시간 날씨 조회
- 기존 정적(mock) 데이터를 실시간 API 데이터로 전면 교체
- 지역별 최고/최저 기온 요약("가장 더운 곳", "가장 시원한 곳") 실시간 반영

**2. OpenWeatherMap 5일 예보 API 추가 (요구사항 2)**
- forecast API 연동 (`forecastStore`)
- 3시간 간격 응답을 날짜별로 그룹핑해 5일 예보로 변환

**3. 카카오 로컬 API 연동 (요구사항 3)**
- 브라우저 Geolocation으로 좌표 획득 → 카카오 좌표-행정구역 변환 API로 실제 지역명 추출 (`locationStore`)
- 감지된 위치 기준 날씨 카드 자동 표시

**4. 생활밀착형 지수 추가**
- 온도·습도·날씨 상태 기반으로 옷차림 추천, 우산 필요 여부, 체감 지수를 계산해 카드에 표시

**5. 도시 검색 기능**
- 10개 고정 지역 외 임의의 도시명을 입력해 실시간 날씨를 조회하는 검색 기능 추가

**6. API 키 관리**
- `.env.local`에 API 키 분리 관리 (`VITE_OPENWEATHER_API_KEY`, `VITE_KAKAO_API_KEY`)
- `.gitignore`로 커밋 방지

## 폴더 구조

```
src/components/
├── exercise/    # 과제
└── practices/   # 문법 학습용 예제
    ├── basic/
    ├── composition/
    ├── component/
    └── library/
```
