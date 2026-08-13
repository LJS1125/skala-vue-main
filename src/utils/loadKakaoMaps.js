// 카카오맵 JS SDK는 <script> 태그로 한 번만 주입하면 되므로, 로딩 Promise를 모듈 스코프에 캐시해
// 페이지를 여러 번 오가도(예: /map 재방문) 스크립트가 중복 삽입되지 않게 한다.
let kakaoMapsPromise = null

export function loadKakaoMaps() {
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  if (kakaoMapsPromise) return kakaoMapsPromise

  kakaoMapsPromise = new Promise((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_JS_KEY
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => {
      kakaoMapsPromise = null
      reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })

  return kakaoMapsPromise
}
