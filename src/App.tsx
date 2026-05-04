import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TripsPage from './pages/TripsPage'
import TripDetailPage from './pages/TripDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TripsPage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
