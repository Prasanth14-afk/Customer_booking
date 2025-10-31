import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps'
import { getRouteName } from '../utils/routeMapping'

type Props = {
  data: Record<string, any>[]
  isDark: boolean
}

// Airport coordinates (approximate)
const airportCoordinates: Record<string, { lat: number; lng: number; city: string }> = {
  AKL: { lat: -37.0082, lng: 174.7850, city: 'Auckland' },
  DEL: { lat: 28.5562, lng: 77.1000, city: 'Delhi' },
  HGH: { lat: 30.2294, lng: 120.4342, city: 'Hangzhou' },
  HND: { lat: 35.5494, lng: 139.7798, city: 'Tokyo' },
  ICN: { lat: 37.4602, lng: 126.4407, city: 'Seoul' },
  KIX: { lat: 34.4273, lng: 135.2440, city: 'Osaka' },
  KTM: { lat: 27.6966, lng: 85.3591, city: 'Kathmandu' },
  KUL: { lat: 2.7456, lng: 101.7072, city: 'Kuala Lumpur' },
  MEL: { lat: -37.6690, lng: 144.8410, city: 'Melbourne' },
  MNL: { lat: 14.5086, lng: 121.0194, city: 'Manila' },
  NRT: { lat: 35.7720, lng: 140.3929, city: 'Tokyo Narita' },
  PEK: { lat: 40.0799, lng: 116.6031, city: 'Beijing' },
  PVG: { lat: 31.1443, lng: 121.8083, city: 'Shanghai' },
  SGN: { lat: 10.8231, lng: 106.6297, city: 'Ho Chi Minh' },
  SIN: { lat: 1.3644, lng: 103.9915, city: 'Singapore' },
  SYD: { lat: -33.9399, lng: 151.1753, city: 'Sydney' },
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function RouteMap({ data, isDark }: Props) {
  const routeCounts = useMemo(() => {
    if (!data || data.length === 0) return []
    const counts: Record<string, number> = {}
    data.forEach(r => {
      const route = r.route || 'Unknown'
      counts[route] = (counts[route] || 0) + 1
    })
    
    return Object.entries(counts)
      .map(([route, count]) => {
        const origin = route.substring(0, 3)
        const dest = route.substring(3, 6)
        
        if (airportCoordinates[origin] && airportCoordinates[dest]) {
          return {
            route,
            origin,
            dest,
            count,
            originCoords: airportCoordinates[origin],
            destCoords: airportCoordinates[dest]
          }
        }
        return null
      })
      .filter(Boolean) as any[]
  }, [data])

  const maxCount = Math.max(...routeCounts.map(r => r.count), 1)
  const bgClass = isDark ? 'bg-white/4 border-white/6' : 'bg-white/90 border-slate-200'

  // Get unique airports
  const uniqueAirports = useMemo(() => {
    const airports = new Map()
    routeCounts.forEach(r => {
      airports.set(r.origin, r.originCoords)
      airports.set(r.dest, r.destCoords)
    })
    return Array.from(airports.entries()).map(([code, coords]) => ({ code, coords }))
  }, [routeCounts])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`p-6 rounded-xl border shadow-lg transition-colors duration-500 ${bgClass}`}
    >
      <h3 className="text-lg font-semibold mb-4">Global Flight Routes Network</h3>
      
      <div className="w-full rounded-lg overflow-hidden" style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
      }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 180,
            center: [100, 0]
          }}
          width={800}
          height={450}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: any) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isDark ? '#334155' : '#cbd5e1'}
                  stroke={isDark ? '#1e293b' : '#94a3b8'}
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: isDark ? '#475569' : '#a5b4fc' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Draw routes as lines */}
          {routeCounts.map((route, idx) => {
            const opacity = 0.4 + (route.count / maxCount) * 0.6
            const strokeWidth = 1.5 + (route.count / maxCount) * 3

            return (
              <Line
                key={idx}
                from={[route.originCoords.lng, route.originCoords.lat]}
                to={[route.destCoords.lng, route.destCoords.lat]}
                stroke={isDark ? '#06b6d4' : '#0ea5e9'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeOpacity={opacity}
              />
            )
          })}

          {/* Draw airport markers */}
          {uniqueAirports.map(({ code, coords }, idx) => (
            <Marker key={code} coordinates={[coords.lng, coords.lat]}>
              <g>
                <circle
                  r={5}
                  fill={isDark ? '#8b5cf6' : '#7c3aed'}
                  stroke={isDark ? '#c4b5fd' : '#ffffff'}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{`${code} - ${coords.city}`}</title>
                </circle>
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{
                    fontFamily: 'system-ui',
                    fontSize: '10px',
                    fontWeight: 600,
                    fill: isDark ? '#e2e8f0' : '#475569',
                    pointerEvents: 'none'
                  }}
                >
                  {code}
                </text>
              </g>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-purple-500' : 'bg-purple-600'}`}></div>
          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Airports</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-cyan-500"></div>
          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Routes (thickness = volume)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Routes: {routeCounts.length}</span>
        </div>
      </div>
    </motion.div>
  )
}
