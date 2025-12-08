import React from 'react'
import { Route,Routes } from 'react-router-dom'
import HomePage from './pages/homepage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
const App = () => {
  return (
    <div className="bg-[url('./src/assets/Desktop.png')]">
      <Routes>
        <Route path='/' element={<HomePage />}/>
        <Route path='/login' element={<LoginPage />}/>
        <Route path='/profile' element={<ProfilePage />}/>
      </Routes>
    </div>
  )
}

export default App;
