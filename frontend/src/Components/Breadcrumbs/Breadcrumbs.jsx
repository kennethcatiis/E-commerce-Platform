import React from 'react'
import './Breadcrumbs.css'
import arrow_icon from '../Assets/Frontend_Assets/breadcrum_arrow.png'

const Breadcrumbs = (props) => {
    const {product} = props

    if (!product) {
        return (
            <div className="breadcrumb">
                HOME <img src={arrow_icon} alt="" /> SHOP
            </div>
        )
    }

    return (
        <div className="breadcrumb">
            HOME <img src={arrow_icon} alt="" /> SHOP <img src={arrow_icon} alt="" /> {product.category} <img src={arrow_icon} alt="" /> {product.name}
        </div>
    )
}

export default Breadcrumbs
