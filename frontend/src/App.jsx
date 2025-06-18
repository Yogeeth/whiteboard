import React from 'react'
import CanvasBoard from './components/whiteboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/whiteboard/:userId' element={<CanvasBoard/>} />
      </Routes>
    </Router>
  )
}
