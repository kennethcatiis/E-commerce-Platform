import React, { useContext } from 'react'
import {ShopContext} from '../Context/ShopContext'
import {useParams} from 'react-router-dom'; 
import Breadcrumb from '../Components/Breadcrumbs/Breadcrumbs.jsx'
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay.jsx';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox.jsx';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts.jsx'

const Product = () => {
  const {all_product} = useContext(ShopContext);
  const {productId} = useParams();
  const product = all_product.find((e)=>e.id === Number(productId));
  return (
    <div>
      <Breadcrumb product={product}/>
      <ProductDisplay product={product}/>
      <DescriptionBox/>
      <RelatedProducts/>
    </div>
  )
}

export default Product
