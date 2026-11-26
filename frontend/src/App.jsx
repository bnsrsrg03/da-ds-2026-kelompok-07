
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
    chevron: <path d="m6 9 6 6 6-6" />,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

const dashboardSections = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Profil Balita', icon: 'users' },
  { label: 'Faktor Gizi', icon: 'nutrition' },
  { label: 'Kesehatan Keluarga', icon: 'home' },
  { label: 'Wilayah & Waktu', icon: 'calendar' },
  { label: 'Storytelling / Insight', icon: 'chart' },
  { label: 'Modul Klasifikasi', icon: 'model' },
  { label: 'Evaluasi Model', icon: 'report' },
  { label: 'Tentang Data', icon: 'database' },
]

const ageGroupOptions = [
  '< 6 bulan',
  '6–11 bulan',
  '12–23 bulan',
  '24–35 bulan',
  '36–47 bulan',
  '48–59 bulan',
]

const navItems = [
  { label: 'Dashboard', icon: 'grid', section: 'Overview' },
  { label: 'Data Import', icon: 'download', section: 'Tentang Data' },
  { label: 'Data Cleaning', icon: 'search' },
  { label: 'Data Analysis', icon: 'chart', section: 'Storytelling / Insight' },
  {
    label: 'Data Visualization',
    icon: 'chart',
    submenuId: 'visualization-submenu',
    children: dashboardSections.filter(({ label }) =>
      ['Profil Balita', 'Faktor Gizi', 'Kesehatan Keluarga', 'Wilayah & Waktu'].includes(label)
    ),
  },
  {
    label: 'Prediction',
    icon: 'model',
    submenuId: 'prediction-submenu',
    children: dashboardSections.filter(({ label }) =>
      ['Modul Klasifikasi', 'Evaluasi Model'].includes(label)
    ),
  },
  { label: 'Reports', icon: 'report' },
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
  return rows.slice(1).map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() || ''])
    )
  )
}

function validNumber(value) {
  const number = Number(value)
  return value !== '' && Number.isFinite(number) ? number : null
}

function average(records, field) {
  const values = records
    .map((item) => validNumber(item[field]))
    .filter((value) => value !== null)

  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null
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
  if (!Number.isFinite(months) || months < 0 || months >= 60) return 'Tidak valid'
  if (months < 6) return '< 6 bulan'
  if (months < 12) return '6–11 bulan'
  if (months < 24) return '12–23 bulan'
  if (months < 36) return '24–35 bulan'
  if (months < 48) return '36–47 bulan'
  return '48–59 bulan'
}

function normalizeSex(value) {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('id')
  if (['l', 'laki-laki', 'laki laki'].includes(normalized)) return 'L'
  if (['p', 'perempuan'].includes(normalized)) return 'P'
  return null
}

