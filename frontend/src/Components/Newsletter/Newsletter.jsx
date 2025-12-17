import React from 'react'
import './Newsletter.css'

const Newsletter = () => {
  return (
    <div className='newsletter'>
        <h1>Get Exclusive Offers On Your E-mail</h1>
        <p>Subscribe to our newsletter and stay updated on new threads!</p>
        <div>
            <input type="email" placeholder='Enter your email address' />
            <button>Subscribe</button>
        </div>
    </div>
  )
}

export default Newsletter
