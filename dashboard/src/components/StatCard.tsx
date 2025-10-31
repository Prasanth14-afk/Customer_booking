import React from 'react'
import { motion } from 'framer-motion'

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  gradient?: string
}

export default function StatCard({ title, value, subtitle, icon, gradient = 'from-indigo-500 to-purple-500' }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`p-6 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
