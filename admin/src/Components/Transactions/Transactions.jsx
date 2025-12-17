import React, { useState, useEffect } from 'react';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:4000/transactions');
            const data = await response.json();
            
            if (data.success) {
                setTransactions(data.transactions);
            } else {
                setError(data.error || 'Failed to fetch transactions');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        if (!selectedTransaction || !statusUpdate) return;

        try {
            const response = await fetch('http://localhost:4000/updatetransaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transactionId: selectedTransaction.transactionId,
                    status: statusUpdate,
                    notes: notes
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Update local state
                setTransactions(prev => prev.map(txn => 
                    txn.transactionId === selectedTransaction.transactionId 
                    ? data.transaction 
                    : txn
                ));
                setShowModal(false);
                setStatusUpdate('');
                setNotes('');
                setSelectedTransaction(null);
            } else {
                setError(data.error || 'Failed to update transaction');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error updating transaction:', err);
        }
    };

    const openUpdateModal = (transaction) => {
        setSelectedTransaction(transaction);
        setStatusUpdate(transaction.status);
        setNotes(transaction.notes || '');
        setShowModal(true);
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            default: return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (loading) {
        return <div className="loading">Loading transactions...</div>;
    }

    return (
        <div className="transactions-page">
            <div className="transactions-header">
                <h1>Transactions Management</h1>
                <button onClick={fetchTransactions} className="refresh-btn">
                    Refresh
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="transactions-container">
                <div className="transactions-stats">
                    <div className="stat-card">
                        <h3>Total Transactions</h3>
                        <p>{transactions.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending</h3>
                        <p>{transactions.filter(t => t.status === 'pending').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Processing</h3>
                        <p>{transactions.filter(t => t.status === 'processing').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Completed</h3>
                        <p>{transactions.filter(t => t.status === 'completed').length}</p>
                    </div>
                </div>

                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => (
                                <tr key={transaction.transactionId}>
                                    <td className="transaction-id">{transaction.transactionId}</td>
                                    <td>
                                        <div className="customer-info">
                                            <div className="customer-name">{transaction.userName}</div>
                                            <div className="customer-email">{transaction.userEmail}</div>
                                        </div>
                                    </td>
                                    <td>{formatDate(transaction.createdAt)}</td>
                                    <td>
                                        <div className="items-count">
                                            {transaction.items.length} item(s)
                                            <div className="items-preview">
                                                {transaction.items.slice(0, 2).map(item => (
                                                    <div key={item.productId} className="item-preview">
                                                        <img src={item.image} alt={item.name} />
                                                        <span>{item.name} (x{item.quantity})</span>
                                                    </div>
                                                ))}
                                                {transaction.items.length > 2 && (
                                                    <div className="more-items">
                                                        +{transaction.items.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="transaction-total">${transaction.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="update-btn"
                                            onClick={() => openUpdateModal(transaction)}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="view-btn"
                                            onClick={() => window.open(`/transaction/${transaction.transactionId}`, '_blank')}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selectedTransaction && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Update Transaction</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="transaction-details">
                                <p><strong>Transaction ID:</strong> {selectedTransaction.transactionId}</p>
                                <p><strong>Customer:</strong> {selectedTransaction.userName}</p>
                                <p><strong>Total Amount:</strong> ${selectedTransaction.totalAmount.toFixed(2)}</p>
                            </div>
                            
                            <form onSubmit={handleStatusUpdate}>
                                <div className="form-group">
                                    <label>Status:</label>
                                    <select 
                                        value={statusUpdate}
                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Notes:</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes..."
                                        rows="4"
                                    />
                                </div>
                                
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;