import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Portada from './pages/Portada.tsx'
import Tarea9 from './pages/Tarea9.tsx'
import CarrouselPage from './pages/CarrouselPage.tsx'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-montserrat bg-base-200">
        {/* Navegación con tabs DaisyUI */}
        <nav className="flex justify-center pt-6 pb-2">
          <div role="tablist" className="tabs tabs-bordered tabs-lg">
            <NavLink to="/" end role="tab"
              className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
              Portada
            </NavLink>
            <NavLink to="/tarea9" role="tab"
              className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
              Tarea 9
            </NavLink>
            <NavLink to="/carrousel" role="tab"
              className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
              Carrousel
            </NavLink>
          </div>
        </nav>

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<Portada />} />
          <Route path="/tarea9" element={<Tarea9 />} />
          <Route path="/carrousel" element={<CarrouselPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
