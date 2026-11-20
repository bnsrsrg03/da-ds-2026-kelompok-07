import { useEffect, useMemo, useState } from 'react'
import './App.css'

const Icon = ({ name, size = 20 }) => {
  const icons = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    chart: <><path d="M3 3v18h18" /><path d="M7 16l4-4 3 2 6-7" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    nutrition: <><path d="M12 21a8 8 0 0 0 8-8c0-5-8-10-8-10S4 8 4 13a8 8 0 0 0 8 8z" /><path d="M8 14c2 0 4-2 4-5" /></>,
    home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v11h14V10M9 21v-6h6v6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
    model: <><circle cx="12" cy="12" r="3" /><circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M7 6l3 4M17 6l-3 4M7 18l3-4M17 18l-3-4" /></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

const navItems = [
  { label: 'Dashboard', icon: 'grid' },
  { label: 'Analisis', icon: 'chart' },
  { label: 'Dataset', icon: 'database' },
  { label: 'Model', icon: 'model' },
  { label: 'Laporan', icon: 'report' },
]

const dashboardSections = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Profil Balita', icon: 'users' },
  { label: 'Faktor Gizi', icon: 'nutrition' },
  { label: 'Kesehatan Keluarga', icon: 'home' },
]

function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(value.trim())
      value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(value.trim())
      if (row.some((item) => item !== '')) rows.push(row)
      row = []
      value = ''
    } else {
      value += char
    }
  }

  row.push(value.trim())
  if (row.some((item) => item !== '')) rows.push(row)
  if (rows.length < 2) return []

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim())
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ''])))
}

function validNumber(value) {
  const number = Number(value)
  return value !== '' && Number.isFinite(number) ? number : null
}

