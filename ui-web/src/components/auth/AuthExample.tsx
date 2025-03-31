import React, { useState } from 'react';
import { getAppmintAuth } from '../../lib/appmint-auth';

// Get the AppmintAuth instance
const appmintAuth = getAppmintAuth();

// Define types for form data
interface LoginFormData {
    email: string;
    password: string;
}

interface RegisterFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

interface ForgotPasswordFormData {
    email: string;
}

interface ResetPasswordFormData {
    token: string;
    password: string;
}

/**
 * Authentication component example
 * Demonstrates how to use the AppmintAuth service in a React component
 */
const AuthExample: React.FC = () => {
    // State for the current auth view
    const [view, setView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');

    // State for form data
    const [loginData, setLoginData] = useState<LoginFormData>({ email: '', password: '' });
    const [registerData, setRegisterData] = useState<RegisterFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordFormData>({ email: '' });
    const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordFormData>({ token: '', password: '' });

    // State for loading and error handling
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Handle login form submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await appmintAuth.login(loginData.email, loginData.password);

            // Store the auth token and user info
            if (response?.token) {
                localStorage.setItem('authToken', response.token);

                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }

                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }

                setSuccess('Login successful!');

                // You might want to redirect the user to a dashboard or home page
                // window.location.href = '/dashboard';
            } else {
                setError('Login failed: Invalid response from server');
            }
        } catch (err) {
            setError(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle register form submission
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await appmintAuth.register(registerData);

            setSuccess('Registration successful! You can now log in.');

            // Optionally switch to login view
            setTimeout(() => {
                setView('login');
                setLoginData({
                    email: registerData.email,
                    password: registerData.password
                });
            }, 2000);
        } catch (err) {
            setError(`Registration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle forgot password form submission
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await appmintAuth.forgotPassword(forgotPasswordData.email);

            setSuccess('Password reset instructions have been sent to your email.');

            // Optionally switch to reset password view
            setTimeout(() => {
                setView('reset-password');
            }, 3000);
        } catch (err) {
            setError(`Forgot password request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle reset password form submission
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await appmintAuth.resetPassword(resetPasswordData.token, resetPasswordData.password);

            setSuccess('Password has been reset successfully. You can now log in with your new password.');

            // Optionally switch to login view
            setTimeout(() => {
                setView('login');
            }, 3000);
        } catch (err) {
            setError(`Password reset failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Render the login form
    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="auth-form">
            <h2>Login</h2>

            <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <div className="auth-links">
                    <button type="button" onClick={() => setView('forgot-password')} className="link-button">
                        Forgot Password?
                    </button>
                    <button type="button" onClick={() => setView('register')} className="link-button">
                        Create Account
                    </button>
                </div>
            </div>
        </form>
    );

    // Render the register form
    const renderRegisterForm = () => (
        <form onSubmit={handleRegister} className="auth-form">
            <h2>Create Account</h2>

            <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="register-first-name">First Name</label>
                <input
                    id="register-first-name"
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="register-last-name">Last Name</label>
                <input
                    id="register-last-name"
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="register-phone">Phone (optional)</label>
                <input
                    id="register-phone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="auth-links">
                    <button type="button" onClick={() => setView('login')} className="link-button">
                        Already have an account? Login
                    </button>
                </div>
            </div>
        </form>
    );

    // Render the forgot password form
    const renderForgotPasswordForm = () => (
        <form onSubmit={handleForgotPassword} className="auth-form">
            <h2>Forgot Password</h2>

            <div className="form-group">
                <label htmlFor="forgot-password-email">Email</label>
                <input
                    id="forgot-password-email"
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                    required
                />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>

                <div className="auth-links">
                    <button type="button" onClick={() => setView('login')} className="link-button">
                        Back to Login
                    </button>
                </div>
            </div>
        </form>
    );

    // Render the reset password form
    const renderResetPasswordForm = () => (
        <form onSubmit={handleResetPassword} className="auth-form">
            <h2>Reset Password</h2>

            <div className="form-group">
                <label htmlFor="reset-password-token">Reset Token</label>
                <input
                    id="reset-password-token"
                    type="text"
                    value={resetPasswordData.token}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, token: e.target.value })}
                    required
                />
                <small>Enter the token you received in your email</small>
            </div>

            <div className="form-group">
                <label htmlFor="reset-password-new">New Password</label>
                <input
                    id="reset-password-new"
                    type="password"
                    value={resetPasswordData.password}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                    required
                />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div className="auth-links">
                    <button type="button" onClick={() => setView('login')} className="link-button">
                        Back to Login
                    </button>
                </div>
            </div>
        </form>
    );

    // Render the current view
    const renderCurrentView = () => {
        switch (view) {
            case 'login':
                return renderLoginForm();
            case 'register':
                return renderRegisterForm();
            case 'forgot-password':
                return renderForgotPasswordForm();
            case 'reset-password':
                return renderResetPasswordForm();
            default:
                return renderLoginForm();
        }
    };

    return (
        <div className="auth-container">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {renderCurrentView()}

            <style jsx>{`
                .auth-container {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .form-group label {
                    font-weight: 500;
                }
                
                .form-group input {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .form-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .form-actions button {
                    padding: 10px;
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                .form-actions button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                
                .auth-links {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                
                .link-button {
                    background: none;
                    border: none;
                    color: #0070f3;
                    cursor: pointer;
                    padding: 0;
                    font-size: 14px;
                    text-decoration: underline;
                }
                
                .error-message {
                    background-color: #ffebee;
                    color: #d32f2f;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                }
                
                .success-message {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                }
            `}</style>
        </div>
    );
};

export default AuthExample;
