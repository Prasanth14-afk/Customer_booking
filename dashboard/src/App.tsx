import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import ChartPanel from './components/ChartPanel'
import Filters from './components/Filters'
import StatCard from './components/StatCard'
import ThemeToggle from './components/ThemeToggle'
import ExportButton from './components/ExportButton'
import RouteMap from './components/RouteMap'
import Globe3D from './components/Globe3D'
import Papa from 'papaparse'
import { getRouteName } from './utils/routeMapping'

type Row = Record<string, string>

export default function App() {
  const [data, setData] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedTripType, setSelectedTripType] = useState('')
  const [isDark, setIsDark] = useState(true)
  const [showGlobe3D, setShowGlobe3D] = useState(false)

  useEffect(() => {
    fetch('/data/customer_booking.csv')
      .then(r => r.text())
      .then(csvText => {
        const parsed = Papa.parse<Row>(csvText, { header: true, dynamicTyping: false })
        setData(parsed.data.filter(Boolean))
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setIsDark(saved === 'dark')
  }, [])

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const routes = useMemo(() => {
    const unique = new Set(data.map(r => r.route).filter(Boolean))
    return Array.from(unique).sort()
  }, [data])

  const tripTypes = useMemo(() => {
    const unique = new Set(data.map(r => r.trip_type).filter(Boolean))
    return Array.from(unique).sort()
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (selectedRoute && row.route !== selectedRoute) return false
      if (selectedTripType && row.trip_type !== selectedTripType) return false
      return true
    })
  }, [data, selectedRoute, selectedTripType])

  const stats = useMemo(() => {
    const completed = filteredData.filter(r => r.booking_complete === '1').length
    const total = filteredData.length
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
    const avgPassengers = total > 0 ? (filteredData.reduce((sum, r) => sum + Number(r.num_passengers || 0), 0) / total).toFixed(1) : '0'
    const uniqueRoutes = new Set(filteredData.map(r => r.route)).size

    return { total, completed, completionRate, avgPassengers, uniqueRoutes }
  }, [filteredData])

  const handleExport = () => {
    const csvContent = Papa.unparse(filteredData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `customer_bookings_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const themeClasses = isDark
    ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-slate-50'
    : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 text-slate-900'

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses}`}>
      <Header isDark={isDark}>
        <div className="flex items-center gap-3">
          <ExportButton onExport={handleExport} />
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </div>
      </Header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Filters
          routes={routes}
          selectedRoute={selectedRoute}
          onRouteChange={setSelectedRoute}
          tripTypes={tripTypes}
          selectedTripType={selectedTripType}
          onTripTypeChange={setSelectedTripType}
          isDark={isDark}
        />

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <StatCard
            title="Total Bookings"
            value={stats.total.toLocaleString()}
            subtitle={`${stats.completed} completed`}
            gradient="from-indigo-500 to-purple-500"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle="Success metric"
            gradient="from-emerald-500 to-teal-500"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Avg Passengers"
            value={stats.avgPassengers}
            subtitle="Per booking"
            gradient="from-pink-500 to-rose-500"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard
            title="Active Routes"
            value={stats.uniqueRoutes}
            subtitle="Unique destinations"
            gradient="from-cyan-500 to-blue-500"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            }
          />
        </motion.section>

        <section className="mb-6">
          <div className="flex justify-end mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGlobe3D(!showGlobe3D)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-600/50'
              }`}
            >
              {showGlobe3D ? '🗺️ Switch to 2D Map' : '🌍 Switch to 3D Globe'}
            </motion.button>
          </div>
          
          {showGlobe3D ? (
            <Globe3D data={filteredData} isDark={isDark} />
          ) : (
            <RouteMap data={filteredData} isDark={isDark} />
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartPanel title="Bookings by Completion" data={filteredData} loading={loading} chartType="bar" isDark={isDark} />
          <ChartPanel title="Trip Type Distribution" data={filteredData} loading={loading} chartType="pie" isDark={isDark} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartPanel title="Top Routes by Volume" data={filteredData} loading={loading} chartType="horizontalBar" isDark={isDark} />
          <ChartPanel title="Avg Purchase Lead by Route" data={filteredData} loading={loading} chartType="area" isDark={isDark} />
        </section>

      </main>
    </div>
  )
}