function average(records, field) {
  const values = records.map((item) => validNumber(item[field])).filter((value) => value !== null)
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

function percentage(count, total) {
  return total ? count / total * 100 : 0
}

function categoryStats(records, field, labels) {
  return labels.map((label) => {
    const count = records.filter((item) => item[field] === label).length
    return { name: label, count, percent: percentage(count, records.length) }
  })
}

function ageGroup(months) {
  if (!Number.isFinite(months)) return 'Tidak valid'
  if (months < 6) return '< 6 bulan'
  if (months < 12) return '6–11 bulan'
  if (months < 24) return '12–23 bulan'
  if (months < 36) return '24–35 bulan'
  if (months < 48) return '36–47 bulan'
  return '48–59 bulan'
}

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [activeDashboardSection, setActiveDashboardSection] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [period, setPeriod] = useState('12 bulan')
  const [district, setDistrict] = useState('Semua kecamatan')
  const [search, setSearch] = useState('')
  const [nutritionFilter, setNutritionFilter] = useState('Semua')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    fetch('/diare_balita_toba_raw.csv')
      .then((response) => {
        if (!response.ok) throw new Error('Dataset tidak dapat dimuat')
        return response.text()
      })
      .then((csv) => setRecords(parseCsv(csv)))
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false))
  }, [])

  const districtOptions = useMemo(() => ['Semua kecamatan', ...[...new Set(records.map((item) => item.kecamatan).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'))], [records])

  const latestDate = useMemo(() => {
    const dates = records.map((item) => new Date(`${item.tanggal_pengukuran}T00:00:00`)).filter((date) => !Number.isNaN(date.getTime()))
    return dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : null
  }, [records])

  const periodRecords = useMemo(() => {
    if (!records.length || !latestDate) return []
    let startDate
    if (period === '30 hari') {
      startDate = new Date(latestDate)
      startDate.setDate(startDate.getDate() - 30)
    } else {
      startDate = new Date(latestDate)
      startDate.setMonth(startDate.getMonth() - (period === '6 bulan' ? 6 : 12))
    }
    return records.filter((item) => {
      const date = new Date(`${item.tanggal_pengukuran}T00:00:00`)
      return !Number.isNaN(date.getTime()) && date >= startDate && date <= latestDate
    })
  }, [records, latestDate, period])

  const filteredRecords = useMemo(() => periodRecords.filter((item) => {
    const districtMatch = district === 'Semua kecamatan' || item.kecamatan === district
    const query = search.trim().toLowerCase()
    const searchMatch = !query || [item.id_balita, item.kecamatan, item.tanggal_pengukuran]
      .some((value) => (value || '').toLowerCase().includes(query))
    return districtMatch && searchMatch
  }), [periodRecords, district, search])

  const stats = useMemo(() => {
    const count = filteredRecords.length
    const diarrheaCount = filteredRecords.filter((item) => item.gejala_diare_14_hari_terakhir === 'Ya').length
    const uniqueBalita = new Set(filteredRecords.map((item) => item.id_balita).filter(Boolean)).size
    return {
      count,
      uniqueBalita,
      diarrheaCount,
      diarrheaPercent: percentage(diarrheaCount, count),
      averageAge: average(filteredRecords, 'usia_balita_bulan'),
      averageWeight: average(filteredRecords, 'berat_badan_kg'),
      averageHeight: average(filteredRecords, 'panjang_tinggi_badan_cm'),
    }
  }, [filteredRecords])

  const trendData = useMemo(() => {
    const groups = new Map()
    filteredRecords.forEach((item) => {
      const date = new Date(`${item.tanggal_pengukuran}T00:00:00`)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const current = groups.get(key) || { total: 0, diarrhea: 0 }
      current.total += 1
      if (item.gejala_diare_14_hari_terakhir === 'Ya') current.diarrhea += 1
      groups.set(key, current)
    })
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => {
      const [, month] = key.split('-')
      return { key, month: monthNames[Number(month) - 1], percent: percentage(value.diarrhea, value.total), value: value.diarrhea, total: value.total }
    })
  }, [filteredRecords])

  const diarrheaDistribution = useMemo(() => [
    { name: 'Tidak diare', count: stats.count - stats.diarrheaCount, percent: percentage(stats.count - stats.diarrheaCount, stats.count), color: '#22b8a7' },
    { name: 'Diare', count: stats.diarrheaCount, percent: stats.diarrheaPercent, color: '#ef7c69' },
  ], [stats])

  const ageDistribution = useMemo(() => {
    const labels = ['< 6 bulan', '6–11 bulan', '12–23 bulan', '24–35 bulan', '36–47 bulan', '48–59 bulan']
    return labels.map((label) => {
      const count = filteredRecords.filter((item) => ageGroup(validNumber(item.usia_balita_bulan)) === label).length
      return { name: label, count, percent: percentage(count, filteredRecords.length) }
    })
  }, [filteredRecords])

  const sexDistribution = useMemo(() => [
    { name: 'Laki-laki', count: filteredRecords.filter((item) => item.jenis_kelamin === 'L').length, color: '#22b8a7' },
    { name: 'Perempuan', count: filteredRecords.filter((item) => item.jenis_kelamin === 'P').length, color: '#6c7adf' },
  ], [filteredRecords])

  const bmiStats = useMemo(() => {
    const values = filteredRecords.map((item) => {
      const weight = validNumber(item.berat_badan_kg)
      const height = validNumber(item.panjang_tinggi_badan_cm)
      if (weight === null || height === null || height <= 0) return null
      const meters = height / 100
      return weight / (meters * meters)
    }).filter((value) => value !== null)
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  }, [filteredRecords])

  const nutritionRecords = useMemo(() => {
    if (nutritionFilter === 'Semua') return filteredRecords
    return filteredRecords.filter((item) => item.masih_mendapat_asi === nutritionFilter)
  }, [filteredRecords, nutritionFilter])

  const nutritionBmiStats = useMemo(() => {
    const values = nutritionRecords.map((item) => {
      const weight = validNumber(item.berat_badan_kg)
      const height = validNumber(item.panjang_tinggi_badan_cm)
      if (weight === null || height === null || height <= 0) return null
      const meters = height / 100
      return weight / (meters * meters)
    }).filter((value) => value !== null)
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  }, [nutritionRecords])

  const latestRecords = useMemo(() => [...filteredRecords]
    .sort((a, b) => b.tanggal_pengukuran.localeCompare(a.tanggal_pengukuran))
    .slice(0, 8), [filteredRecords])

  const linePoints = trendData
    .map((item, index) => `${58 + index * (572 / Math.max(trendData.length - 1, 1))},${170 - Math.min(item.percent, 100) * 1.35}`)
    .join(' ')

  function exportCsv() {
    if (!filteredRecords.length) return
    const headers = Object.keys(filteredRecords[0])
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const csv = [headers.join(','), ...filteredRecords.map((item) => headers.map((header) => escape(item[header])).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'dashboard-balita-toba.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const periodLabel = latestDate
    ? `${latestDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : '-'

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">N</div>
          <div><strong>Nexa</strong><span>Analytics</span></div>
        </div>

        <nav className="navigation" aria-label="Navigasi utama">
          <p className="nav-heading">MENU UTAMA</p>
          {navItems.map((item) => (
            <button type="button" key={item.label} className={activeNav === item.label ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveNav('Dashboard'); setActiveDashboardSection('Overview'); setSidebarOpen(false) }}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-avatar">AK</div>
          <div className="profile-copy"><strong>Kelompok 07</strong><span>Data Team</span></div>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-overlay" type="button" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button type="button" className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><span /><span /><span /></button>
          <label className="search-box">
            <Icon name="search" size={18} />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari ID atau kecamatan..." aria-label="Cari data" />
          </label>
          <div className="topbar-actions">
            <button type="button" className="export-button" onClick={exportCsv} disabled={!filteredRecords.length}>
              <Icon name="download" size={17} /><span>Ekspor CSV</span>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><p className="eyebrow">DASHBOARD ANALITIK</p><h1>Dashboard</h1></div>
            <div className="global-filters">
              <label className="filter-control">
                <span>Kecamatan</span>
                <select value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="Filter kecamatan">
                  {districtOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="period-control">
                <Icon name="calendar" size={17} />
                <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Rentang waktu">
                  <option>30 hari</option><option>6 bulan</option><option>12 bulan</option>
                </select>
              </label>
            </div>
          </div>

          <div className="data-warning" role="status">
            <span className="warning-dot" />
            <span><strong>Sumber data:</strong> {loading ? 'Memuat dataset...' : loadError ? loadError : `${stats.count.toLocaleString('id-ID')} catatan; tanggal pengukuran terbaru ${periodLabel}; wilayah ${district}.`}</span>
          </div>

          {activeNav === 'Dashboard' && (
            <nav className="dashboard-tabs" aria-label="Bagian dashboard">
              {dashboardSections.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className={activeDashboardSection === item.label ? 'dashboard-tab active' : 'dashboard-tab'}
                  onClick={() => setActiveDashboardSection(item.label)}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          {activeDashboardSection === 'Overview' && (
            <>
              <section className="metric-grid" aria-label="Ringkasan indikator utama">
                <article className="metric-card" title="Jumlah seluruh catatan pemeriksaan yang memenuhi filter.">
                  <div className="metric-top"><span className="metric-icon mint"><Icon name="users" /></span><span className="metric-change positive">Filter aktif</span></div>
                  <p>Total Catatan</p><h2>{stats.count.toLocaleString('id-ID')}</h2><span className="metric-caption">{stats.uniqueBalita.toLocaleString('id-ID')} ID balita unik terdaftar</span>
                </article>
                <article className="metric-card" title="Balita yang gejala diare dalam 14 hari terakhir bernilai Ya dibagi seluruh catatan.">
                  <div className="metric-top"><span className="metric-icon blue"><Icon name="chart" /></span><span className="metric-change positive">{stats.diarrheaPercent.toFixed(1)}%</span></div>
                  <p>Gejala Diare 14 Hari</p><h2>{stats.diarrheaCount.toLocaleString('id-ID')}</h2><span className="metric-caption">proporsi dari catatan terfilter</span>
                </article>
                <article className="metric-card" title="Rata-rata usia yang tersedia pada catatan terfilter.">
                  <div className="metric-top"><span className="metric-icon amber"><Icon name="database" /></span><span className="metric-change neutral">Rata-rata</span></div>
                  <p>Usia Balita</p><h2>{stats.averageAge === null ? '-' : `${stats.averageAge.toFixed(1)} bln`}</h2><span className="metric-caption">rata-rata usia balita</span>
                </article>
                <article className="metric-card" title="Rata-rata berat badan yang tersedia pada catatan terfilter.">
                  <div className="metric-top"><span className="metric-icon coral"><Icon name="users" /></span><span className="metric-change positive">Rata-rata</span></div>
                  <p>Berat Badan</p><h2>{stats.averageWeight === null ? '-' : `${stats.averageWeight.toFixed(1)} kg`}</h2><span className="metric-caption">rata-rata pengukuran berat</span>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel trend-panel">
                  <div className="panel-header"><div><p className="panel-kicker">TEMUAN UTAMA</p><h2>Proporsi diare pada periode terfilter</h2></div></div>
                  <div className="chart-summary"><strong>{stats.diarrheaPercent.toFixed(1)}%</strong><span className="summary-increase">{stats.diarrheaCount.toLocaleString('id-ID')} dari {stats.count.toLocaleString('id-ID')} catatan</span></div>
                  <div className="line-chart" aria-label="Tren bulanan proporsi gejala diare">
                    <div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                    <svg viewBox="0 0 650 200" role="img">
                      <g className="grid-lines"><line x1="58" y1="20" x2="630" y2="20" /><line x1="58" y1="57" x2="630" y2="57" /><line x1="58" y1="94" x2="630" y2="94" /><line x1="58" y1="131" x2="630" y2="131" /><line x1="58" y1="168" x2="630" y2="168" /></g>
                      {trendData.length > 0 && <polygon points={`58,168 ${linePoints} 630,168`} fill="url(#lineFill)" />}
                      {trendData.length > 0 && <polyline points={linePoints} fill="none" stroke="#22b8a7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                      {trendData.map((item, index) => <circle key={item.key} cx={58 + index * (572 / Math.max(trendData.length - 1, 1))} cy={170 - item.percent * 1.35} r={4} fill="#fff" stroke="#22b8a7" strokeWidth="2"><title>{item.month}: {item.percent.toFixed(1)}% ({item.value}/{item.total})</title></circle>)}
                      <defs><linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22b8a7" stopOpacity="0.18" /><stop offset="100%" stopColor="#22b8a7" stopOpacity="0" /></linearGradient></defs>
                    </svg>
                    <div className="chart-x-labels">{trendData.map((item) => <span key={item.key}>{item.month}</span>)}</div>
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header"><div><p className="panel-kicker">STATUS DIARE</p><h2>Distribusi status</h2></div></div>
                  <div className="donut-wrap">
                    <div className="donut" role="img" aria-label="Distribusi status diare" style={{ background: `conic-gradient(#22b8a7 0 ${diarrheaDistribution[0].percent}%, #ef7c69 ${diarrheaDistribution[0].percent}% 100%)` }}>
                      <div className="donut-center"><strong>{stats.count.toLocaleString('id-ID')}</strong><span>Catatan</span></div>
                    </div>
                  </div>
                  <div className="legend">
                    {diarrheaDistribution.map((category) => <div className="legend-row" key={category.name}><span className="legend-name"><i style={{ background: category.color }} />{category.name}</span><strong>{category.count.toLocaleString('id-ID')} · {category.percent.toFixed(1)}%</strong></div>)}
                  </div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header"><div><p className="panel-kicker">DATA TERBARU</p><h2>Ringkasan pengamatan</h2></div><span className="table-count">{latestRecords.length} catatan</span></div>
                <div className="table-scroll">
                  <table><thead><tr><th>ID Balita</th><th>Kecamatan</th><th>Tanggal</th><th>Usia</th><th>Berat</th><th>Status Diare</th></tr></thead>
                    <tbody>{latestRecords.map((record) => <tr key={`${record.id_balita}-${record.tanggal_pengukuran}-${record.kecamatan}`}><td><strong>{record.id_balita || '-'}</strong></td><td>{record.kecamatan || '-'}</td><td>{record.tanggal_pengukuran || '-'}</td><td>{validNumber(record.usia_balita_bulan) === null ? '-' : `${record.usia_balita_bulan} bln`}</td><td>{validNumber(record.berat_badan_kg) === null ? '-' : `${Number(record.berat_badan_kg).toLocaleString('id-ID')} kg`}</td><td><span className={record.gejala_diare_14_hari_terakhir === 'Tidak' ? 'status-badge complete' : 'status-badge review'}>{record.gejala_diare_14_hari_terakhir === 'Ya' ? 'Diare' : record.gejala_diare_14_hari_terakhir === 'Tidak' ? 'Tidak diare' : '-'}</span></td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeDashboardSection === 'Profil Balita' && (
            <>
              <section className="metric-grid" aria-label="Ringkasan profil balita">
                <article className="metric-card"><div className="metric-top"><span className="metric-icon amber"><Icon name="database" /></span><span className="metric-change neutral">Usia rata-rata</span></div><p>Kelompok Usia</p><h2>{stats.averageAge === null ? '-' : `${stats.averageAge.toFixed(1)} bln`}</h2><span className="metric-caption">tidak menggantikan klasifikasi antropometri</span></article>
                <article className="metric-card"><div className="metric-top"><span className="metric-icon mint"><Icon name="users" /></span><span className="metric-change positive">ID unik</span></div><p>Balita Terdaftar</p><h2>{stats.uniqueBalita.toLocaleString('id-ID')}</h2><span className="metric-caption">dalam filter aktif</span></article>
                <article className="metric-card"><div className="metric-top"><span className="metric-icon coral"><Icon name="chart" /></span><span className="metric-change neutral">Rata-rata</span></div><p>Panjang/Tinggi</p><h2>{stats.averageHeight === null ? '-' : `${stats.averageHeight.toFixed(1)} cm`}</h2><span className="metric-caption">pengukuran panjang atau tinggi</span></article>
                <article className="metric-card" title="BMI turunan = berat (kg) dibagi tinggi (m) kuadrat; bukan status gizi WHO."><div className="metric-top"><span className="metric-icon blue"><Icon name="database" /></span><span className="metric-change neutral">Turunan</span></div><p>BMI Rata-rata</p><h2>{bmiStats === null ? '-' : bmiStats.toFixed(1)}</h2><span className="metric-caption">kg/m²; memerlukan tingkatan umur untuk interpretasi</span></article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header"><div><p className="panel-kicker">DRILL-DOWN</p><h2>Distribusi kelompok umur</h2></div></div>
                  <div className="bar-list">{ageDistribution.map((item) => <div className="bar-row" key={item.name}><div className="bar-label"><span>{item.name}</span><strong>{item.count.toLocaleString('id-ID')} · {item.percent.toFixed(1)}%</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${item.percent}%` }} /></div></div>)}</div>
                </article>
                <article className="panel distribution-panel">
                  <div className="panel-header"><div><p className="panel-kicker">SEBARAN</p><h2>Jenis kelamin</h2></div></div>
                  <div className="donut-wrap"><div className="donut sex-donut" role="img" aria-label="Distribusi jenis kelamin" style={{ background: `conic-gradient(#22b8a7 0 ${stats.count ? sexDistribution[0].count / stats.count * 100 : 0}%, #6c7adf ${stats.count ? sexDistribution[0].count / stats.count * 100 : 0}% 100%)` }}><div className="donut-center"><strong>{stats.count.toLocaleString('id-ID')}</strong><span>Catatan</span></div></div></div>
                  <div className="legend">{sexDistribution.map((item) => <div className="legend-row" key={item.name}><span className="legend-name"><i style={{ background: item.color }} />{item.name}</span><strong>{item.count.toLocaleString('id-ID')} · {stats.count ? (item.count / stats.count * 100).toFixed(1) : '0.0'}%</strong></div>)}</div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header"><div><p className="panel-kicker">ANTROPOMETRI TURUNAN</p><h2>Data BB dan tinggi tersedia</h2></div><span className="table-count">Lihat tooltip untuk definisi BMI</span></div>
                <div className="table-scroll"><table><thead><tr><th>ID</th><th>Usia</th><th>Jenis Kelamin</th><th>BB</th><th>Panjang/Tinggi</th><th>BMI Sederhana</th></tr></thead><tbody>{latestRecords.map((record) => { const weight = validNumber(record.berat_badan_kg); const height = validNumber(record.panjang_tinggi_badan_cm); const bmi = weight !== null && height !== null && height > 0 ? weight / ((height / 100) ** 2) : null; return <tr key={`${record.id_balita}-${record.tanggal_pengukuran}`}><td><strong>{record.id_balita}</strong></td><td>{record.usia_balita_bulan || '-'} bln</td><td>{record.jenis_kelamin === 'L' ? 'Laki-laki' : record.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</td><td>{weight === null ? '-' : `${weight.toLocaleString('id-ID')} kg`}</td><td>{height === null ? '-' : `${height.toLocaleString('id-ID')} cm`}</td><td>{bmi === null ? '-' : `${bmi.toFixed(1)} kg/m²`}</td></tr> })}</tbody></table></div>
              </section>
            </>
          )}

          {activeDashboardSection === 'Faktor Gizi' && (
            <>
              <div className="module-toolbar">
                <div><p className="panel-kicker">FILTER KATEGORI</p><strong>Status ASI</strong></div>
                <div className="segmented-control" role="group" aria-label="Filter status ASI">
                  {['Semua', 'Ya', 'Tidak'].map((option) => <button type="button" key={option} className={nutritionFilter === option ? 'active' : ''} onClick={() => setNutritionFilter(option)}>{option === 'Semua' ? 'Semua' : option === 'Ya' ? 'Mendapat ASI' : 'Tidak mendapat ASI'}</button>)}
                </div>
              </div>

              <section className="metric-grid" aria-label="Ringkasan faktor gizi">
                <article className="metric-card"><div className="metric-top"><span className="metric-icon mint"><Icon name="nutrition" /></span><span className="metric-change positive">Kategori</span></div><p>ASI Saat Pemeriksaan</p><h2>{categoryStats(nutritionRecords, 'masih_mendapat_asi', ['Ya', 'Tidak'])[0].percent.toFixed(1)}%</h2><span className="metric-caption">masih mendapat ASI</span></article>
                <article className="metric-card"><div className="metric-top"><span className="metric-icon amber"><Icon name="chart" /></span><span className="metric-change neutral">Rata-rata</span></div><p>Frekuensi Makan</p><h2>{average(nutritionRecords, 'frekuensi_makan_24_jam')?.toFixed(1) ?? '-'}</h2><span className="metric-caption">kali dalam 24 jam</span></article>
                <article className="metric-card"><div className="metric-top"><span className="metric-icon blue"><Icon name="database" /></span><span className="metric-change neutral">Rata-rata</span></div><p>Kelompok Pangan</p><h2>{average(nutritionRecords, 'jumlah_kelompok_pangan_24_jam')?.toFixed(1) ?? '-'}</h2><span className="metric-caption">kelompok dalam 24 jam</span></article>
                <article className="metric-card"><div className="metric-top"><span className="metric-icon coral"><Icon name="users" /></span><span className="metric-change positive">Proporsi</span></div><p>Gejala Diare</p><h2>{percentage(nutritionRecords.filter((item) => item.gejala_diare_14_hari_terakhir === 'Ya').length, nutritionRecords.length).toFixed(1)}%</h2><span className="metric-caption">dalam subset status ASI</span></article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header"><div><p className="panel-kicker">PERBANDINGAN PROPORSI</p><h2>Status pemberian ASI</h2></div></div>
                  <div className="bar-list">{categoryStats(nutritionRecords, 'masih_mendapat_asi', ['Ya', 'Tidak']).map((item) => <div className="bar-row" key={item.name}><div className="bar-label"><span>{item.name === 'Ya' ? 'Masih mendapat ASI' : 'Tidak mendapat ASI'}</span><strong>{item.count.toLocaleString('id-ID')} · {item.percent.toFixed(1)}%</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${item.percent}%` }} /></div></div>)}</div>
                </article>
                <article className="panel distribution-panel">
                  <div className="panel-header"><div><p className="panel-kicker">ANTROPOMETRI</p><h2>Ukuran rata-rata</h2></div></div>
                  <div className="summary-list"><div><span>Rata-rata berat</span><strong>{average(nutritionRecords, 'berat_badan_kg')?.toFixed(1) ?? '-'} kg</strong></div><div><span>Rata-rata panjang/tinggi</span><strong>{average(nutritionRecords, 'panjang_tinggi_badan_cm')?.toFixed(1) ?? '-'} cm</strong></div><div><span>BMI turunan rata-rata</span><strong>{nutritionBmiStats?.toFixed(1) ?? '-'} kg/m²</strong></div></div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header"><div><p className="panel-kicker">KONDISI GIZI TERSEDIA</p><h2>ASI dan pola makan</h2></div><span className="table-count">{nutritionRecords.length} catatan</span></div>
                <div className="table-scroll"><table><thead><tr><th>ID</th><th>ASI</th><th>Kelompok Pangan</th><th>Frekuensi Makan</th><th>BB</th><th>Status Diare</th></tr></thead><tbody>{nutritionRecords.slice(0, 8).map((record) => <tr key={`${record.id_balita}-${record.tanggal_pengukuran}`}><td><strong>{record.id_balita}</strong></td><td>{record.masih_mendapat_asi || '-'}</td><td>{record.jumlah_kelompok_pangan_24_jam || '-'}</td><td>{record.frekuensi_makan_24_jam ? `${record.frekuensi_makan_24_jam} kali` : '-'}</td><td>{record.berat_badan_kg ? `${record.berat_badan_kg} kg` : '-'}</td><td><span className={record.gejala_diare_14_hari_terakhir === 'Tidak' ? 'status-badge complete' : record.gejala_diare_14_hari_terakhir === 'Ya' ? 'status-badge review' : 'status-badge'}>{record.gejala_diare_14_hari_terakhir === 'Ya' ? 'Diare' : record.gejala_diare_14_hari_terakhir === 'Tidak' ? 'Tidak diare' : '-'}</span></td></tr>)}</tbody></table></div>
              </section>
            </>
          )}

          {activeDashboardSection === 'Kesehatan Keluarga' && (
            <>
              <section className="metric-grid" aria-label="Ringkasan kesehatan keluarga">
                {[
                  { label: 'Air Minum Dimasak', field: 'air_minum_dimasak', icon: 'home', className: 'mint' },
                  { label: 'Cuci Tangan Pakai Sabun', field: 'cuci_tangan_pakai_sabun', icon: 'users', className: 'blue' },
                  { label: 'Gejala Diare', field: 'gejala_diare_14_hari_terakhir', icon: 'chart', className: 'coral' },
                ].map((item) => {
                  const yesCount = filteredRecords.filter((record) => record[item.field] === 'Ya').length
                  const yesPercent = percentage(yesCount, filteredRecords.length)
                  return <article className="metric-card" key={item.field}><div className="metric-top"><span className={`metric-icon ${item.className}`}><Icon name={item.icon} /></span><span className="metric-change positive">{yesPercent.toFixed(1)}%</span></div><p>{item.label}</p><h2>{yesCount.toLocaleString('id-ID')}</h2><span className="metric-caption">catatan bernilai Ya</span></article>
                })}
                <article className="metric-card"><div className="metric-top"><span className="metric-icon amber"><Icon name="database" /></span><span className="metric-change neutral">Rata-rata</span></div><p>Frekuensi BAB Cair</p><h2>{average(filteredRecords, 'frekuensi_bab_cair_24_jam')?.toFixed(1) ?? '-'}</h2><span className="metric-caption">kali dalam 24 jam</span></article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header"><div><p className="panel-kicker">CROSS-FILTER INDIKATOR</p><h2>Pengelolaan air dan kebersihan</h2></div></div>
                  <div className="bar-list">
                    {[
                      { label: 'Air minum dimasak', field: 'air_minum_dimasak' },
                      { label: 'Cuci tangan pakai sabun', field: 'cuci_tangan_pakai_sabun' },
                    ].map((item) => {
                      const statsRows = categoryStats(filteredRecords, item.field, ['Ya', 'Tidak'])
                      const yes = statsRows[0]
                      return <div className="bar-row" key={item.field}><div className="bar-label"><span>{item.label}</span><strong>Ya {yes.count.toLocaleString('id-ID')} · {yes.percent.toFixed(1)}%</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${yes.percent}%` }} /></div></div>
                    })}
                  </div>
                </article>
                <article className="panel distribution-panel">
                  <div className="panel-header"><div><p className="panel-kicker">DEFINISI KATEGORI</p><h2>Catatan interpretasi</h2></div></div>
                  <div className="definition-list"><p><strong>Ya/Tidak</strong> sesuai kolom sumber; tidak dinormalisasi menjadi skor risiko.</p><p><strong>Air dimasak</strong> hanya menunjukkan praktik pada saat pemeriksaan.</p><p><strong>Cuci tangan</strong> menunjukkan jawaban kategori memakai sabun.</p></div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header"><div><p className="panel-kicker">DATA KELUARGA</p><h2>Indikator kesehatan rumah tangga</h2></div><span className="table-count">{latestRecords.length} catatan terbaru</span></div>
                <div className="table-scroll"><table><thead><tr><th>ID</th><th>Kecamatan</th><th>Air Dimasak</th><th>Cuci Tangan</th><th>BAB Cair/24 jam</th><th>Lama Diare</th></tr></thead><tbody>{latestRecords.map((record) => <tr key={`${record.id_balita}-${record.tanggal_pengukuran}`}><td><strong>{record.id_balita}</strong></td><td>{record.kecamatan}</td><td>{record.air_minum_dimasak || '-'}</td><td>{record.cuci_tangan_pakai_sabun || '-'}</td><td>{record.frekuensi_bab_cair_24_jam || '-'}</td><td>{record.lama_gejala_diare_hari ? `${record.lama_gejala_diare_hari} hari` : '-'}</td></tr>)}</tbody></table></div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
