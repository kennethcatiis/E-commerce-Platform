import React, { useState, useEffect } from 'react';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserTransactions();
    }, []);

    const fetchUserTransactions = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setError('Please login to view your transactions');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/mytransactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            
            if (data.success) {
                setTransactions(data.transactions);
            } else {
                setError(data.error || 'Failed to load transactions');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'processing':
            case 'shipped':
                return 'status-processing';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    };

    if (loading) {
        return (
            <div className="transactions-container">
                <div className="loading">Loading transactions...</div>
            </div>
        );
    }

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h1>My Orders</h1>
                <p>View your order history and track current orders</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {transactions.length === 0 ? (
                <div className="no-transactions">
                    <p>You haven't placed any orders yet.</p>
                    <a href="/" className="shop-link">Start Shopping</a>
                </div>
            ) : (
                <div className="transactions-list">
                    {transactions.map((transaction) => (
                        <div key={transaction._id} className="transaction-card">
                            <div className="transaction-header">
                                <div className="transaction-id">
                                    <h3>Order #{transaction.transactionId}</h3>
                                    <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                                        {transaction.status}
                                    </span>
                                </div>
                                <div className="transaction-date">
                                    {formatDate(transaction.createdAt)}
                                </div>
                            </div>

                            <div className="transaction-details">
                                <div className="transaction-items">
                                    <h4>Items ({transaction.items.length})</h4>
                                    <div className="items-list">
                                        {transaction.items.map((item, index) => (
                                            <div key={index} className="item-row">
                                                <div className="item-info">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="item-image"
                                                    />
                                                    <div className="item-details">
                                                        <p className="item-name">{item.name}</p>
                                                        <p className="item-price">${item.price} × {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <div className="item-total">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="transaction-summary">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>${transaction.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping:</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total:</span>
                                        <span>${transaction.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {transaction.shippingAddress && (
                                    <div className="shipping-address">
                                        <h4>Shipping Address: </h4>
                                        <p>
                                            {transaction.shippingAddress.street},<br />
                                            {transaction.shippingAddress.city}, {transaction.shippingAddress.state}<br />
                                            {transaction.shippingAddress.zipCode}, {transaction.shippingAddress.country}
                                        </p>
                                    </div>
                                )}

                                <div className="payment-method">
                                    <h4>Payment Method:</h4>
                                    <p>{transaction.paymentMethod}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Transactions;