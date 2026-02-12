import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import About from './pages/About'
import Contact from './pages/contact'
import Header from './components/header'
import Footer from './components/footer'
import Login from './pages/login'
import Signup from './pages/signup'
import Dashboard from './pages/dashboard'

function App() {
  return (
    <Router>
      <Header />


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
