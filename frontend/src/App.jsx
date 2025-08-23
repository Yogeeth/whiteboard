import React from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import CanvasBoard from './components/whiteboard'
import WebRTCAppAutomated from './components/vid'
import ManualWebRTCApp from './components/video'
import WhiteboardHomepage from './components/Homepage'
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<WhiteboardHomepage/>} />
        <Route path='/whiteboard/:userId/:room' element={<CanvasBoard/>} />
        <Route path='/video/:room' element={<WebRTCAppAutomated/>}/>
        <Route path='/video' element={<ManualWebRTCApp/>}/>
      </Routes>
    </Router>
  )
}
