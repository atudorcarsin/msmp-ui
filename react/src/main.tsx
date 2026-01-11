import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './main.css'
import { ThemeProvider } from "@/components/theme-provider"
import App from './App.tsx'
import Config from './Config.tsx'

import './websocket.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="config" element={<Config />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
  </StrictMode>,
)
