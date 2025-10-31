import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { getRouteName } from '../utils/routeMapping'

type Props = {
  title: string
  data: Record<string, any>[]
  loading: boolean
  chartType?: 'bar' | 'area' | 'pie' | 'horizontalBar'
  isDark?: boolean
}

const COLORS = ['#7c3aed', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          border: isDark ? '1px solid #475569' : '1px solid #cbd5e1',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        {label && (
          <p style={{ color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: 600, marginBottom: '4px' }}>
            {label}
          </p>
        )}
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: isDark ? '#cbd5e1' : '#475569', margin: 0 }}>
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <strong style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{entry.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ChartPanel({ title, data, loading, chartType = 'bar', isDark = true }: Props){
  const byCompletion = useMemo(() => {
    if (!data || data.length === 0) return []
    const counts: Record<string, number> = {}
    data.forEach(r => {
      const key = String(r.booking_complete ?? '0')
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts).map(([k,v]) => ({ name: k === '1' ? 'Complete' : 'Incomplete', value: v }))
  }, [data])

  const byTripType = useMemo(() => {
    if (!data || data.length === 0) return []
    const counts: Record<string, number> = {}
    data.forEach(r => {
      const type = r.trip_type || 'Unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [data])

  const topRoutes = useMemo(() => {
    if (!data || data.length === 0) return []
    const counts: Record<string, number> = {}
    data.forEach(r => {
      const route = r.route || 'Unknown'
      counts[route] = (counts[route] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([route, count]) => ({ route: getRouteName(route), count }))
  }, [data])

  const avgLeadByRoute = useMemo(() => {
    if (!data || data.length === 0) return []
    const sums: Record<string, {sum:number, c:number}> = {}
    data.forEach(r => {
      const route = r.route || 'Unknown'
      const val = Number(r.purchase_lead) || 0
      sums[route] = sums[route] || { sum: 0, c: 0 }
      sums[route].sum += val
      sums[route].c += 1
    })
    return Object.entries(sums).slice(0,12).map(([route, obj]) => ({ route: getRouteName(route), avg: +(obj.sum/obj.c).toFixed(1) }))
  }, [data])

  const bgClass = isDark ? 'bg-white/4 border-white/6' : 'bg-white/90 border-slate-200'
  const textColor = isDark ? '#cbd5e1' : '#475569'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipTextColor = isDark ? '#f1f5f9' : '#0f172a'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className={`p-6 rounded-xl border shadow-lg transition-colors duration-500 ${bgClass}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div style={{ width: '100%', height: 300 }}>
        {loading ? (
          <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>Loading...</div>
        ) : chartType === 'bar' ? (
          <ResponsiveContainer>
            <BarChart data={byCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} />
              <YAxis stroke={textColor} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Bar dataKey="value" fill="url(#g1)" />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : chartType === 'pie' ? (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={byTripType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {byTripType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : chartType === 'horizontalBar' ? (
          <ResponsiveContainer>
            <BarChart data={topRoutes} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" stroke={textColor} />
              <YAxis 
                type="category" 
                dataKey="route" 
                stroke={textColor} 
                width={220} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Bar dataKey="count" fill="url(#g2)" />
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={avgLeadByRoute}>
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="route" stroke={textColor} />
              <YAxis stroke={textColor} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Area type="monotone" dataKey="avg" stroke="#06b6d4" fillOpacity={1} fill="url(#areaG)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  )
}
