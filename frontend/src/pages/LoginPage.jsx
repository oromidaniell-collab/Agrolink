import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, googleLogin } from '../redux/slices/authSlice';
import LoginForm from '../components/auth/LoginForm';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (formData) => {
        setLoading(true);
        setError('');

        try {
            const result = await dispatch(login(formData));
            if (login.fulfilled.match(result)) {
                // Redirect to dashboard
                navigate('/dashboard');
            } else {
                setError(result.payload?.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const result = await dispatch(googleLogin(credentialResponse.credential));
            if (googleLogin.fulfilled.match(result)) {
                navigate('/dashboard');
            } else {
                setError(result.payload?.message || 'Google Login failed');
            }
        } catch (err) {
            console.error('Google login error:', err);
            setError('An unexpected error occurred during Google Login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your AgroLink account</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <LoginForm onSubmit={handleLogin} loading={loading} />

                    <div className="login-divider">
                        <span>OR</span>
                    </div>

                    <div className="google-login-wrap">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login failed')}
                            theme="outline"
                            size="large"
                            width="100%"
                            text="continue_with"
                        />
                    </div>

                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/register">Register here</Link></p>
                    </div>
                </div>

                <div className="login-bg">
                    <div className="login-overlay">
                        <h2>AgroLink</h2>
                        <p className="tagline">Connecting Farmers to Markets & Services</p>
                        <div className="login-benefits">
                            <div className="benefit">
                                <i className="fas fa-seedling"></i>
                                <span>Access fresh produce directly from farms</span>
                            </div>
                            <div className="benefit">
                                <i className="fas fa-handshake"></i>
                                <span>Connect with verified buyers and sellers</span>
                            </div>
                            <div className="benefit">
                                <i className="fas fa-shield-alt"></i>
                                <span>Trade securely with M-Pesa escrow</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
