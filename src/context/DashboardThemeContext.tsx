'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type ThemeMode = 'dark' | 'light'

interface DashboardThemeContextValue {
  theme: ThemeMode
  isLight: boolean
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const DashboardThemeContext = createContext<DashboardThemeContextValue>({
  theme: 'dark',
  isLight: false,
  toggleTheme: () => {},
  setTheme: () => {},
})

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('monpodium_dashboard_theme') as ThemeMode | null
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved)
      if (saved === 'light') {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      }
    }
  }, [])

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode)
    localStorage.setItem('monpodium_dashboard_theme', mode)
    if (mode === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isLight = theme === 'light'

  return (
    <DashboardThemeContext.Provider value={{ theme, isLight, toggleTheme, setTheme }}>
      {children}
    </DashboardThemeContext.Provider>
  )
}

export function useDashboardTheme() {
  return useContext(DashboardThemeContext)
}
