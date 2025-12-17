import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/logo.png'
import navprofile from '../../assets/nav-profile.svg'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="nav-brand">
        <img src={navlogo} alt="" className="nav-logo" />
        <p className="nav-title">THRDS. <span className="admin-text">ADMIN PANEL</span></p>
      </div>
      <img src={navprofile} alt="" className="nav-profile" />
    </div>
  )
}

export default Navbar