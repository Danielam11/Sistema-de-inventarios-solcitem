import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/joy/styles';
import AppRouter from './AppRouter'; // Importa el sistema de rutas

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <AppRouter /> {/* Usa AppRouter para manejar las rutas */}
    </StyledEngineProvider>
  </React.StrictMode>
);