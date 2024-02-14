import './App.css'
import { AppBar } from './components/AppBar'
import { Route, Routes } from 'react-router-dom'
import BoxLayout from './pages/BoxLayout'
import ListLayout from './pages/ListLayout'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <div className="dark bg-background">
        <AppBar />
        <div className="bg-background w-screen h-screen">
          <Routes>
            <Route index element={<BoxLayout />} />
            <Route path="/list" element={<ListLayout />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
