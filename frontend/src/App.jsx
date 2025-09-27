import React from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CanvasBoard from './pages/whiteboard'
import WhiteboardHomepage from './pages/Homepage'
import WebRTCAppAutomated from './pages/AutomatedWebRTCConnection'
import ManualWebRTCApp from './pages/ManualWebRTCConnection'
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<WhiteboardHomepage/>} />
        <Route path='/whiteboard/:userId/:room/:roomName' element={<CanvasBoard/>} />
        <Route path='/video/:room' element={<WebRTCAppAutomated/>}/>
        <Route path='/video' element={<ManualWebRTCApp/>}/>
      </Routes>
    </Router>
  )
}
