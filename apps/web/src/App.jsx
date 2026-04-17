import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './routes/Home.jsx'
import Status from './routes/Status.jsx'
import Card from './routes/Card.jsx'
import CardShow from './routes/CardShow.jsx'
import Family from './routes/Family.jsx'
import FamilyStatus from './routes/FamilyStatus.jsx'
import Whistle from './routes/Whistle.jsx'
import Guide from './routes/Guide.jsx'
import Settings from './routes/Settings.jsx'
import Points from './routes/Points.jsx'
import Scan from './routes/Scan.jsx'
import Outbox from './routes/Outbox.jsx'
import Report from './routes/Report.jsx'
import Voice from './routes/Voice.jsx'
import SilentSos from './routes/SilentSos.jsx'
import Alphabet from './routes/Alphabet.jsx'
const Ble = lazy(() => import('./routes/Ble.jsx'))
import Layout from './components/Layout.jsx'
import Onboarding from './components/Onboarding.jsx'
import IosInstallHint from './components/IosInstallHint.jsx'
import UpdateBanner from './components/UpdateBanner.jsx'
import { getFlag } from './lib/prefs.js'

const Map = lazy(() => import('./routes/Map.jsx'))

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm opacity-60">
      Yükleniyor…
    </div>
  )
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(!getFlag('onboarded'))

  return (
    <>
    {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    <IosInstallHint />
    <UpdateBanner />
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/durum" element={<Status />} />
        <Route path="/kart" element={<Card />} />
        <Route path="/kart/goster" element={<CardShow />} />
        <Route
          path="/harita"
          element={<Suspense fallback={<Loading />}><Map /></Suspense>}
        />
        <Route path="/aile" element={<Family />} />
        <Route path="/aile/durum" element={<FamilyStatus />} />
        <Route path="/dudluk" element={<Whistle />} />
        <Route path="/rehber" element={<Guide />} />
        <Route path="/ayarlar" element={<Settings />} />
        <Route path="/noktalarim" element={<Points />} />
        <Route path="/oku" element={<Scan />} />
        <Route path="/giden" element={<Outbox />} />
        <Route path="/rapor" element={<Report />} />
        <Route path="/ses" element={<Voice />} />
        <Route path="/sessiz-sos" element={<SilentSos />} />
        <Route path="/alfabe" element={<Alphabet />} />
        <Route path="/ble" element={<Suspense fallback={<Loading />}><Ble /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  )
}
