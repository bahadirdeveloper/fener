import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './routes/Home.jsx'
import Status from './routes/Status.jsx'
import Card from './routes/Card.jsx'
import Family from './routes/Family.jsx'
import Settings from './routes/Settings.jsx'
const CardShow = lazy(() => import('./routes/CardShow.jsx'))
const FamilyStatus = lazy(() => import('./routes/FamilyStatus.jsx'))
const Whistle = lazy(() => import('./routes/Whistle.jsx'))
const Guide = lazy(() => import('./routes/Guide.jsx'))
const Points = lazy(() => import('./routes/Points.jsx'))
const Scan = lazy(() => import('./routes/Scan.jsx'))
const Outbox = lazy(() => import('./routes/Outbox.jsx'))
const Report = lazy(() => import('./routes/Report.jsx'))
const Voice = lazy(() => import('./routes/Voice.jsx'))
const SilentSos = lazy(() => import('./routes/SilentSos.jsx'))
const Alphabet = lazy(() => import('./routes/Alphabet.jsx'))
const Flash = lazy(() => import('./routes/Flash.jsx'))
const FirstAid = lazy(() => import('./routes/FirstAid.jsx'))
const Compass = lazy(() => import('./routes/Compass.jsx'))
const Kit = lazy(() => import('./routes/Kit.jsx'))
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
        <Route path="/kart/goster" element={<Suspense fallback={<Loading />}><CardShow /></Suspense>} />
        <Route path="/harita" element={<Suspense fallback={<Loading />}><Map /></Suspense>} />
        <Route path="/aile" element={<Family />} />
        <Route path="/aile/durum" element={<Suspense fallback={<Loading />}><FamilyStatus /></Suspense>} />
        <Route path="/dudluk" element={<Suspense fallback={<Loading />}><Whistle /></Suspense>} />
        <Route path="/rehber" element={<Suspense fallback={<Loading />}><Guide /></Suspense>} />
        <Route path="/ayarlar" element={<Settings />} />
        <Route path="/noktalarim" element={<Suspense fallback={<Loading />}><Points /></Suspense>} />
        <Route path="/oku" element={<Suspense fallback={<Loading />}><Scan /></Suspense>} />
        <Route path="/giden" element={<Suspense fallback={<Loading />}><Outbox /></Suspense>} />
        <Route path="/rapor" element={<Suspense fallback={<Loading />}><Report /></Suspense>} />
        <Route path="/ses" element={<Suspense fallback={<Loading />}><Voice /></Suspense>} />
        <Route path="/sessiz-sos" element={<Suspense fallback={<Loading />}><SilentSos /></Suspense>} />
        <Route path="/alfabe" element={<Suspense fallback={<Loading />}><Alphabet /></Suspense>} />
        <Route path="/isik" element={<Suspense fallback={<Loading />}><Flash /></Suspense>} />
        <Route path="/ilkyardim" element={<Suspense fallback={<Loading />}><FirstAid /></Suspense>} />
        <Route path="/pusula" element={<Suspense fallback={<Loading />}><Compass /></Suspense>} />
        <Route path="/hazirlik" element={<Suspense fallback={<Loading />}><Kit /></Suspense>} />
        <Route path="/ble" element={<Suspense fallback={<Loading />}><Ble /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  )
}
