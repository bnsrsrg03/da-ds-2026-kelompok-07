import { useEffect, useMemo, useState } from 'react'
import './App.css'

const Icon = ({ name, size = 20 }) => {
  const icons = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    chart: <><path d="M3 3v18h18" /><path d="M7 16l4-4 3 2 6-7" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
    model: <><circle cx="12" cy="12" r="3" /><circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M7 6l3 4M17 6l-3 4M7 18l3-4M17 18l-3-4" /></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
    trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
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

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [period, setPeriod] = useState('12 bulan')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/diare_balita_toba_raw.csv')
      .then((response) => {
        if (!response.ok) throw new Error('Dataset tidak dapat dimuat')
        return response.text()
      })
      .then((csv) => {
        const rows = csv.split(/\r?\n/).filter(Boolean)
        const headers = rows[0].replace(/^\uFEFF/, '').split(',')
        const parsed = rows.slice(1).map((row) => {
          const values = row.split(',')
          return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim()]))
        })
        setRecords(parsed)
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }, [])

  const filteredRecords = useMemo(() => {
    if (!records.length) return []
    const latestDate = new Date(Math.max(...records.map((item) => new Date(item.tanggal_pengukuran).getTime())))
    const monthCount = period === '30 hari' ? 1 : period === '6 bulan' ? 6 : 12
    const startDate = new Date(latestDate)
    startDate.setMonth(startDate.getMonth() - monthCount)
    return records.filter((item) => {
      const date = new Date(item.tanggal_pengukuran)
      return date >= startDate && date <= latestDate
    })
  }, [records, period])

  const stats = useMemo(() => {
    const count = filteredRecords.length
    const diarrheaCount = filteredRecords.filter((item) => item.gejala_diare_14_hari_terakhir === 'Ya').length
    const averageAge = count
      ? filteredRecords.reduce((sum, item) => sum + Number(item.usia_balita_bulan || 0), 0) / count
      : 0
    const averageWeight = count
      ? filteredRecords.reduce((sum, item) => sum + Number(item.berat_badan_kg || 0), 0) / count
      : 0
    return { count, diarrheaCount, diarrheaPercent: count ? (diarrheaCount / count * 100) : 0, averageAge, averageWeight }
  }, [filteredRecords])

  const trendData = useMemo(() => {
    const groups = new Map()
    filteredRecords.forEach((item) => {
      const date = new Date(item.tanggal_pengukuran)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const current = groups.get(key) || { total: 0, diarrhea: 0 }
      current.total += 1
      if (item.gejala_diare_14_hari_terakhir === 'Ya') current.diarrhea += 1
      groups.set(key, current)
    })
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [, month] = key.split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des']
        return { month: monthNames[Number(month) - 1], value: value.diarrhea, percent: value.total ? value.diarrhea / value.total * 100 : 0 }
      })
  }, [filteredRecords])

  const distribution = useMemo(() => {
    const male = filteredRecords.filter((item) => item.jenis_kelamin === 'L').length
    const female = filteredRecords.filter((item) => item.jenis_kelamin === 'P').length
    const total = male + female
    return [
      { name: 'Laki-laki', value: total ? male / total * 100 : 0, color: '#22b8a7' },
      { name: 'Perempuan', value: total ? female / total * 100 : 0, color: '#6c7adf' },
    ]
  }, [filteredRecords])

  const latestRecords = useMemo(() => [...filteredRecords]
    .sort((a, b) => b.tanggal_pengukuran.localeCompare(a.tanggal_pengukuran))
    .slice(0, 5), [filteredRecords])

  const linePoints = trendData
    .map((item, index) => `${58 + index * (572 / Math.max(trendData.length - 1, 1))},${170 - Math.min(item.percent, 100) * 1.35}`)
    .join(' ')

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">N</div>
          <div>
            <strong>Nexa</strong>
            <span>Analytics</span>
          </div>
        </div>

        <nav className="navigation" aria-label="Navigasi utama">
          <p className="nav-heading">MENU UTAMA</p>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={activeNav === item.label ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                setActiveNav(item.label)
                setSidebarOpen(false)
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-avatar">AK</div>
          <div className="profile-copy">
            <strong>Kelompok 07</strong>
            <span>Data Team</span>
          </div>
          <button type="button" className="profile-more" aria-label="Menu profil">•••</button>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-overlay" type="button" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button type="button" className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
            <span />
            <span />
            <span />
          </button>
          <label className="search-box">
            <Icon name="search" size={18} />
            <input type="search" placeholder="Cari laporan, data, atau model..." aria-label="Cari" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Notifikasi">
              <Icon name="bell" size={19} />
              <span className="notification-dot" />
            </button>
            <button type="button" className="export-button">
              <Icon name="download" size={17} />
              <span>Ekspor</span>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">DASHBOARD ANALITIK</p>
              <h1>{activeNav}</h1>
            </div>
            <label className="period-control">
              <Icon name="calendar" size={17} />
              <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Rentang waktu">
                <option>30 hari</option>
                <option>6 bulan</option>
                <option>12 bulan</option>
              </select>
            </label>
          </div>

          <div className="data-warning" role="status">
            <span className="warning-dot" />
            <span><strong>Sumber data:</strong> {loading ? 'Memuat dataset...' : `${stats.count.toLocaleString('id-ID')} catatan pemeriksaan balita dari data raw Toba.`}</span>
          </div>

          <section className="metric-grid" aria-label="Ringkasan statistik">
            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon mint"><Icon name="users" /></span>
                <span className="metric-change positive">Dataset</span>
              </div>
              <p>Total Balita</p>
              <h2>{stats.count.toLocaleString('id-ID')}</h2>
              <span className="metric-caption">catatan pada rentang waktu dipilih</span>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon blue"><Icon name="chart" /></span>
                <span className="metric-change positive">{stats.diarrheaPercent.toFixed(1)}%</span>
              </div>
              <p>Kasus Diare 14 Hari Terakhir</p>
              <h2>{stats.diarrheaCount.toLocaleString('id-ID')}</h2>
              <span className="metric-caption">balita dengan gejala diare</span>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon amber"><Icon name="database" /></span>
                <span className="metric-change neutral">Rata-rata</span>
              </div>
              <p>Usia Balita</p>
              <h2>{stats.averageAge.toFixed(1)} bln</h2>
              <span className="metric-caption">rata-rata usia pada dataset</span>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon coral"><Icon name="model" /></span>
                <span className="metric-change positive">Rata-rata</span>
              </div>
              <p>Berat Badan</p>
              <h2>{stats.averageWeight.toFixed(1)} kg</h2>
              <span className="metric-caption">rata-rata berat badan balita</span>
            </article>
          </section>

          <section className="visual-grid">
            <article className="panel trend-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">PERFORMA</p>
                  <h2>Tren Bulanan</h2>
                </div>
                <button type="button" className="panel-menu" aria-label="Menu tren">•••</button>
              </div>
              <div className="chart-summary">
                <strong>{stats.diarrheaPercent.toFixed(1)}%</strong>
                <span className="summary-increase">kasus diare</span>
              </div>
              <div className="line-chart" aria-label="Grafik tren data dummy">
                <div className="chart-y-labels">
                  <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                </div>
                <svg viewBox="0 0 650 200" role="img" aria-label="Garis tren bulan Januari hingga Desember">
                  <g className="grid-lines">
                    <line x1="58" y1="20" x2="630" y2="20" />
                    <line x1="58" y1="57" x2="630" y2="57" />
                    <line x1="58" y1="94" x2="630" y2="94" />
                    <line x1="58" y1="131" x2="630" y2="131" />
                    <line x1="58" y1="168" x2="630" y2="168" />
                  </g>
                  <polygon points={`58,168 ${linePoints} 630,168`} fill="url(#lineFill)" />
                  <polyline points={linePoints} fill="none" stroke="#22b8a7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {trendData.map((item, index) => (
                    <circle key={`${item.month}-${index}`} cx={58 + index * (572 / Math.max(trendData.length - 1, 1))} cy={170 - item.percent * 1.35} r={index === trendData.length - 1 ? 5 : 3} fill="#fff" stroke="#22b8a7" strokeWidth="2" />
                  ))}
                  <defs>
                    <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22b8a7" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#22b8a7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="chart-x-labels">
                  {trendData.map((item) => <span key={item.month}>{item.month}</span>)}
                </div>
              </div>
            </article>

            <article className="panel distribution-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">SEBARAN</p>
                  <h2>Distribusi Data</h2>
                </div>
                <button type="button" className="panel-menu" aria-label="Menu distribusi">•••</button>
              </div>
              <div className="donut-wrap">
                <div
                  className="donut"
                  role="img"
                  aria-label="Diagram sebaran jenis kelamin balita"
                  style={{
                    background: `conic-gradient(#22b8a7 0 ${distribution[0]?.value || 0}%, #6c7adf ${distribution[0]?.value || 0}% 100%)`,
                  }}
                >
                  <div className="donut-center">
                    <strong>100%</strong>
                    <span>Total</span>
                  </div>
                </div>
              </div>
              <div className="legend">
                {distribution.map((category) => (
                  <div className="legend-row" key={category.name}>
                    <span className="legend-name"><i style={{ background: category.color }} />{category.name}</span>
                    <strong>{category.value.toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="panel table-panel">
            <div className="panel-header table-header">
              <div>
                <p className="panel-kicker">DATA TERBARU</p>
                <h2>Aktivitas Pengamatan</h2>
              </div>
              <button type="button" className="text-button">Lihat semua <span>→</span></button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID Balita</th>
                    <th>Kecamatan</th>
                    <th>Tanggal</th>
                    <th>Berat Badan</th>
                    <th>Status Diare</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRecords.map((record) => (
                    <tr key={record.id_balita}>
                      <td><strong>{record.id_balita}</strong></td>
                      <td>{record.kecamatan}</td>
                      <td>{record.tanggal_pengukuran}</td>
                      <td>{Number(record.berat_badan_kg).toLocaleString('id-ID')} kg</td>
                      <td><span className={record.gejala_diare_14_hari_terakhir === 'Tidak' ? 'status-badge complete' : 'status-badge review'}>{record.gejala_diare_14_hari_terakhir === 'Tidak' ? 'Tidak diare' : 'Diare'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
