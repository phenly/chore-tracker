import { useState } from 'react'
import CurrentWeek from './components/CurrentWeek'
import HistoryView from './components/HistoryView'
import NavBar from './components/NavBar'
import { getWeekStartStr } from './lib/utils'

export default function App() {
  const [view, setView] = useState('current')
  const weekStart = getWeekStartStr()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0d0d1a 0%, #1a0533 50%, #0d1a33 100%)',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      color: '#fff',
      paddingBottom: '90px',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pop {
          0% { transform: scale(1) }
          40% { transform: scale(1.22) }
          100% { transform: scale(1) }
        }
        @keyframes shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px) }
          to { opacity: 1; transform: translateY(0) }
        }
        .tap { transition: all 0.15s ease; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .tap:active { transform: scale(0.92) !important; }
        .pop-anim { animation: pop 0.35s ease; }
        body { margin: 0; }
      `}</style>

      {view === 'current'
        ? <CurrentWeek weekStart={weekStart} />
        : <HistoryView />
      }

      <NavBar view={view} setView={setView} />
    </div>
  )
}
