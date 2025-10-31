import React, { useMemo, useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Globe from 'react-globe.gl'

type Props = {
  data: Record<string, any>[]
  isDark: boolean
}

// Airport coordinates
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

export default function Globe3D({ data, isDark }: Props) {
  const globeEl = useRef<any>()
  const [globeReady, setGlobeReady] = useState(false)

  const { arcsData, placesData } = useMemo(() => {
    if (!data || data.length === 0) return { arcsData: [], placesData: [] }
    
    const counts: Record<string, number> = {}
    data.forEach(r => {
      const route = r.route || 'Unknown'
      counts[route] = (counts[route] || 0) + 1
    })
    
    const arcs = Object.entries(counts)
      .map(([route, count]) => {
        const origin = route.substring(0, 3)
        const dest = route.substring(3, 6)
        
        if (airportCoordinates[origin] && airportCoordinates[dest]) {
          return {
            startLat: airportCoordinates[origin].lat,
            startLng: airportCoordinates[origin].lng,
            endLat: airportCoordinates[dest].lat,
            endLng: airportCoordinates[dest].lng,
            count,
            route
          }
        }
        return null
      })
      .filter(Boolean) as any[]

    // Get unique airports
    const airportsMap = new Map()
    arcs.forEach(arc => {
      const origin = arc.route.substring(0, 3)
      const dest = arc.route.substring(3, 6)
      if (!airportsMap.has(origin)) {
        airportsMap.set(origin, {
          lat: arc.startLat,
          lng: arc.startLng,
          name: `${origin} - ${airportCoordinates[origin].city}`,
          code: origin
        })
      }
      if (!airportsMap.has(dest)) {
        airportsMap.set(dest, {
          lat: arc.endLat,
          lng: arc.endLng,
          name: `${dest} - ${airportCoordinates[dest].city}`,
          code: dest
        })
      }
    })

    return {
      arcsData: arcs,
      placesData: Array.from(airportsMap.values())
    }
  }, [data])

  const maxCount = Math.max(...arcsData.map(a => a.count), 1)

  useEffect(() => {
    if (globeEl.current && !globeReady) {
      // Auto-rotate
      globeEl.current.controls().autoRotate = true
      globeEl.current.controls().autoRotateSpeed = 0.5
      
      // Set initial view
      globeEl.current.pointOfView({ lat: 0, lng: 100, altitude: 2.5 }, 0)
      
      setGlobeReady(true)
    }
  }, [globeReady])

  const bgClass = isDark ? 'bg-white/4 border-white/6' : 'bg-white/90 border-slate-200'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`p-6 rounded-xl border shadow-lg transition-colors duration-500 ${bgClass}`}
    >
      <h3 className="text-lg font-semibold mb-4">🌍 3D Digital Twin Globe - Real-time Flight Network</h3>
      
      <div className="w-full flex justify-center items-center rounded-lg overflow-hidden" style={{
        background: isDark 
          ? 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' 
          : 'radial-gradient(circle at 50% 50%, #dbeafe 0%, #93c5fd 100%)',
        minHeight: '700px'
      }}>
        <Globe
          ref={globeEl}
          width={window.innerWidth > 1400 ? 1200 : window.innerWidth > 1024 ? 1000 : 800}
          height={700}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl={isDark 
            ? "//unpkg.com/three-globe/example/img/night-sky.png"
            : "//unpkg.com/three-globe/example/img/night-sky.png"
          }
          
          // Arcs (flight routes)
          arcsData={arcsData}
          arcColor={() => isDark ? '#06b6d4' : '#0ea5e9'}
          arcStroke={(d: any) => 0.5 + (d.count / maxCount) * 2}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={3000}
          arcAltitude={(d: any) => 0.1 + (d.count / maxCount) * 0.3}
          arcLabel={(d: any) => `${d.route}: ${d.count} bookings`}
          
          // Points (airports)
          pointsData={placesData}
          pointAltitude={0.01}
          pointRadius={0.4}
          pointColor={() => isDark ? '#8b5cf6' : '#7c3aed'}
          pointLabel={(d: any) => d.name}
          pointResolution={12}
          
          // Atmosphere
          atmosphereColor={isDark ? '#60a5fa' : '#3b82f6'}
          atmosphereAltitude={0.15}
        />
      </div>

      {/* Legend & Controls */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-purple-500' : 'bg-purple-600'}`}></div>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Airports ({placesData.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-cyan-500"></div>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Flight Routes ({arcsData.length})</span>
          </div>
        </div>
        <div className="text-center text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          🔄 Auto-rotating | 🖱️ Drag to rotate | 🔍 Scroll to zoom | Hover over routes & airports for details
        </div>
      </div>
    </motion.div>
  )
}
