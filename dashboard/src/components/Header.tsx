import React from 'react'

type Props = {
  isDark: boolean
  children?: React.ReactNode
}

export default function Header({ isDark, children }: Props){
  const headerBg = isDark ? 'border-white/6 bg-white/4' : 'border-slate-200 bg-white/60'
  const textColor = isDark ? 'text-slate-200/70' : 'text-slate-600'
  
  return (
    <header className={`border-b backdrop-blur-sm transition-colors duration-500 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 via-indigo-500 to-sky-400 flex items-center justify-center font-semibold text-white shadow-md">CB</div>
          <div>
            <h1 className="text-xl font-semibold">Customer Booking Analytics Dashboard</h1>
          </div>
        </div>

        {children}
      </div>
    </header>
  )
}
