import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, selectCurrentUser } from '../../redux/slices/authSlice';
import { authService } from '../../services/authService';

const loginSchema = yup.object().shape({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().required('Password is required').min(5, 'Password too short'),
});

const AdminLoginView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const user = useSelector(selectCurrentUser);

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            if (data.user.role !== 'ADMIN') {
                setErrorMsg('Access denied. This portal is for administrators only.');
                return;
            }
            dispatch(setCredentials(data));
            // Navigate handles in useEffect or here, but better to let state update trigger it or direct nav
            navigate('/admin');
        },
        onError: (error) => {
            setErrorMsg(error.response?.data?.message || 'Invalid credentials. Please try again.');
        },
    });

    const onSubmit = (data) => {
        setErrorMsg('');
        loginMutation.mutate(data);
    };

    return (
        <div style={styles.page}>
            {/* Animated background blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            <div style={styles.container}>
                {/* Logo / Brand */}
                <div style={styles.brand}>
                    <div style={styles.logoRing}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={styles.brandName}>PrepWise AI</h1>
                        <p style={styles.brandSub}>Admin Control Panel</p>
                    </div>
                </div>

                {/* Card */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>Administrator Sign In</h2>
                        <p style={styles.cardSubtitle}>Restricted access — authorized personnel only</p>
                    </div>

                    {errorMsg && (
                        <div style={styles.errorBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                        {/* Email */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Admin Email</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    {...register('email')}
                                    type="email"
                                    id="admin-email"
                                    autoComplete="off"
                                    placeholder="admin@sanjivani.edu.in"
                                    style={{
                                        ...styles.input,
                                        ...(errors.email ? styles.inputError : {}),
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(255,255,255,0.12)'}
                                />
                            </div>
                            {errors.email && <p style={styles.fieldError}>{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    id="admin-password"
                                    autoComplete="off"
                                    placeholder="••••••••"
                                    style={{
                                        ...styles.input,
                                        paddingRight: '48px',
                                        ...(errors.password ? styles.inputError : {}),
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(255,255,255,0.12)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p style={styles.fieldError}>{errors.password.message}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            style={{
                                ...styles.submitBtn,
                                ...(loginMutation.isPending ? styles.submitBtnDisabled : {}),
                            }}
                        >
                            {loginMutation.isPending ? (
                                <span style={styles.spinnerRow}>
                                    <span style={styles.spinner} />
                                    Authenticating...
                                </span>
                            ) : (
                                <span style={styles.btnRow}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Sign In to Admin Panel
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={styles.footer}>
                        <div style={styles.divider}>
                            <span style={styles.dividerLine} />
                            <span style={styles.dividerText}>Sanjivani College of Engineering</span>
                            <span style={styles.dividerLine} />
                        </div>
                        <p style={styles.footerNote}>
                            Student? &nbsp;
                            <a href="/auth/login" style={styles.footerLink}>Go to Student Login →</a>
                        </p>
                    </div>
                </div>

                {/* Security badge */}
                <div style={styles.securityBadge}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Secured with JWT Authentication</span>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
    },
    blob1: {
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'blob 8s ease-in-out infinite',
        pointerEvents: 'none',
    },
    blob2: {
        position: 'absolute',
        bottom: '-80px',
        right: '-80px',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'blob 10s ease-in-out infinite 2s',
        pointerEvents: 'none',
    },
    blob3: {
        position: 'absolute',
        top: '50%',
        left: '60%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'blob 12s ease-in-out infinite 4s',
        pointerEvents: 'none',
    },
    container: {
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease-out',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '28px',
        justifyContent: 'center',
    },
    logoRing: {
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
    },
    brandName: {
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '700',
        margin: 0,
        letterSpacing: '-0.3px',
    },
    brandSub: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: '12px',
        fontWeight: '500',
        margin: 0,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    },
    cardHeader: {
        marginBottom: '28px',
    },
    cardTitle: {
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '700',
        margin: '0 0 6px 0',
        letterSpacing: '-0.3px',
    },
    cardSubtitle: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: '13px',
        margin: 0,
        fontWeight: '400',
    },
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '10px',
        padding: '12px 14px',
        color: '#fca5a5',
        fontSize: '13px',
        marginBottom: '20px',
        lineHeight: '1.4',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '13px',
        fontWeight: '500',
        letterSpacing: '0.2px',
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(255,255,255,0.35)',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '13px 14px 13px 42px',
        color: '#ffffff',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
    },
    inputError: {
        borderColor: '#ef4444',
    },
    eyeBtn: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
        transition: 'color 0.2s',
    },
    fieldError: {
        color: '#f87171',
        fontSize: '12px',
        margin: 0,
        fontWeight: '400',
    },
    submitBtn: {
        width: '100%',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: 'none',
        borderRadius: '12px',
        padding: '14px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        letterSpacing: '0.2px',
        marginTop: '4px',
        fontFamily: "'Inter', sans-serif",
    },
    submitBtnDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    btnRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    spinnerRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
    },
    footer: {
        marginTop: '28px',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        background: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: '11px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        letterSpacing: '0.3px',
    },
    footerNote: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.35)',
        fontSize: '13px',
        margin: 0,
    },
    footerLink: {
        color: '#818cf8',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s',
    },
    securityBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '20px',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '11px',
        fontWeight: '500',
        letterSpacing: '0.3px',
    },
};

export default AdminLoginView;
