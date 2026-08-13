// OpenWeatherMap /forecast는 3시간 간격 40개 항목(약 5~6개 달력일)을 반환하므로
// 날짜별로 그룹핑한 뒤 처음 5개 날짜만 취해 정확히 5일치 카드를 만든다.
export function groupForecastByDay(list) {
  const byDate = {}
  for (const entry of list) {
    const [date, time] = entry.dt_txt.split(' ')
    if (!byDate[date]) byDate[date] = []
    byDate[date].push({ ...entry, time })
  }

  const dates = Object.keys(byDate).sort().slice(0, 5)

  return dates.map((date) => {
    const entries = byDate[date]
    const temps = entries.map((e) => e.main.temp)
    // 하루를 대표하는 아이콘/설명은 정오(12:00)에 가장 가까운 슬롯 값을 사용
    const noonEntry = entries.reduce((closest, e) =>
      Math.abs(toMinutes(e.time) - 720) < Math.abs(toMinutes(closest.time) - 720) ? e : closest,
    )
    return {
      date,
      dateLabel: formatDateLabel(date),
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      description: noonEntry.weather[0].description,
      icon: noonEntry.weather[0].icon,
    }
  })
}

function toMinutes(hhmmss) {
  const [h, m] = hhmmss.split(':').map(Number)
  return h * 60 + m
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' })
}