function normalizeDiarrheaStatus(value) {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('id')
  if (normalized === 'ya') return 'Ya'
  if (normalized === 'tidak') return 'Tidak'
  return null
}

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [activeDashboardSection, setActiveDashboardSection] = useState('Overview')
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [period, setPeriod] = useState('12 bulan')
  const [district, setDistrict] = useState('Semua kecamatan')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('Semua kelompok')
  const [selectedSex, setSelectedSex] = useState('Semua')
  const [selectedDiarrheaStatus, setSelectedDiarrheaStatus] = useState('Semua status')
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

  const districtOptions = useMemo(
    () => [
      'Semua kecamatan',
      ...[...new Set(records.map((item) => item.kecamatan).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'id')),
    ],
    [records]
  )

  const latestDate = useMemo(() => {
    const dates = records
      .map((item) => new Date(`${item.tanggal_pengukuran}T00:00:00`))
      .filter((date) => !Number.isNaN(date.getTime()))

    return dates.length
      ? new Date(Math.max(...dates.map((date) => date.getTime())))
      : null
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

  const scopedRecords = useMemo(
    () => periodRecords.filter((item) => {
      const districtMatch =
        district === 'Semua kecamatan' || item.kecamatan === district

      const query = search.trim().toLowerCase()
      const searchMatch =
        !query ||
        [item.id_balita, item.kecamatan, item.tanggal_pengukuran]
          .some((value) => (value || '').toLowerCase().includes(query))

      const itemAgeGroup = ageGroup(validNumber(item.usia_balita_bulan))
      const ageMatch =
        selectedAgeGroup === 'Semua kelompok'
        || (selectedAgeGroup === 'Tidak diketahui'
          ? itemAgeGroup === 'Tidak valid'
          : itemAgeGroup === selectedAgeGroup)

      const itemSex = normalizeSex(item.jenis_kelamin)
      const sexMatch =
        selectedSex === 'Semua'
        || (selectedSex === 'Tidak diketahui'
          ? itemSex === null
          : itemSex === selectedSex)

      return districtMatch && searchMatch && ageMatch && sexMatch
    }),
    [periodRecords, district, search, selectedAgeGroup, selectedSex]
  )

  const filteredRecords = useMemo(
    () => scopedRecords.filter((item) => {
      if (selectedDiarrheaStatus === 'Semua status') return true

      const status = normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir)
      return selectedDiarrheaStatus === 'Tidak diketahui'
        ? status === null
        : status === selectedDiarrheaStatus
    }),
    [scopedRecords, selectedDiarrheaStatus]
  )

  const outcomeRecords = useMemo(
    () => scopedRecords.filter(
      (item) => normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir) !== null
    ),
    [scopedRecords]
  )

  const stats = useMemo(() => {
    const count = filteredRecords.length
    const diarrheaCount = outcomeRecords.filter(
      (item) => normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir) === 'Ya'
    ).length
    const uniqueBalita = new Set(
      filteredRecords.map((item) => item.id_balita).filter(Boolean)
    ).size

    return {
      count,
      uniqueBalita,
      diarrheaCount,
      diarrheaDenominator: outcomeRecords.length,
      nonDiarrheaCount: outcomeRecords.length - diarrheaCount,
      diarrheaPercent: percentage(diarrheaCount, outcomeRecords.length),
      averageAge: average(filteredRecords, 'usia_balita_bulan'),
      averageWeight: average(filteredRecords, 'berat_badan_kg'),
      averageHeight: average(filteredRecords, 'panjang_tinggi_badan_cm'),
    }
  }, [filteredRecords, outcomeRecords])

  const trendData = useMemo(() => {
    const groups = new Map()

    outcomeRecords.forEach((item) => {
      const date = new Date(`${item.tanggal_pengukuran}T00:00:00`)
      if (Number.isNaN(date.getTime())) return

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const current = groups.get(key) || { total: 0, diarrhea: 0 }

      current.total += 1

      if (normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir) === 'Ya') {
        current.diarrhea += 1
      }

      groups.set(key, current)
    })

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ]

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [, month] = key.split('-')
        return {
          key,
          month: monthNames[Number(month) - 1],
          percent: percentage(value.diarrhea, value.total),
          value: value.diarrhea,
          total: value.total,
        }
      })
  }, [outcomeRecords])

  // Menghitung ringkasan data berdasarkan kecamatan.
  const districtStats = useMemo(() => {
    const groups = new Map()

    outcomeRecords.forEach((item) => {
      const name = item.kecamatan || 'Tidak diketahui'
      const current = groups.get(name) || {
        name,
        total: 0,
        diarrhea: 0,
      }

      current.total += 1

      if (normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir) === 'Ya') {
        current.diarrhea += 1
      }

      groups.set(name, current)
    })

    return [...groups.values()]
      .map((item) => ({
        ...item,
        percent: percentage(item.diarrhea, item.total),
      }))
      .sort((a, b) => b.total - a.total)
  }, [outcomeRecords])

  // Menghitung insight berdasarkan data yang sedang difilter.
  const insightStats = useMemo(() => {
    const diarrheaRecords = outcomeRecords.filter(
      (item) => normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir) === 'Ya'
    )

    const highestDistrict = [...districtStats]
      .filter((item) => item.total > 0)
      .sort((a, b) => b.percent - a.percent)[0] || null

    const highestMonth = [...trendData]
      .filter((item) => item.total > 0)
      .sort((a, b) => b.percent - a.percent)[0] || null

    const ageGroups = new Map()

    diarrheaRecords.forEach((item) => {
      const group = ageGroup(validNumber(item.usia_balita_bulan))

      if (group === 'Tidak valid') return

      ageGroups.set(group, (ageGroups.get(group) || 0) + 1)
    })

    const highestAgeGroup = [...ageGroups.entries()]
      .sort((a, b) => b[1] - a[1])[0] || null

    return {
      diarrheaCount: diarrheaRecords.length,
      diarrheaPercent: percentage(
        diarrheaRecords.length,
        outcomeRecords.length
      ),
      highestDistrict,
      highestMonth,
      highestAgeGroup,
    }
  }, [outcomeRecords, districtStats, trendData])

  const diarrheaDistribution = useMemo(() => [
    {
      name: 'Tidak diare',
      count: stats.nonDiarrheaCount,
      percent: percentage(stats.nonDiarrheaCount, stats.diarrheaDenominator),
      color: '#22b8a7',
    },
    {
      name: 'Diare',
      count: stats.diarrheaCount,
      percent: stats.diarrheaPercent,
      color: '#ef7c69',
    },
  ], [stats])

  const ageDistribution = useMemo(() => {
    return ageGroupOptions.map((label) => {
      const count = filteredRecords.filter(
        (item) => ageGroup(validNumber(item.usia_balita_bulan)) === label
      ).length

      return {
        name: label,
        count,
        percent: percentage(count, filteredRecords.length),
      }
    })
  }, [filteredRecords])

  const sexDistribution = useMemo(() => [
    {
      name: 'Laki-laki',
      count: filteredRecords.filter((item) => normalizeSex(item.jenis_kelamin) === 'L').length,
      color: '#22b8a7',
    },
    {
      name: 'Perempuan',
      count: filteredRecords.filter((item) => normalizeSex(item.jenis_kelamin) === 'P').length,
      color: '#6c7adf',
    },
    {
      name: 'Tidak diketahui',
      count: filteredRecords.filter((item) => normalizeSex(item.jenis_kelamin) === null).length,
      color: '#ef7c69',
    },
  ], [filteredRecords])

  const sexDonutBackground = useMemo(() => {
    if (!stats.count) return '#e8eeeb'

    let offset = 0
    const segments = sexDistribution.map((item) => {
      const start = offset
      offset += item.count / stats.count * 100
      return `${item.color} ${start}% ${offset}%`
    })

    return `conic-gradient(${segments.join(', ')})`
  }, [sexDistribution, stats.count])

  const bmiStats = useMemo(() => {
    const values = filteredRecords.map((item) => {
      const weight = validNumber(item.berat_badan_kg)
      const height = validNumber(item.panjang_tinggi_badan_cm)

      if (weight === null || height === null || height <= 0) return null

      const meters = height / 100
      return weight / (meters * meters)
    }).filter((value) => value !== null)

    return values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null
  }, [filteredRecords])

  const nutritionRecords = useMemo(() => {
    if (nutritionFilter === 'Semua') return filteredRecords

    return filteredRecords.filter(
      (item) => item.masih_mendapat_asi === nutritionFilter
    )
  }, [filteredRecords, nutritionFilter])

  const nutritionOutcomeRecords = useMemo(
    () => scopedRecords.filter((item) => (
      normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir) !== null
      && (nutritionFilter === 'Semua' || item.masih_mendapat_asi === nutritionFilter)
    )),
    [scopedRecords, nutritionFilter]
  )

  const nutritionBmiStats = useMemo(() => {
    const values = nutritionRecords.map((item) => {
      const weight = validNumber(item.berat_badan_kg)
      const height = validNumber(item.panjang_tinggi_badan_cm)

      if (weight === null || height === null || height <= 0) return null

      const meters = height / 100
      return weight / (meters * meters)
    }).filter((value) => value !== null)

    return values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null
  }, [nutritionRecords])

  const latestRecords = useMemo(
    () => [...filteredRecords]
      .sort((a, b) => b.tanggal_pengukuran.localeCompare(a.tanggal_pengukuran))
      .slice(0, 8),
    [filteredRecords]
  )

  const linePoints = trendData
    .map((item, index) =>
      `${58 + index * (572 / Math.max(trendData.length - 1, 1))},${170 - Math.min(item.percent, 100) * 1.35}`
    )
    .join(' ')

  function exportCsv() {
    if (!filteredRecords.length) return

    const headers = Object.keys(filteredRecords[0])
    const escape = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`

    const csv = [
      headers.join(','),
      ...filteredRecords.map((item) =>
        headers.map((header) => escape(item[header])).join(',')
      ),
    ].join('\n')

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' })
    )

    const link = document.createElement('a')
    link.href = url
    link.download = 'dashboard-balita-toba.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const periodLabel = latestDate
    ? `${latestDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`
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
          {navItems.map((item) => {
            if (item.children) {
              const expanded = expandedMenu === item.label

              return (
                <div className="nav-group" key={item.label}>
                  <button
                    type="button"
                    className={activeNav === item.label ? 'nav-item active' : 'nav-item'}
                    onClick={() => {
                      setExpandedMenu((current) =>
                        current === item.label ? null : item.label
                      )
                    }}
                    aria-expanded={expanded}
                    aria-controls={item.submenuId}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                    <span className={`nav-chevron ${expanded ? 'expanded' : ''}`}>
                      <Icon name="chevron" size={16} />
                    </span>
                  </button>
                  <div
                    id={item.submenuId}
                    className={`nav-submenu ${expanded ? 'open' : ''}`}
                    aria-hidden={!expanded}
                  >
                    <div className="nav-submenu-inner">
                      {item.children.map((section) => (
                        <button
                          type="button"
                          key={section.label}
                          className={
                            activeDashboardSection === section.label
                              ? 'nav-submenu-item active'
                              : 'nav-submenu-item'
                          }
                          onClick={() => {
                            setActiveNav(item.label)
                            setActiveDashboardSection(section.label)
                            setSidebarOpen(false)
                          }}
                          tabIndex={expanded ? 0 : -1}
                        >
                          <Icon name={section.icon} size={15} />
                          <span>{section.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <button
                type="button"
                key={item.label}
                className={activeNav === item.label ? 'nav-item active' : 'nav-item'}
                onClick={() => {
                  if (item.section) {
                    setActiveNav(item.label)
                    setActiveDashboardSection(item.section)
                  } else {
                    setActiveNav('Dashboard')
                    setActiveDashboardSection('Overview')
                  }
                  setExpandedMenu(null)
                  setSidebarOpen(false)
                }}
              >
                <Icon name={item.icon} /><span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-avatar">AK</div>
          <div className="profile-copy">
            <strong>Kelompok 07</strong>
            <span>Data Team</span>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <span /><span /><span />
          </button>

          <label className="search-box">
            <Icon name="search" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari ID atau kecamatan..."
              aria-label="Cari data"
            />
          </label>

          <div className="topbar-actions">
            <button
              type="button"
              className="export-button"
              onClick={exportCsv}
              disabled={!filteredRecords.length}
            >
              <Icon name="download" size={17} />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">DASHBOARD ANALITIK</p>
              <h1>{activeNav}</h1>
            </div>

            <div className="global-filters">
              <label className="filter-control">
                <span>Kecamatan</span>
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  aria-label="Filter kecamatan"
                >
                  {districtOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="filter-control">
                <span>Periode</span>
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  aria-label="Rentang waktu"
                >
                  <option>30 hari</option>
                  <option>6 bulan</option>
                  <option>12 bulan</option>
                </select>
              </label>

              <label className="filter-control">
                <span>Kelompok umur</span>
                <select
                  value={selectedAgeGroup}
                  onChange={(event) => setSelectedAgeGroup(event.target.value)}
                  aria-label="Filter kelompok umur"
                >
                  <option>Semua kelompok</option>
                  {ageGroupOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                  <option>Tidak diketahui</option>
                </select>
              </label>

              <label className="filter-control">
                <span>Jenis kelamin</span>
                <select
                  value={selectedSex}
                  onChange={(event) => setSelectedSex(event.target.value)}
                  aria-label="Filter jenis kelamin"
                >
                  <option value="Semua">Semua</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                  <option>Tidak diketahui</option>
                </select>
              </label>

              <label className="filter-control">
                <span>Status diare</span>
                <select
                  value={selectedDiarrheaStatus}
                  onChange={(event) => setSelectedDiarrheaStatus(event.target.value)}
                  aria-label="Filter status diare"
                >
                  <option>Semua status</option>
                  <option value="Ya">Diare</option>
                  <option value="Tidak">Tidak diare</option>
                  <option>Tidak diketahui</option>
                </select>
              </label>
            </div>
          </div>

          {selectedDiarrheaStatus !== 'Semua status' && (
            <p className="filter-note" role="status">
              Filter status menyaring catatan dan KPI umum; proporsi, distribusi, serta tren
              diare tetap memakai semua catatan dengan status diketahui.
            </p>
          )}

          <div className="data-warning" role="status">
            <span className="warning-dot" />
            <span>
              <strong>Sumber data:</strong>{' '}
              {loading
                ? 'Memuat dataset...'
                : loadError
                  ? loadError
                  : `${stats.count.toLocaleString('id-ID')} catatan; tanggal pengukuran terbaru ${periodLabel}; wilayah ${district}.`}
            </span>
          </div>

          {activeDashboardSection === 'Overview' && (
            <>
              <section className="metric-grid" aria-label="Ringkasan indikator utama">
                <article className="metric-card" title="Jumlah seluruh catatan pemeriksaan yang memenuhi filter.">
                  <div className="metric-top">
                    <span className="metric-icon mint"><Icon name="users" /></span>
                    <span className="metric-change positive">Filter aktif</span>
                  </div>
                  <p>Total Catatan</p>
                  <h2>{stats.count.toLocaleString('id-ID')}</h2>
                  <span className="metric-caption">{stats.uniqueBalita.toLocaleString('id-ID')} ID balita unik terdaftar</span>
                </article>

                <article className="metric-card" title="Catatan dengan status Ya dibagi catatan valid yang statusnya diketahui.">
                  <div className="metric-top">
                    <span className="metric-icon blue"><Icon name="chart" /></span>
                    <span className="metric-change positive">{stats.diarrheaPercent.toFixed(1)}%</span>
                  </div>
                  <p>Gejala Diare 14 Hari</p>
                  <h2>{stats.diarrheaCount.toLocaleString('id-ID')}</h2>
                  <span className="metric-caption">
                    dari {stats.diarrheaDenominator.toLocaleString('id-ID')} catatan dengan status diketahui
                  </span>
                </article>

                <article className="metric-card" title="Rata-rata usia yang tersedia pada catatan terfilter.">
                  <div className="metric-top">
                    <span className="metric-icon amber"><Icon name="database" /></span>
                    <span className="metric-change neutral">Rata-rata</span>
                  </div>
                  <p>Usia Balita</p>
                  <h2>{stats.averageAge === null ? '-' : `${stats.averageAge.toFixed(1)} bln`}</h2>
                  <span className="metric-caption">rata-rata usia balita</span>
                </article>

                <article className="metric-card" title="Rata-rata berat badan yang tersedia pada catatan terfilter.">
                  <div className="metric-top">
                    <span className="metric-icon coral"><Icon name="users" /></span>
                    <span className="metric-change positive">Rata-rata</span>
                  </div>
                  <p>Berat Badan</p>
                  <h2>{stats.averageWeight === null ? '-' : `${stats.averageWeight.toFixed(1)} kg`}</h2>
                  <span className="metric-caption">rata-rata pengukuran berat</span>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel trend-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">TEMUAN UTAMA</p>
                      <h2>Proporsi diare pada periode terfilter</h2>
                    </div>
                  </div>

                  <div className="chart-summary">
                    <strong>{stats.diarrheaPercent.toFixed(1)}%</strong>
                    <span className="summary-increase">
                      {stats.diarrheaCount.toLocaleString('id-ID')} dari {stats.diarrheaDenominator.toLocaleString('id-ID')} catatan
                    </span>
                  </div>

                  <div className="line-chart" aria-label="Tren bulanan proporsi gejala diare">
                    <div className="chart-y-labels">
                      <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                    </div>

                    <svg viewBox="0 0 650 200" role="img">
                      <g className="grid-lines">
                        <line x1="58" y1="20" x2="630" y2="20" />
                        <line x1="58" y1="57" x2="630" y2="57" />
                        <line x1="58" y1="94" x2="630" y2="94" />
                        <line x1="58" y1="131" x2="630" y2="131" />
                        <line x1="58" y1="168" x2="630" y2="168" />
                      </g>

                      {trendData.length > 0 && (
                        <polygon
                          points={`58,168 ${linePoints} 630,168`}
                          fill="url(#lineFill)"
                        />
                      )}

                      {trendData.length > 0 && (
                        <polyline
                          points={linePoints}
                          fill="none"
                          stroke="#22b8a7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {trendData.map((item, index) => (
                        <circle
                          key={item.key}
                          cx={58 + index * (572 / Math.max(trendData.length - 1, 1))}
                          cy={170 - item.percent * 1.35}
                          r={4}
                          fill="#fff"
                          stroke="#22b8a7"
                          strokeWidth="2"
                        >
                          <title>
                            {item.month}: {item.percent.toFixed(1)}% ({item.value}/{item.total})
                          </title>
                        </circle>
                      ))}

                      <defs>
                        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22b8a7" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#22b8a7" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="chart-x-labels">
                      {trendData.map((item) => (
                        <span key={item.key}>{item.month}</span>
                      ))}
                    </div>
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">STATUS DIARE</p>
                      <h2>Distribusi status</h2>
                    </div>
                  </div>

                  <div className="donut-wrap">
                    <div
                      className="donut"
                      role="img"
                      aria-label="Distribusi status diare"
                      style={{
                        background: `conic-gradient(#22b8a7 0 ${diarrheaDistribution[0].percent}%, #ef7c69 ${diarrheaDistribution[0].percent}% 100%)`,
                      }}
                    >
                      <div className="donut-center">
                        <strong>{stats.diarrheaDenominator.toLocaleString('id-ID')}</strong>
                        <span>Status diketahui</span>
                      </div>
                    </div>
                  </div>

                  <div className="legend">
                    {diarrheaDistribution.map((category) => (
                      <div className="legend-row" key={category.name}>
                        <span className="legend-name">
                          <i style={{ background: category.color }} />
                          {category.name}
                        </span>
                        <strong>
                          {category.count.toLocaleString('id-ID')} · {category.percent.toFixed(1)}%
                        </strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header">
                  <div>
                    <p className="panel-kicker">DATA TERBARU</p>
                    <h2>Ringkasan pengamatan</h2>
                  </div>
                  <span className="table-count">{latestRecords.length} catatan</span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID Balita</th><th>Kecamatan</th><th>Tanggal</th>
                        <th>Usia</th><th>Berat</th><th>Status Diare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRecords.map((record) => (
                        <tr key={`${record.id_balita}-${record.tanggal_pengukuran}-${record.kecamatan}`}>
                          <td><strong>{record.id_balita || '-'}</strong></td>
                          <td>{record.kecamatan || '-'}</td>
                          <td>{record.tanggal_pengukuran || '-'}</td>
                          <td>{validNumber(record.usia_balita_bulan) === null ? '-' : `${record.usia_balita_bulan} bln`}</td>
                          <td>{validNumber(record.berat_badan_kg) === null ? '-' : `${Number(record.berat_badan_kg).toLocaleString('id-ID')} kg`}</td>
                          <td>
                            <span className={record.gejala_diare_14_hari_terakhir === 'Tidak' ? 'status-badge complete' : 'status-badge review'}>
                              {record.gejala_diare_14_hari_terakhir === 'Ya'
                                ? 'Diare'
                                : record.gejala_diare_14_hari_terakhir === 'Tidak'
                                  ? 'Tidak diare'
                                  : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeDashboardSection === 'Profil Balita' && (
            <>
              <section className="metric-grid" aria-label="Ringkasan profil balita">
                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon amber"><Icon name="database" /></span>
                    <span className="metric-change neutral">Usia rata-rata</span>
                  </div>
                  <p>Kelompok Usia</p>
                  <h2>{stats.averageAge === null ? '-' : `${stats.averageAge.toFixed(1)} bln`}</h2>
                  <span className="metric-caption">tidak menggantikan klasifikasi antropometri</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon mint"><Icon name="users" /></span>
                    <span className="metric-change positive">ID unik</span>
                  </div>
                  <p>Balita Terdaftar</p>
                  <h2>{stats.uniqueBalita.toLocaleString('id-ID')}</h2>
                  <span className="metric-caption">dalam filter aktif</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon coral"><Icon name="chart" /></span>
                    <span className="metric-change neutral">Rata-rata</span>
                  </div>
                  <p>Panjang/Tinggi</p>
                  <h2>{stats.averageHeight === null ? '-' : `${stats.averageHeight.toFixed(1)} cm`}</h2>
                  <span className="metric-caption">pengukuran panjang atau tinggi</span>
                </article>

                <article className="metric-card" title="BMI turunan = berat (kg) dibagi tinggi (m) kuadrat; bukan status gizi WHO.">
                  <div className="metric-top">
                    <span className="metric-icon blue"><Icon name="database" /></span>
                    <span className="metric-change neutral">Turunan</span>
                  </div>
                  <p>BMI Rata-rata</p>
                  <h2>{bmiStats === null ? '-' : bmiStats.toFixed(1)}</h2>
                  <span className="metric-caption">kg/m²; memerlukan tingkatan umur untuk interpretasi</span>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">DRILL-DOWN</p>
                      <h2>Distribusi kelompok umur</h2>
                    </div>
                  </div>

                  <div className="bar-list">
                    {ageDistribution.map((item) => (
                      <div className="bar-row" key={item.name}>
                        <div className="bar-label">
                          <span>{item.name}</span>
                          <strong>{item.count.toLocaleString('id-ID')} · {item.percent.toFixed(1)}%</strong>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">SEBARAN</p>
                      <h2>Jenis kelamin</h2>
                    </div>
                  </div>

                  <div className="donut-wrap">
                    <div
                      className="donut sex-donut"
                      role="img"
                      aria-label="Distribusi jenis kelamin"
                      style={{
                        background: sexDonutBackground,
                      }}
                    >
                      <div className="donut-center">
                        <strong>{stats.count.toLocaleString('id-ID')}</strong>
                        <span>Catatan</span>
                      </div>
                    </div>
                  </div>

                  <div className="legend">
                    {sexDistribution.map((item) => (
                      <div className="legend-row" key={item.name}>
                        <span className="legend-name">
                          <i style={{ background: item.color }} />
                          {item.name}
                        </span>
                        <strong>
                          {item.count.toLocaleString('id-ID')} · {stats.count ? (item.count / stats.count * 100).toFixed(1) : '0.0'}%
                        </strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header">
                  <div>
                    <p className="panel-kicker">ANTROPOMETRI TURUNAN</p>
                    <h2>Data BB dan tinggi tersedia</h2>
                  </div>
                  <span className="table-count">Lihat tooltip untuk definisi BMI</span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>Usia</th><th>Jenis Kelamin</th>
                        <th>BB</th><th>Panjang/Tinggi</th><th>BMI Sederhana</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRecords.map((record) => {
                        const weight = validNumber(record.berat_badan_kg)
                        const height = validNumber(record.panjang_tinggi_badan_cm)
                        const bmi = weight !== null && height !== null && height > 0
                          ? weight / ((height / 100) ** 2)
                          : null

                        return (
                          <tr key={`${record.id_balita}-${record.tanggal_pengukuran}`}>
                            <td><strong>{record.id_balita}</strong></td>
                            <td>{record.usia_balita_bulan || '-'} bln</td>
                            <td>{record.jenis_kelamin === 'L' ? 'Laki-laki' : record.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</td>
                            <td>{weight === null ? '-' : `${weight.toLocaleString('id-ID')} kg`}</td>
                            <td>{height === null ? '-' : `${height.toLocaleString('id-ID')} cm`}</td>
                            <td>{bmi === null ? '-' : `${bmi.toFixed(1)} kg/m²`}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeDashboardSection === 'Faktor Gizi' && (
            <>
              <div className="module-toolbar">
                <div>
                  <p className="panel-kicker">FILTER KATEGORI</p>
                  <strong>Status ASI</strong>
                </div>

                <div className="segmented-control" role="group" aria-label="Filter status ASI">
                  {['Semua', 'Ya', 'Tidak'].map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={nutritionFilter === option ? 'active' : ''}
                      onClick={() => setNutritionFilter(option)}
                    >
                      {option === 'Semua'
                        ? 'Semua'
                        : option === 'Ya'
                          ? 'Mendapat ASI'
                          : 'Tidak mendapat ASI'}
                    </button>
                  ))}
                </div>
              </div>

              <section className="metric-grid" aria-label="Ringkasan faktor gizi">
                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon mint"><Icon name="nutrition" /></span>
                    <span className="metric-change positive">Kategori</span>
                  </div>
                  <p>ASI Saat Pemeriksaan</p>
                  <h2>{categoryStats(nutritionRecords, 'masih_mendapat_asi', ['Ya', 'Tidak'])[0].percent.toFixed(1)}%</h2>
                  <span className="metric-caption">masih mendapat ASI</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon amber"><Icon name="chart" /></span>
                    <span className="metric-change neutral">Rata-rata</span>
                  </div>
                  <p>Frekuensi Makan</p>
                  <h2>{average(nutritionRecords, 'frekuensi_makan_24_jam')?.toFixed(1) ?? '-'}</h2>
                  <span className="metric-caption">kali dalam 24 jam</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon blue"><Icon name="database" /></span>
                    <span className="metric-change neutral">Rata-rata</span>
                  </div>
                  <p>Kelompok Pangan</p>
                  <h2>{average(nutritionRecords, 'jumlah_kelompok_pangan_24_jam')?.toFixed(1) ?? '-'}</h2>
                  <span className="metric-caption">kelompok dalam 24 jam</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon coral"><Icon name="users" /></span>
                    <span className="metric-change positive">Proporsi</span>
                  </div>
                  <p>Gejala Diare</p>
                  <h2>{percentage(nutritionOutcomeRecords.filter((item) => normalizeDiarrheaStatus(item.gejala_diare_14_hari_terakhir) === 'Ya').length, nutritionOutcomeRecords.length).toFixed(1)}%</h2>
                  <span className="metric-caption">dalam subset status ASI</span>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">PERBANDINGAN PROPORSI</p>
                      <h2>Status pemberian ASI</h2>
                    </div>
                  </div>

                  <div className="bar-list">
                    {categoryStats(nutritionRecords, 'masih_mendapat_asi', ['Ya', 'Tidak']).map((item) => (
                      <div className="bar-row" key={item.name}>
                        <div className="bar-label">
                          <span>{item.name === 'Ya' ? 'Masih mendapat ASI' : 'Tidak mendapat ASI'}</span>
                          <strong>{item.count.toLocaleString('id-ID')} · {item.percent.toFixed(1)}%</strong>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">ANTROPOMETRI</p>
                      <h2>Ukuran rata-rata</h2>
                    </div>
                  </div>

                  <div className="summary-list">
                    <div>
                      <span>Rata-rata berat</span>
                      <strong>{average(nutritionRecords, 'berat_badan_kg')?.toFixed(1) ?? '-'} kg</strong>
                    </div>
                    <div>
                      <span>Rata-rata panjang/tinggi</span>
                      <strong>{average(nutritionRecords, 'panjang_tinggi_badan_cm')?.toFixed(1) ?? '-'} cm</strong>
                    </div>
                    <div>
                      <span>BMI turunan rata-rata</span>
                      <strong>{nutritionBmiStats?.toFixed(1) ?? '-'} kg/m²</strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header">
                  <div>
                    <p className="panel-kicker">KONDISI GIZI TERSEDIA</p>
                    <h2>ASI dan pola makan</h2>
                  </div>
                  <span className="table-count">{nutritionRecords.length} catatan</span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>ASI</th><th>Kelompok Pangan</th>
                        <th>Frekuensi Makan</th><th>BB</th><th>Status Diare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nutritionRecords.slice(0, 8).map((record) => (
                        <tr key={`${record.id_balita}-${record.tanggal_pengukuran}`}>
                          <td><strong>{record.id_balita}</strong></td>
                          <td>{record.masih_mendapat_asi || '-'}</td>
                          <td>{record.jumlah_kelompok_pangan_24_jam || '-'}</td>
                          <td>{record.frekuensi_makan_24_jam ? `${record.frekuensi_makan_24_jam} kali` : '-'}</td>
                          <td>{record.berat_badan_kg ? `${record.berat_badan_kg} kg` : '-'}</td>
                          <td>
                            <span className={
                              record.gejala_diare_14_hari_terakhir === 'Tidak'
                                ? 'status-badge complete'
                                : record.gejala_diare_14_hari_terakhir === 'Ya'
                                  ? 'status-badge review'
                                  : 'status-badge'
                            }>
                              {record.gejala_diare_14_hari_terakhir === 'Ya'
                                ? 'Diare'
                                : record.gejala_diare_14_hari_terakhir === 'Tidak'
                                  ? 'Tidak diare'
                                  : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  const metricRecords = item.field === 'gejala_diare_14_hari_terakhir'
                    ? outcomeRecords
                    : filteredRecords
                  const yesCount = metricRecords.filter(
                    (record) => item.field === 'gejala_diare_14_hari_terakhir'
                      ? normalizeDiarrheaStatus(record[item.field]) === 'Ya'
                      : record[item.field] === 'Ya'
                  ).length
                  const yesPercent = percentage(yesCount, metricRecords.length)

                  return (
                    <article className="metric-card" key={item.field}>
                      <div className="metric-top">
                        <span className={`metric-icon ${item.className}`}>
                          <Icon name={item.icon} />
                        </span>
                        <span className="metric-change positive">{yesPercent.toFixed(1)}%</span>
                      </div>
                      <p>{item.label}</p>
                      <h2>{yesCount.toLocaleString('id-ID')}</h2>
                      <span className="metric-caption">catatan bernilai Ya</span>
                    </article>
                  )
                })}

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon amber"><Icon name="database" /></span>
                    <span className="metric-change neutral">Rata-rata</span>
                  </div>
                  <p>Frekuensi BAB Cair</p>
                  <h2>{average(filteredRecords, 'frekuensi_bab_cair_24_jam')?.toFixed(1) ?? '-'}</h2>
                  <span className="metric-caption">kali dalam 24 jam</span>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">CROSS-FILTER INDIKATOR</p>
                      <h2>Pengelolaan air dan kebersihan</h2>
                    </div>
                  </div>

                  <div className="bar-list">
                    {[
                      { label: 'Air minum dimasak', field: 'air_minum_dimasak' },
                      { label: 'Cuci tangan pakai sabun', field: 'cuci_tangan_pakai_sabun' },
                    ].map((item) => {
                      const statsRows = categoryStats(
                        filteredRecords,
                        item.field,
                        ['Ya', 'Tidak']
                      )
                      const yes = statsRows[0]

                      return (
                        <div className="bar-row" key={item.field}>
                          <div className="bar-label">
                            <span>{item.label}</span>
                            <strong>Ya {yes.count.toLocaleString('id-ID')} · {yes.percent.toFixed(1)}%</strong>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${yes.percent}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">DEFINISI KATEGORI</p>
                      <h2>Catatan interpretasi</h2>
                    </div>
                  </div>

                  <div className="definition-list">
                    <p><strong>Ya/Tidak</strong> sesuai kolom sumber; tidak dinormalisasi menjadi skor risiko.</p>
                    <p><strong>Air dimasak</strong> hanya menunjukkan praktik pada saat pemeriksaan.</p>
                    <p><strong>Cuci tangan</strong> menunjukkan jawaban kategori memakai sabun.</p>
                  </div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header">
                  <div>
                    <p className="panel-kicker">DATA KELUARGA</p>
                    <h2>Indikator kesehatan rumah tangga</h2>
                  </div>
                  <span className="table-count">{latestRecords.length} catatan terbaru</span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>Kecamatan</th><th>Air Dimasak</th>
                        <th>Cuci Tangan</th><th>BAB Cair/24 jam</th><th>Lama Diare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRecords.map((record) => (
                        <tr key={`${record.id_balita}-${record.tanggal_pengukuran}`}>
                          <td><strong>{record.id_balita}</strong></td>
                          <td>{record.kecamatan}</td>
                          <td>{record.air_minum_dimasak || '-'}</td>
                          <td>{record.cuci_tangan_pakai_sabun || '-'}</td>
                          <td>{record.frekuensi_bab_cair_24_jam || '-'}</td>
                          <td>{record.lama_gejala_diare_hari ? `${record.lama_gejala_diare_hari} hari` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeDashboardSection === 'Wilayah & Waktu' && (
            <>
              <section className="metric-grid">
                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon mint"><Icon name="database" /></span>
                    <span className="metric-change neutral">Filter aktif</span>
                  </div>
                  <p>Total Catatan Wilayah</p>
                  <h2>{filteredRecords.length.toLocaleString('id-ID')}</h2>
                  <span className="metric-caption">seluruh catatan terfilter</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon coral"><Icon name="chart" /></span>
                    <span className="metric-change neutral">Gejala diare</span>
                  </div>
                  <p>Catatan Diare</p>
                  <h2>{stats.diarrheaCount.toLocaleString('id-ID')}</h2>
                  <span className="metric-caption">catatan dengan status Ya</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon blue"><Icon name="home" /></span>
                    <span className="metric-change neutral">Wilayah</span>
                  </div>
                  <p>Jumlah Kecamatan</p>
                  <h2>{districtStats.length}</h2>
                  <span className="metric-caption">kecamatan dalam filter aktif</span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon amber"><Icon name="calendar" /></span>
                    <span className="metric-change neutral">Periode</span>
                  </div>
                  <p>Jumlah Bulan</p>
                  <h2>{trendData.length}</h2>
                  <span className="metric-caption">bulan dengan catatan pengukuran</span>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">DISTRIBUSI WILAYAH</p>
                      <h2>Jumlah catatan per kecamatan</h2>
                    </div>
                  </div>

                  <div className="bar-list">
                    {districtStats.map((item) => {
                      const maxCount = Math.max(
                        ...districtStats.map((district) => district.total),
                        1
                      )

                      return (
                        <div className="bar-row" key={item.name}>
                          <div className="bar-label">
                            <span>{item.name}</span>
                            <strong>{item.total.toLocaleString('id-ID')} catatan</strong>
                          </div>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{ width: `${(item.total / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">PETA PERSEBARAN</p>
                      <h2>Wilayah pengamatan</h2>
                    </div>
                  </div>

                  <div className="definition-list">
                    <p>
                      <strong>{districtStats.length} kecamatan</strong> memiliki
                      catatan dalam filter aktif.
                    </p>
                    <p>
                      Peta choropleth akan menampilkan perbedaan proporsi
                      kejadian diare antarwilayah.
                    </p>
                    <p>
                      <strong>Data batas wilayah belum tersedia.</strong>
                      Peta geografis memerlukan file GeoJSON atau shapefile
                      kecamatan Kabupaten Toba.
                    </p>
                  </div>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">TREN WAKTU</p>
                      <h2>Proporsi diare setiap bulan</h2>
                    </div>
                  </div>

                  {trendData.length > 0 ? (
                    <div className="bar-list">
                      {trendData.map((item) => (
                        <div className="bar-row" key={item.key}>
                          <div className="bar-label">
                            <span>{item.month} {item.key.slice(0, 4)}</span>
                            <strong>
                              {item.percent.toFixed(1)}% ({item.value}/{item.total})
                            </strong>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Belum ada data pengukuran pada periode ini.</p>
                  )}
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">RINGKASAN WAKTU</p>
                      <h2>Informasi pengukuran</h2>
                    </div>
                  </div>

                  <div className="summary-list">
                    <div>
                      <span>Periode terpilih</span>
                      <strong>{period}</strong>
                    </div>
                    <div>
                      <span>Pengukuran terbaru</span>
                      <strong>{periodLabel}</strong>
                    </div>
                    <div>
                      <span>Jumlah bulan tercatat</span>
                      <strong>{trendData.length} bulan</strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header">
                  <div>
                    <p className="panel-kicker">RINCIAN WILAYAH</p>
                    <h2>Ringkasan per kecamatan</h2>
                  </div>
                  <span className="table-count">{districtStats.length} kecamatan</span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Kecamatan</th>
                        <th>Total Catatan</th>
                        <th>Catatan Diare</th>
                        <th>Proporsi Diare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtStats.map((item) => (
                        <tr key={item.name}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.total.toLocaleString('id-ID')}</td>
                          <td>{item.diarrhea.toLocaleString('id-ID')}</td>
                          <td>{item.percent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeDashboardSection === 'Storytelling / Insight' && (
            <>
              <section className="metric-grid">
                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon coral"><Icon name="chart" /></span>
                    <span className="metric-change neutral">Ringkasan</span>
                  </div>
                  <p>Catatan dengan Gejala Diare</p>
                  <h2>{insightStats.diarrheaCount.toLocaleString('id-ID')}</h2>
                  <span className="metric-caption">
                    {insightStats.diarrheaPercent.toFixed(1)}% dari catatan terfilter
                  </span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon blue"><Icon name="home" /></span>
                    <span className="metric-change neutral">Wilayah</span>
                  </div>
                  <p>Kecamatan dengan Proporsi Tertinggi</p>
                  <h2>{insightStats.highestDistrict?.name || '-'}</h2>
                  <span className="metric-caption">
                    {insightStats.highestDistrict
                      ? `${insightStats.highestDistrict.percent.toFixed(1)}% proporsi diare`
                      : 'Belum ada data'}
                  </span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon amber"><Icon name="calendar" /></span>
                    <span className="metric-change neutral">Waktu</span>
                  </div>
                  <p>Bulan dengan Proporsi Tertinggi</p>
                  <h2>
                    {insightStats.highestMonth
                      ? `${insightStats.highestMonth.month} ${insightStats.highestMonth.key.slice(0, 4)}`
                      : '-'}
                  </h2>
                  <span className="metric-caption">
                    {insightStats.highestMonth
                      ? `${insightStats.highestMonth.percent.toFixed(1)}% proporsi diare`
                      : 'Belum ada data'}
                  </span>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-icon mint"><Icon name="users" /></span>
                    <span className="metric-change neutral">Kelompok usia</span>
                  </div>
                  <p>Kelompok Usia dengan Catatan Diare Terbanyak</p>
                  <h2>{insightStats.highestAgeGroup?.[0] || '-'}</h2>
                  <span className="metric-caption">
                    {insightStats.highestAgeGroup
                      ? `${insightStats.highestAgeGroup[1]} catatan`
                      : 'Belum ada data'}
                  </span>
                </article>
              </section>

              <section className="visual-grid">
                <article className="panel age-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">RINGKASAN TEMUAN</p>
                      <h2>Apa yang terlihat dari data?</h2>
                    </div>
                  </div>

                  <div className="definition-list">
                    <p>
                      Dari <strong>{outcomeRecords.length.toLocaleString('id-ID')} catatan dengan status diketahui</strong>
                      {' '}yang memenuhi filter, terdapat{' '}
                      <strong>{insightStats.diarrheaCount.toLocaleString('id-ID')} catatan</strong>
                      {' '}dengan gejala diare dalam 14 hari terakhir.
                    </p>
                    <p>
                      Proporsi catatan dengan gejala diare pada data terfilter
                      adalah <strong>{insightStats.diarrheaPercent.toFixed(1)}%</strong>.
                    </p>
                    <p>
                      Kelompok usia dengan jumlah catatan diare terbanyak adalah{' '}
                      <strong>{insightStats.highestAgeGroup?.[0] || 'belum dapat ditentukan'}</strong>.
                    </p>
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">ARAH ANALISIS</p>
                      <h2>Hal yang perlu diperhatikan</h2>
                    </div>
                  </div>

                  <div className="definition-list">
                    <p>
                      Periksa kembali jumlah catatan pada setiap kecamatan
                      sebelum membandingkan proporsi diare.
                    </p>
                    <p>
                      Perhatikan jumlah pengamatan setiap bulan karena jumlah
                      catatan yang berbeda dapat memengaruhi proporsi.
                    </p>
                    <p>
                      Temuan ini merupakan gambaran deskriptif, bukan bukti
                      bahwa suatu faktor menyebabkan diare.
                    </p>
                  </div>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-header table-header">
                  <div>
                    <p className="panel-kicker">RINCIAN PROPORSI</p>
                    <h2>Proporsi diare per kecamatan</h2>
                  </div>
                  <span className="table-count">{districtStats.length} kecamatan</span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Kecamatan</th>
                        <th>Total Catatan</th>
                        <th>Catatan Diare</th>
                        <th>Proporsi Diare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtStats.map((item) => (
                        <tr key={item.name}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.total.toLocaleString('id-ID')}</td>
                          <td>{item.diarrhea.toLocaleString('id-ID')}</td>
                          <td>{item.percent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <p className="data-note">
                Insight dihitung dari catatan yang sedang difilter. Hasil bersifat
                deskriptif dan tidak menunjukkan hubungan sebab-akibat.
              </p>
            </>
          )}

          

{activeDashboardSection === 'Modul Klasifikasi' && (
  <section className="panel classification-page">
    <div className="panel-header">
      <div>
        <p className="panel-kicker">MODUL KLASIFIKASI</p>
        <h2>Klasifikasi Status Diare Balita</h2>
        <p>
          Masukkan karakteristik balita, faktor gizi,
          serta kondisi sanitasi dan kesehatan keluarga.
        </p>
      </div>
    </div>

    {/* 1. Profil Balita */}
    <div className="classification-section">
      <div className="classification-heading">
        <span className="classification-number">01</span>
        <div>
          <p className="panel-kicker">IDENTITAS DAN KARAKTERISTIK</p>
          <h3>Profil Balita</h3>
        </div>
      </div>

      <div className="classification-grid">
        <div>
          <label htmlFor="usia-balita">Umur (bulan)</label>
          <input id="usia-balita" type="number"
            min="0" max="59" placeholder="Contoh: 24" />
        </div>

        <div>
          <label htmlFor="jenis-kelamin">Jenis Kelamin</label>
          <select id="jenis-kelamin" defaultValue="">
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label htmlFor="berat-badan">BB (kg)</label>
          <input id="berat-badan" type="number"
            min="0" step="0.1" placeholder="Contoh: 12.5" />
        </div>

        <div>
          <label htmlFor="tinggi-badan">Panjang/Tinggi Badan (cm)</label>
          <input id="tinggi-badan" type="number"
            min="0" step="0.1" placeholder="Contoh: 85" />
        </div>

        <div>
          <label htmlFor="hb-ibu">HB Ibu (g/dL)</label>
          <input id="hb-ibu" type="number"
            min="0" step="0.1" placeholder="Contoh: 12.0" />
        </div>
      </div>
    </div>

    {/* 2. Faktor Gizi */}
    <div className="classification-section">
      <div className="classification-heading">
        <span className="classification-number">02</span>
        <div>
          <p className="panel-kicker">ASUPAN DAN NUTRISI</p>
          <h3>Faktor Gizi dan Asupan Makanan</h3>
        </div>
      </div>

      <div className="classification-grid">
        <div>
          <label htmlFor="asi">Mendapat ASI</label>
          <select id="asi" defaultValue="">
            <option value="" disabled>Pilih jawaban</option>
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>

        <div>
          <label htmlFor="jenis-makanan">
            Jenis Makanan dalam 24 Jam Terakhir
          </label>
          <input id="jenis-makanan" type="text"
            placeholder="Masukkan jenis makanan" />
        </div>

        <div>
          <label htmlFor="frekuensi-makan">
            Frekuensi Makan dalam 24 Jam Terakhir
          </label>
          <input id="frekuensi-makan" type="number"
            min="0" placeholder="Contoh: 3" />
        </div>
      </div>
    </div>

    {/* 3. Sanitasi dan Kesehatan Keluarga */}
    <div className="classification-section">
      <div className="classification-heading">
        <span className="classification-number">03</span>
        <div>
          <p className="panel-kicker">LINGKUNGAN DAN KEBERSIHAN</p>
          <h3>Sanitasi dan Kesehatan Keluarga</h3>
        </div>
      </div>

      <div className="classification-grid">
        <div>
          <label htmlFor="sumber-air">Sumber Air</label>
          <input id="sumber-air" type="text"
            placeholder="Masukkan sumber air" />
        </div>

        <div>
          <label htmlFor="air-dimasak">Pengelolaan Air (Dimasak)</label>
          <select id="air-dimasak" defaultValue="">
            <option value="" disabled>Pilih jawaban</option>
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>

        <div>
          <label htmlFor="cuci-tangan">Cuci Tangan</label>
          <select id="cuci-tangan" defaultValue="">
            <option value="" disabled>Pilih jawaban</option>
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>

        <div>
          <label htmlFor="rotavirus">Imunisasi Rotavirus</label>
          <input id="rotavirus" type="text"
            placeholder="Masukkan status imunisasi" />
        </div>
      </div>
    </div>

    {/* 4. Indikator Pencernaan */}
    <div className="classification-section">
      <div className="classification-heading">
        <span className="classification-number">04</span>
        <div>
          <p className="panel-kicker">INDIKATOR KESEHATAN</p>
          <h3>Indikator Pencernaan</h3>
        </div>
      </div>

      <div className="classification-grid">
        <div>
          <label htmlFor="frekuensi-bab">Frekuensi BAB 24 Jam</label>
          <input id="frekuensi-bab" type="number"
            min="0" placeholder="Contoh: 4" />
        </div>

        <div>
          <label htmlFor="bentuk-feses">Bentuk Feses</label>
          <input id="bentuk-feses" type="text"
            placeholder="Masukkan bentuk feses" />
        </div>
      </div>
    </div>

    {/* 5. Wilayah dan Waktu */}
    <div className="classification-section">
      <div className="classification-heading">
        <span className="classification-number">05</span>
        <div>
          <p className="panel-kicker">LOKASI DAN PERIODE</p>
          <h3>Informasi Wilayah dan Pengukuran</h3>
        </div>
      </div>

      <div className="classification-grid">
        <div>
          <label htmlFor="kecamatan">Kecamatan</label>
          <input id="kecamatan" type="text"
            placeholder="Masukkan kecamatan" />
        </div>

        <div>
          <label htmlFor="kabupaten">Kabupaten</label>
          <input id="kabupaten" type="text"
            placeholder="Masukkan kabupaten" />
        </div>

        <div>
          <label htmlFor="bulan-pengukuran">
            Bulan Pengukuran Terakhir
          </label>
          <input id="bulan-pengukuran" type="text"
            placeholder="Contoh: Januari 2026" />
        </div>
      </div>
    </div>

    {/* Hasil Klasifikasi */}
    <div className="classification-result">
      <div className="classification-heading">
        <span className="classification-number">06</span>
        <div>
          <p className="panel-kicker">OUTPUT ANALISIS</p>
          <h3>Hasil Klasifikasi</h3>
        </div>
      </div>

      <div className="classification-result-content">
        <div className="classification-status">
          <span className="status-indicator"></span>
          <strong>Model belum terhubung</strong>
        </div>
        <p>
          Hasil klasifikasi akan ditampilkan setelah model
          machine learning selesai dibangun, diuji, dan
          diintegrasikan dengan dashboard.
        </p>
        <button type="button" disabled>
          Klasifikasikan Data
        </button>
      </div>
    </div>

    {/* Catatan */}
    <div className="classification-disclaimer">
      <strong>Catatan penggunaan</strong>
      <p>
        Hasil klasifikasi merupakan keluaran model analisis
        data dan bukan pengganti diagnosis medis oleh
        tenaga kesehatan.
      </p>
    </div>
  </section>
)}

         

{activeDashboardSection === 'Evaluasi Model' && (
  <section className="panel evaluation-page">
    <div className="panel-header">
      <div>
        <p className="panel-kicker">MODEL EVALUATION</p>
        <h2>Evaluasi Model</h2>
        <p>
          Evaluasi performa model dalam mengklasifikasikan
          status diare akut pada balita.
        </p>
      </div>
    </div>

    {/* Status Pengembangan */}
    <div className="evaluation-status-card">
      <div className="evaluation-status-top">
        <div>
          <p className="panel-kicker">STATUS PENGEMBANGAN</p>
          <h3>Status Model</h3>
        </div>
        <span className="evaluation-status-badge">
          Belum dievaluasi
        </span>
      </div>

      <p>
        Model masih dalam tahap pengembangan. Hasil evaluasi
        akan ditampilkan setelah preprocessing, pelatihan,
        dan pengujian menggunakan data uji selesai dilakukan.
      </p>

      <div className="evaluation-progress">
        <span></span>
      </div>
      <small>Evaluasi menunggu hasil pengujian model</small>
    </div>

    {/* Metrik Evaluasi */}
    <div className="evaluation-section">
      <div className="evaluation-heading">
        <div>
          <p className="panel-kicker">PERFORMA KLASIFIKASI</p>
          <h3>1. Metrik Evaluasi</h3>
        </div>
        <span className="evaluation-muted-label">4 metrik</span>
      </div>

      <div className="evaluation-metrics-grid">
        <div className="evaluation-metric-card">
          <span>Accuracy</span>
          <strong>—</strong>
          <small>Ketepatan prediksi keseluruhan</small>
        </div>
        <div className="evaluation-metric-card">
          <span>Precision</span>
          <strong>—</strong>
          <small>Ketepatan prediksi kelas positif</small>
        </div>
        <div className="evaluation-metric-card">
          <span>Recall</span>
          <strong>—</strong>
          <small>Kemampuan menemukan kelas positif</small>
        </div>
        <div className="evaluation-metric-card">
          <span>F1-Score</span>
          <strong>—</strong>
          <small>Keseimbangan precision dan recall</small>
        </div>
      </div>
    </div>

    {/* Confusion Matrix */}
    <div className="evaluation-section">
      <div className="evaluation-heading">
        <div>
          <p className="panel-kicker">HASIL PREDIKSI</p>
          <h3>2. Confusion Matrix</h3>
        </div>
      </div>

      <p className="evaluation-description">
        Confusion Matrix digunakan untuk membandingkan
        hasil prediksi model dengan status sebenarnya.
      </p>

      <div className="evaluation-table-wrap">
        <table className="evaluation-matrix">
          <thead>
            <tr>
              <th rowSpan="2">Aktual</th>
              <th colSpan="2">Hasil Prediksi</th>
            </tr>
            <tr>
              <th>Positif</th>
              <th>Negatif</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Positif</th>
              <td>
                <strong>TP</strong>
                <span>—</span>
              </td>
              <td>
                <strong>FN</strong>
                <span>—</span>
              </td>
            </tr>
            <tr>
              <th>Negatif</th>
              <td>
                <strong>FP</strong>
                <span>—</span>
              </td>
              <td>
                <strong>TN</strong>
                <span>—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="evaluation-footnote">
        TP: positif diprediksi positif. TN: negatif diprediksi
        negatif. FP: negatif diprediksi positif. FN: positif
        diprediksi negatif.
      </p>
    </div>

    {/* Perbandingan Algoritma */}
    <div className="evaluation-section">
      <div className="evaluation-heading">
        <div>
          <p className="panel-kicker">PERBANDINGAN PERFORMA</p>
          <h3>3. Perbandingan Algoritma</h3>
        </div>
      </div>

      <p className="evaluation-description">
        Perbandingan dilakukan untuk menentukan algoritma
        yang memberikan performa terbaik pada data uji.
      </p>

      <div className="evaluation-table-wrap">
        <table className="evaluation-comparison">
          <thead>
            <tr>
              <th>Algoritma</th>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1-Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Decision Tree</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
              <td><span className="evaluation-pending">Belum diuji</span></td>
            </tr>
            <tr>
              <td>Random Forest</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
              <td><span className="evaluation-pending">Belum diuji</span></td>
            </tr>
            <tr>
              <td>Logistic Regression</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
              <td><span className="evaluation-pending">Belum diuji</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Kesimpulan */}
    <div className="evaluation-conclusion">
      <div>
        <p className="panel-kicker">RINGKASAN HASIL</p>
        <h3>4. Kesimpulan Evaluasi</h3>
      </div>
      <p>
        Algoritma terbaik belum dapat ditentukan karena
        proses pengujian belum dilakukan. Penentuan model
        nantinya mempertimbangkan accuracy, precision,
        recall, F1-Score, dan kesesuaian hasil prediksi.
      </p>
    </div>

    {/* Catatan */}
    <div className="evaluation-disclaimer">
      <strong>Catatan evaluasi</strong>
      <p>
        Nilai evaluasi harus berasal dari pengujian menggunakan
        data yang tidak digunakan saat pelatihan. Jika dataset
        masih berupa data dummy atau simulasi, hasilnya tidak
        dapat dianggap sebagai ukuran performa pada kondisi
        nyata.
      </p>
    </div>
  </section>
)}
 

{activeDashboardSection === 'Tentang Data' && (
  <section className="panel data-page">
    <div className="panel-header">
      <div>
        <p className="panel-kicker">INFORMASI DATASET</p>
        <h2>Tentang Data</h2>
        <p>
          Informasi mengenai dataset yang digunakan
          dalam analisis risiko kejadian diare akut pada balita.
        </p>
      </div>
    </div>

    {/* Ringkasan Dataset */}
    <div className="data-section">
      <div className="data-section-heading">
        <div>
          <p className="panel-kicker">GAMBARAN UMUM</p>
          <h3>Ringkasan Dataset</h3>
        </div>
      </div>

      <div className="data-summary-grid">
        <div className="data-stat-card">
          <span>Jumlah catatan terfilter</span>
          <strong>{stats.count.toLocaleString('id-ID')}</strong>
          <small>Catatan dataset</small>
        </div>
        <div className="data-stat-card">
          <span>Jumlah ID balita unik</span>
          <strong>{stats.uniqueBalita.toLocaleString('id-ID')}</strong>
          <small>Balita teridentifikasi</small>
        </div>
        <div className="data-stat-card">
          <span>Wilayah terpilih</span>
          <strong>{district}</strong>
          <small>Filter wilayah</small>
        </div>
        <div className="data-stat-card">
          <span>Periode terpilih</span>
          <strong>{period}</strong>
          <small>Rentang pengamatan</small>
        </div>
        <div className="data-stat-card">
          <span>Pengukuran terbaru</span>
          <strong>{periodLabel}</strong>
          <small>Tanggal pengukuran</small>
        </div>
      </div>
    </div>

    {/* Deskripsi Dataset */}
    <div className="data-info-card">
      <div className="data-info-heading">
        <span className="data-icon">01</span>
        <div>
          <p className="panel-kicker">PENJELASAN</p>
          <h3>Deskripsi Dataset</h3>
        </div>
      </div>
      <p>
        Dataset ini digunakan untuk menganalisis risiko
        kejadian diare akut pada balita berdasarkan
        indikator kesehatan balita, faktor gizi,
        sanitasi lingkungan, dan kesehatan keluarga.
      </p>
      <p>
        Data diolah untuk menghasilkan visualisasi,
        menemukan pola, serta menjadi dasar pengembangan
        model klasifikasi status diare pada balita.
      </p>
    </div>

    {/* Kategori Variabel */}
    <div className="data-section">
      <div className="data-section-heading">
        <div>
          <p className="panel-kicker">STRUKTUR DATA</p>
          <h3>Kategori Variabel</h3>
        </div>
        <span className="data-section-note">Kelompok indikator</span>
      </div>

      <div className="data-category-grid">
        <div className="data-category-card">
          <span>01</span>
          <h4>Profil Balita</h4>
          <p>Usia dan jenis kelamin balita.</p>
        </div>
        <div className="data-category-card">
          <span>02</span>
          <h4>Faktor Gizi</h4>
          <p>Indikator status gizi dan kondisi berat badan.</p>
        </div>
        <div className="data-category-card">
          <span>03</span>
          <h4>Kesehatan Balita</h4>
          <p>Gejala diare, demam, muntah, dan indikator kesehatan lainnya.</p>
        </div>
        <div className="data-category-card">
          <span>04</span>
          <h4>Sanitasi Lingkungan</h4>
          <p>Sumber air dan praktik pengelolaan air serta kebersihan lingkungan.</p>
        </div>
        <div className="data-category-card">
          <span>05</span>
          <h4>Kesehatan Keluarga</h4>
          <p>Kebiasaan mencuci tangan dan praktik kebersihan keluarga.</p>
        </div>
      </div>
    </div>

    {/* Kualitas Data */}
    <div className="data-info-card">
      <div className="data-info-heading">
        <span className="data-icon">02</span>
        <div>
          <p className="panel-kicker">PEMERIKSAAN DATA</p>
          <h3>Kualitas dan Pengolahan Data</h3>
        </div>
      </div>
      <p>
        Data perlu melalui tahapan pemeriksaan sebelum
        digunakan dalam analisis, meliputi pemeriksaan
        data kosong, data duplikat, konsistensi format,
        dan kesesuaian nilai setiap variabel.
      </p>
      <p>
        Tahapan preprocessing dilakukan untuk membantu
        memastikan data siap digunakan dalam proses
        visualisasi dan pengembangan model klasifikasi.
      </p>
    </div>

    {/* Sumber Data */}
    <div className="data-source-card">
      <div className="data-info-heading">
        <span className="data-icon">03</span>
        <div>
          <p className="panel-kicker">CATATAN DATASET</p>
          <h3>Sumber dan Keterangan Data</h3>
        </div>
      </div>
      <p>
        Dataset yang digunakan masih dalam tahap
        pengembangan. Sebagian data masih berupa data
        dummy atau simulasi untuk membantu pengembangan
        dan pengujian dashboard.
      </p>
      <p>
        Oleh karena itu, hasil visualisasi dan analisis
        sementara belum dapat dianggap sebagai gambaran
        kondisi kejadian diare yang sebenarnya di
        Kabupaten Toba.
      </p>
    </div>
  </section>
)}
        </div>
      </main>
    </div>
  )
}

export default App
