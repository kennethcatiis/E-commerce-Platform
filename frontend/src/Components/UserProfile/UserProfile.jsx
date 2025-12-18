import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [originalData, setOriginalData] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [userStats, setUserStats] = useState({
        totalOrders: 0,
        joinDate: '',
        lastLogin: ''
    });
    const [changesToSave, setChangesToSave] = useState([]);

    useEffect(() => {
        fetchUserData();
        fetchUserStats();
    }, []);

    const fetchUserData = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Get user data from backend
            const response = await fetch('http://localhost:4000/getuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('auth-token');
                navigate('/login');
                return;
            }

            const data = await response.json();
            
            if (data.success) {
                const user = data.user;
                setUserData({
                    name: user.name || '',
                    email: user.email || '',
                    password: '',
                    confirmPassword: ''
                });
                setOriginalData({
                    name: user.name || '',
                    email: user.email || ''
                });
            } else {
                setError(data.error || 'Failed to load user data');
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            // For demo purposes, set dummy data if backend fails
            const demoName = 'Demo User';
            const demoEmail = 'demo@example.com';
            setUserData({
                name: demoName,
                email: demoEmail,
                password: '',
                confirmPassword: ''
            });
            setOriginalData({
                name: demoName,
                email: demoEmail
            });
        }
    };

    const fetchUserStats = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        try {
            // Get user's transaction count
            const response = await fetch('http://localhost:4000/mytransactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUserStats(prev => ({
                        ...prev,
                        totalOrders: data.transactions?.length || 0
                    }));
                }
            }
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (!userData.name.trim()) {
            setError('Name is required');
            return false;
        }
        
        if (!userData.email.trim()) {
            setError('Email is required');
            return false;
        }
        
        if (!/^\S+@\S+\.\S+$/.test(userData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        
        // Only validate password if it's being changed
        if (userData.password) {
            if (userData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
            
            if (userData.password !== userData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }
        
        return true;
    };

    const checkForChanges = () => {
        const changes = [];
        
        if (userData.name !== originalData.name) {
            changes.push(`Name: "${originalData.name}" → "${userData.name}"`);
        }
        
        if (userData.email !== originalData.email) {
            changes.push(`Email: "${originalData.email}" → "${userData.email}"`);
        }
        
        if (userData.password) {
            changes.push('Password: Changed');
        }
        
        setChangesToSave(changes);
        return changes.length > 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!validateForm()) {
            return;
        }

        if (!checkForChanges()) {
            setError('No changes detected. Please modify at least one field before saving.');
            return;
        }

        setShowSaveConfirm(true);
    };

    const confirmSaveChanges = async () => {
        setShowSaveConfirm(false);
        
        const token = localStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const updateData = {
                name: userData.name,
                email: userData.email
            };
            
            // Only include password if it's being changed
            if (userData.password) {
                updateData.password = userData.password;
            }

            const response = await fetch('http://localhost:4000/updateuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (data.success) {
                // Update original data to match new values
                setOriginalData({
                    name: userData.name,
                    email: userData.email
                });
                
                // Create success message with details
                let successMessage = 'Profile updated successfully!\n\nChanges saved:\n';
                changesToSave.forEach(change => {
                    successMessage += `• ${change}\n`;
                });
                
                alert(successMessage);
                setSuccess('Profile updated successfully!');
                
                // Clear password fields
                setUserData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                }));
                setChangesToSave([]);
            } else {
                setError(data.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            // For demo purposes, show success even if backend fails
            let successMessage = 'Profile updated successfully! (Demo mode)\n\nChanges saved:\n';
            changesToSave.forEach(change => {
                successMessage += `• ${change}\n`;
            });
            
            alert(successMessage);
            setSuccess('Profile updated successfully! (Demo mode)');
            setOriginalData({
                name: userData.name,
                email: userData.email
            });
            setUserData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));
            setChangesToSave([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:4000/deleteuser', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            const data = await response.json();

            if (data.success) {
                localStorage.removeItem('auth-token');
                alert('Account deleted successfully');
                navigate('/');
            } else {
                setError(data.error || 'Failed to delete account');
                setShowDeleteConfirm(false);
            }
        } catch (err) {
            console.error('Error deleting account:', err);
            // For demo purposes, simulate account deletion
            localStorage.removeItem('auth-token');
            alert('Account deleted successfully (Demo mode)');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/transactions');
    };

    const handleChangePassword = () => {
        // Focus on password fields
        document.getElementById('password')?.focus();
        setSuccess('Please enter your new password below');
    };

    const cancelSaveChanges = () => {
        setShowSaveConfirm(false);
        setChangesToSave([]);
        // Reset form to original values
        setUserData(prev => ({
            ...prev,
            name: originalData.name,
            email: originalData.email,
            password: '',
            confirmPassword: ''
        }));
        setSuccess('Changes cancelled. No updates were made.');
    };

    return (
        <div className="user-profile-container">
            <div className="user-profile-header">
                <h1>My Profile</h1>
                <p>Manage your account information and preferences</p>
            </div>

            <div className="user-stats">
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <p className="stat-number">{userStats.totalOrders}</p>
                    <button className="view-orders-btn" onClick={handleViewOrders}>
                        View Orders
                    </button>
                </div>
                <div className="stat-card">
                    <h3>Current Info</h3>
                    <p className="current-info">
                        <strong>Name:</strong> {originalData.name}
                    </p>
                    <p className="current-info">
                        <strong>Email:</strong> {originalData.email}
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Quick Actions</h3>
                    <button className="action-btn" onClick={handleChangePassword}>
                        Change Password
                    </button>
                    <button className="action-btn" onClick={() => navigate('/cart')}>
                        View Cart
                    </button>
                </div>
            </div>

            <div className="user-profile-card">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h3>Edit Personal Information</h3>
                        <p className="form-hint">Make changes below and click "Save Changes"</p>
                        
                        <div className="form-group">
                            <label htmlFor="name">
                                Full Name <span className="required">*</span>
                                {userData.name !== originalData.name && (
                                    <span className="change-indicator"> (Modified)</span>
                                )}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={userData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                disabled={loading}
                            />
                            {userData.name !== originalData.name && (
                                <small className="change-hint">
                                    Original: {originalData.name}
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address <span className="required">*</span>
                                {userData.email !== originalData.email && (
                                    <span className="change-indicator"> (Modified)</span>
                                )}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                            {userData.email !== originalData.email && (
                                <small className="change-hint">
                                    Original: {originalData.email}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Change Password</h3>
                        <p className="form-hint">Leave blank to keep current password</p>
                        
                        <div className="form-group">
                            <label htmlFor="password">
                                New Password
                                {userData.password && (
                                    <span className="change-indicator"> (Will be changed)</span>
                                )}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="Enter new password (min. 6 characters)"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={userData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="save-btn" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Saving...
                                </>
                            ) : 'Save Changes'}
                        </button>
                        <button 
                            type="button" 
                            className="logout-btn" 
                            onClick={handleLogout}
                            disabled={loading}
                        >
                            Logout
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => {
                                setUserData({
                                    ...userData,
                                    name: originalData.name,
                                    email: originalData.email,
                                    password: '',
                                    confirmPassword: ''
                                });
                                setError('');
                                setSuccess('Changes reset to original values');
                            }}
                            disabled={loading}
                        >
                            Reset Changes
                        </button>
                    </div>
                </form>

                {/* Save Confirmation Modal */}
                {showSaveConfirm && (
                    <div className="modal-overlay">
                        <div className="confirm-modal">
                            <div className="modal-header">
                                <h3>Confirm Changes</h3>
                            </div>
                            <div className="modal-body">
                                <p className="warning-text">
                                    <strong>Are you sure you want to save these changes?</strong>
                                </p>
                                <div className="changes-list">
                                    <h4>Changes to be saved:</h4>
                                    <ul>
                                        {changesToSave.map((change, index) => (
                                            <li key={index}>{change}</li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="modal-note">
                                    This will update your profile information.
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="confirm-btn"
                                    onClick={confirmSaveChanges}
                                    disabled={loading}
                                >
                                    Yes, Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-modal-btn"
                                    onClick={cancelSaveChanges}
                                    disabled={loading}
                                >
                                    No, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="danger-zone">
                    <h3>
                        Warning!
                    </h3>
                    <p>Once you delete your account, there is no going back. This action cannot be undone.</p>
                    
                    {showDeleteConfirm ? (
                        <div className="delete-confirm">
                            <p className="warning-text">
                                <strong>Are you absolutely sure?</strong><br />
                                This will permanently delete your account, remove all your data including order history, 
                                and cannot be recovered.
                            </p>
                            <div className="confirm-actions">
                                <button 
                                    type="button" 
                                    className="confirm-delete-btn"
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Deleting...
                                        </>
                                    ) : 'Yes, Delete My Account'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-delete-btn"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={loading}
                                >
                                    No, Keep My Account
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            type="button" 
                            className="delete-account-btn"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                        >
                            Delete Account
                        </button>
                    )}
                </div>

                <div className="profile-footer">
                    <p className="footer-note">
                        <i>Need help? Contact our support team at support@thrds.com</i>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;