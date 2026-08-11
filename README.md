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
| 4. 이벤트 & 수식어 | 카드 클릭 시 상태바에 `{도시}이 선택되었습니다.` / 상세보기 버튼은 `@click.stop`으로 버블링 차단 후 `window.alert` |
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
- **검색 조건 요약** (watchEffect) — 검색어/즐겨찾기/정렬 상태 3개를 동시에 추적해서 "현재 조건: 검색어 '부' · 즐겨찾기만" 형태로 화면에 표시. watchEffect가 여러 값을 한번에 자동 추적하는 걸 콘솔 로그 말고 화면에서도 보여주고 싶어서 추가함

### 정리한 것

- 과제 1에서 `is-cool`/`cold`가 섞여 있던 걸 `cool`로 통일 (`coolestCity`, `badge cool`)

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
