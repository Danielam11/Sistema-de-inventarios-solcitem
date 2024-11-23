import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import App from '../frontend/App'; // Asegúrate de importar correctamente

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Ruta para Login */}
        <Route path="/login" element={<Login />} />
        {/* Ruta para el Dashboard o la aplicación principal */}
        <Route path="/dashboard/*" element={<App />} />
        {/* Redirigir cualquier ruta desconocida al login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
