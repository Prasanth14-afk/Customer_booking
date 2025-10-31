import React from 'react'
import { motion } from 'framer-motion'
import { getRouteName } from '../utils/routeMapping'

type Props = {
  routes: string[]
  selectedRoute: string
  onRouteChange: (route: string) => void
  tripTypes: string[]
  selectedTripType: string
  onTripTypeChange: (type: string) => void
  isDark?: boolean
}

export default function Filters({ routes, selectedRoute, onRouteChange, tripTypes, selectedTripType, onTripTypeChange, isDark = true }: Props) {
  const bgClass = isDark ? 'bg-white/5 border-white/10' : 'bg-white/90 border-slate-200'
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-700'
  const selectBg = isDark ? 'bg-slate-800/50 border-white/10 text-slate-100' : 'bg-white border-slate-300 text-slate-900'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-4 rounded-xl border backdrop-blur-sm mb-6 transition-colors duration-500 ${bgClass}`}
    >
      <h3 className={`text-sm font-semibold mb-3 ${labelColor}`}>Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`text-xs mb-2 block ${labelColor}`}>Route</label>
          <select
            value={selectedRoute}
            onChange={(e) => onRouteChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${selectBg}`}
          >
            <option value="">All Routes</option>
            {routes.map(r => (
              <option key={r} value={r}>{getRouteName(r)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`text-xs mb-2 block ${labelColor}`}>Trip Type</label>
          <select
            value={selectedTripType}
            onChange={(e) => onTripTypeChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${selectBg}`}
          >
            <option value="">All Types</option>
            {tripTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  )
}
