import React, { useContext, useState } from 'react'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext'
import remove_icon from '../Assets/Frontend_Assets/cart_cross_icon.png'
import CheckoutModal from '../CheckoutModal/CheckoutModal'

const CartItems = () => {
    const {getTotalCartAmount, all_product, cartItems, removeFromCart, clearCart} = useContext(ShopContext);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    
    const handleCheckout = () => {
        if (Object.values(cartItems).reduce((a, b) => a + b, 0) === 0) {
            alert('Your cart is empty');
            return;
        }
        if (!localStorage.getItem('auth-token')) {
            alert('Please login to checkout');
            return;
        }
        setShowCheckout(true);
    };
    
    const handleCheckoutSuccess = (txnId) => {
        setTransactionId(txnId);
        setCheckoutSuccess(true);
        clearCart();
        setTimeout(() => {
            setCheckoutSuccess(false);
        }, 5000);
    };
    
    return (
        <div className='cartitems'>
            {checkoutSuccess && (
                <div className="checkout-success">
                    Order placed successfully! Transaction ID: {transactionId}
                </div>
            )}
            
            <div className="cartitems-format-main">
                <p>Product</p>
                <p>Name</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt={e.name} className='carticon-product-icon'/>
                                <p>{e.name}</p>
                                <p>${e.new_price}</p>
                                <button className='cartitems-quantity'>{cartItems[e.id]}</button>
                                <p>${e.new_price * cartItems[e.id]}</p>
                                <img 
                                    src={remove_icon} 
                                    onClick={() => { removeFromCart(e.id) }}
                                    alt="Remove" 
                                    className='cartitems-remove-icon'
                                />
                            </div>
                            <hr />
                        </div>
                    )
                }
                return null;
            })}
            
            <div className="cartitems-down">
              <div className="cartitems-total">
                <h1>Cart Total</h1>
                <div>
                  <div className="cartitems-total-item">
                    <p>Subtotal</p>
                    <p>${getTotalCartAmount()}</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item">
                    <p>Shipping Free</p>
                    <p>Free</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item">
                    <h3>Total</h3>
                    <h3>${getTotalCartAmount()}</h3>
                  </div>
                  <button 
                    className="checkout-btn" 
                    onClick={handleCheckout}
                    disabled={Object.values(cartItems).reduce((a, b) => a + b, 0) === 0}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              </div> 

              <div className="cartitems-promocode">
                <p>If have a promocode, Enter it here</p>
                <div className="cartitems-promobox">
                  <input type="text" placeholder='PROMOCODE'/>
                  <button className="submit-btn">Submit</button>
                </div>
              </div>
            </div>
            
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onCheckoutSuccess={handleCheckoutSuccess}
            />
        </div>
    );
}

export default CartItems;