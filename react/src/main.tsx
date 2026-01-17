import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './main.css'
import { ThemeProvider } from "@/components/theme-provider"
import AppLayout from './AppLayout.tsx'
import Config from './Config.tsx'
import Home from './Home.tsx'
import Whitelist from "@/Whitelist.tsx";
import Bans from "@/Bans.tsx";
import IPBans from "@/IPBans.tsx";

import './websocket.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<AppLayout />}>
                      <Route path="home" element={<Home/>} />
                      <Route path="whitelist" element={<Whitelist/>} />
                      <Route path="bans" element={<Bans/>} />
                      <Route path="ip-bans" element={<IPBans/>} />
                  </Route>
                  <Route path="config" element={<Config />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
  </StrictMode>,
)
