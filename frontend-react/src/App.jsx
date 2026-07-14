import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TimeSelect from './pages/TimeSelect'
import Success from './pages/Success'
import History from './pages/History'
import Detail from './pages/Detail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/time-select" element={<TimeSelect />} />
        <Route path="/success" element={<Success />} />
        <Route path="/history" element={<History />} />
        <Route path="/echo/:id" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App