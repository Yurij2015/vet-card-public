import { Routes, Route, Navigate } from 'react-router-dom'
import ClinicPage from './pages/ClinicPage'
import AppointmentPage from './pages/AppointmentPage'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/my-clinic" replace />} />
      <Route path="/:slug" element={<ClinicPage />} />
      <Route path="/:slug/appointment" element={<AppointmentPage />} />
    </Routes>
  )
}
export default App
