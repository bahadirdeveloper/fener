import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './routes/Home.jsx'
import Status from './routes/Status.jsx'
import Card from './routes/Card.jsx'
import Family from './routes/Family.jsx'
import Whistle from './routes/Whistle.jsx'
import Guide from './routes/Guide.jsx'
import Layout from './components/Layout.jsx'

const Map = lazy(() => import('./routes/Map.jsx'))

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm opacity-60">
      Yükleniyor…
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/durum" element={<Status />} />
        <Route path="/kart" element={<Card />} />
        <Route
          path="/harita"
          element={<Suspense fallback={<Loading />}><Map /></Suspense>}
        />
        <Route path="/aile" element={<Family />} />
        <Route path="/dudluk" element={<Whistle />} />
        <Route path="/rehber" element={<Guide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
