import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiSave, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Profile.css';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
    const { user, token, updateUser } = useAuth();
    const isGoogleUser = user?.provider === 'google';

    // --- Account Info state ---
    const [name, setName] = useState(user?.name || '');
    const [savingName, setSavingName] = useState(false);

    // Keep local name in sync when the context user.name changes
    // (e.g. navigating away and back, or after a successful save)
    useEffect(() => {
        if (user?.name !== undefined) setName(user.name);
    }, [user?.name]);

    // --- Password state ---
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPwd, setSavingPwd] = useState(false);
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);

    const getUserInitial = () => {
        if (user?.name) return user.name.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    // --- Save name ---
    const handleSaveName = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty.');
            return;
        }
        setSavingName(true);
        try {
            const res = await axios.put(
                `${BACKEND_URL}/api/auth/profile`,
                { name: name.trim() },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            updateUser({ name: res.data.user.name });
            toast.success('Name updated successfully!');
        } catch (err) {
            console.error('Save name error:', err);
            console.error('Response data:', err.response?.data);
            console.error('Status:', err.response?.status);
            console.error('Token used:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
            const msg = err.response?.data?.message || err.message || 'Failed to update name.';
            toast.error(msg);
        } finally {
            setSavingName(false);
        }
    };

    // --- Save password ---
    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match.');
            return;
        }
        setSavingPwd(true);
        try {
            await axios.put(
                `${BACKEND_URL}/api/auth/profile`,
                { currentPassword, newPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Save password error:', err);
            console.error('Response data:', err.response?.data);
            console.error('Status:', err.response?.status);
            const msg = err.response?.data?.message || err.message || 'Failed to update password.';
            toast.error(msg);
        } finally {
            setSavingPwd(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar-lg">{getUserInitial()}</div>
                <div className="profile-header-info">
                    <h1 className="profile-title">{user?.name || 'My Profile'}</h1>
                    <p className="profile-subtitle">{user?.email}</p>
                    {isGoogleUser && (
                        <div className="profile-google-badge">
                            <FcGoogle size={16} />
                            <span>Signed in with Google</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-cards">
                {/* ── Account Info Card ── */}
                <div className="profile-card">
                    <div className="profile-card__header">
                        <FiUser size={18} />
                        <h2>Account Info</h2>
                    </div>

                    <form className="profile-form" onSubmit={handleSaveName}>
                        <div className="profile-field">
                            <label htmlFor="profileName">Display Name</label>
                            <div className="profile-input-wrap">
                                <FiUser className="profile-input-icon" size={16} />
                                <input
                                    id="profileName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="profile-input"
                                />
                            </div>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profileEmail">Email Address</label>
                            <div className="profile-input-wrap">
                                <FiMail className="profile-input-icon" size={16} />
                                <input
                                    id="profileEmail"
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="profile-input profile-input--disabled"
                                />
                            </div>
                            <span className="profile-hint">Email cannot be changed.</span>
                        </div>

                        <button
                            type="submit"
                            className="profile-btn"
                            disabled={savingName}
                        >
                            <FiSave size={15} />
                            {savingName ? 'Saving…' : 'Save Name'}
                        </button>
                    </form>
                </div>

                {/* ── Password Card ── */}
                <div className="profile-card">
                    <div className="profile-card__header">
                        <FiLock size={18} />
                        <h2>Security</h2>
                    </div>

                    {isGoogleUser ? (
                        <div className="profile-google-notice">
                            <FiShield size={36} className="profile-google-notice__icon" />
                            <p className="profile-google-notice__title">Password managed by Google</p>
                            <p className="profile-google-notice__desc">
                                Your account uses Google Sign-In. Password changes are handled through your Google account settings.
                            </p>
                            <a
                                href="https://myaccount.google.com/security"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-google-notice__link"
                            >
                                Manage Google Account →
                            </a>
                        </div>
                    ) : (
                        <form className="profile-form" onSubmit={handleSavePassword}>
                            <div className="profile-field">
                                <label htmlFor="currentPassword">Current Password</label>
                                <div className="profile-input-wrap">
                                    <FiLock className="profile-input-icon" size={16} />
                                    <input
                                        id="currentPassword"
                                        type={showCurrentPwd ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="profile-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="profile-input-toggle"
                                        onClick={() => setShowCurrentPwd((v) => !v)}
                                        tabIndex={-1}
                                    >
                                        {showCurrentPwd ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="newPassword">New Password</label>
                                <div className="profile-input-wrap">
                                    <FiLock className="profile-input-icon" size={16} />
                                    <input
                                        id="newPassword"
                                        type={showNewPwd ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="profile-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="profile-input-toggle"
                                        onClick={() => setShowNewPwd((v) => !v)}
                                        tabIndex={-1}
                                    >
                                        {showNewPwd ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <div className="profile-input-wrap">
                                    <FiLock className="profile-input-icon" size={16} />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="profile-input"
                                        required
                                    />
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <span className="profile-hint profile-hint--error">Passwords do not match.</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="profile-btn"
                                disabled={savingPwd}
                            >
                                <FiLock size={15} />
                                {savingPwd ? 'Updating…' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
