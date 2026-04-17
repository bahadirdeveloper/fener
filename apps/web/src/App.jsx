import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './routes/Home.jsx'
import Status from './routes/Status.jsx'
import Card from './routes/Card.jsx'
import Map from './routes/Map.jsx'
import Family from './routes/Family.jsx'
import Whistle from './routes/Whistle.jsx'
import Guide from './routes/Guide.jsx'
import Layout from './components/Layout.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/durum" element={<Status />} />
        <Route path="/kart" element={<Card />} />
        <Route path="/harita" element={<Map />} />
        <Route path="/aile" element={<Family />} />
        <Route path="/dudluk" element={<Whistle />} />
        <Route path="/rehber" element={<Guide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
