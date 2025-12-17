import React from 'react'
import './Hero.css'
import hand_icon from '../Assets/Frontend_Assets/hand_icon.png'
import arrow_icon from '../Assets/Frontend_Assets/arrow.png'
import hero_image from '../Assets/Frontend_Assets/hero_image.png'

const Hero = () => {
  return (
    <div className ="hero">
      <div className="hero-left">
        <p>the latest </p>
        <p>threads</p>
        <p>for everyone</p>
        <div className="hero-latest-btn">
            <div>Latest Collection</div>
            <img src={arrow_icon} alt="" />
      </div>
      </div>

      <div className="hero-right">
        <img src = {hero_image} alt="" />
      </div>
    </div>
  )
}

export default Hero
