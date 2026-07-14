import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TimeSelect from './pages/TimeSelect'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/time-select" element={<TimeSelect />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App