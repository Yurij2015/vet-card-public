import { Routes, Route } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import ClinicPage from './pages/ClinicPage'
import AppointmentPage from './pages/AppointmentPage'
import MyAppointmentsPage from './pages/MyAppointmentsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/my-appointments" element={<MyAppointmentsPage />} />
      <Route path="/:slug" element={<ClinicPage />} />
      <Route path="/:slug/appointment" element={<AppointmentPage />} />
    </Routes>
  )
}
export default App
