import React from 'react'
import './Offers.css'
import exclusive_image from '../Assets/Frontend_Assets/exclusive_image.png'

const Offer = () => {
  return (
    <div className="offers">
    <div className="offers-left">
      <h1>Exclusive</h1>
      <h1>Offers for You</h1>
      <button>Check Now</button>
    </div>

    <div className="offers-right">
      <img src={exclusive_image} alt="" />
    </div>

    </div>
  )
}

export default Offer
