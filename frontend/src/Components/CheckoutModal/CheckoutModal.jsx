import React, { useState, useContext } from 'react';
import './CheckoutModal.css';
import { ShopContext } from '../../Context/ShopContext';

const CheckoutModal = ({ isOpen, onClose, onCheckoutSuccess }) => {
    const { getTotalCartAmount, cartItems, all_product, clearCart } = useContext(ShopContext);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('auth-token');
        if (!token) {
            setError('Please login to checkout');
            setLoading(false);
            return;
        }

        try {
            const cartItemsDetails = Object.keys(cartItems)
                .filter(id => cartItems[id] > 0)
                .map(id => {
                    const product = all_product.find(p => p.id === parseInt(id));
                    return product ? {
                        productId: product.id,
                        name: product.name,
                        price: product.new_price,
                        quantity: cartItems[id],
                        image: product.image
                    } : null;
                })
                .filter(item => item !== null);

            if (cartItemsDetails.length === 0) {
                setError('Your cart is empty');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:4000/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    shippingAddress,
                    paymentMethod,
                    items: cartItemsDetails,
                    totalAmount: getTotalCartAmount()
                })
            });

            const data = await response.json();

            if (data.success) {
                clearCart();
                onCheckoutSuccess(data.transactionId);
                onClose();
            } else {
                setError(data.error || 'Checkout failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Checkout error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-modal-overlay">
            <div className="checkout-modal">
                <div className="checkout-modal-header">
                    <h2>Checkout</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="checkout-section">
                        <h3>Shipping Address</h3>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Street Address"
                                value={shippingAddress.street}
                                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Region"
                                    value={shippingAddress.state}
                                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    value={shippingAddress.zipCode}
                                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={shippingAddress.country}
                                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="checkout-section">
                        <h3>Payment Method</h3>
                        <div className="payment-methods">
                            <label className="payment-method">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>Credit/Debit Card</span>
                            </label>
                            <label className="payment-method">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="paypal"
                                    checked={paymentMethod === 'paypal'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>PayPal</span>
                            </label>
                            <label className="payment-method">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>

                    <div className="checkout-section">
                        <h3>Order Summary</h3>
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>${getTotalCartAmount().toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${getTotalCartAmount().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="checkout-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="confirm-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;