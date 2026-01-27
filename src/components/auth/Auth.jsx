/**
 * Auth Component - Liquid Glass & Stable Island
 * - Fixed positioning for all common elements
 * - Liquid glass aesthetics (backdrop-blur, translucent whites)
 * - Persistent input visibility
 */
import React, { useState, useRef, useEffect } from 'react';
import { NEO } from '../../styles/theme';
import { db } from '../../lib/db';
import { setStoredAuthToken } from '../../lib/authStorage';

const AuthStates = {
  EMAIL: 'email',
  CODE: 'code',
};

export default function Auth({ isModal = false, onClose }) {
  const [state, setState] = useState(AuthStates.EMAIL);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const codeRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (state === AuthStates.EMAIL) {
      emailRef.current?.focus();
    } else {
      setTimeout(() => codeRef.current?.focus(), 100);
    }
  }, [state]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setState(AuthStates.CODE);
    } catch (err) {
      setError(err.body?.message || 'Signal lost.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await db.auth.signInWithMagicCode({
        email: email.trim(),
        code: code.trim()
      });
      setStoredAuthToken(res?.user?.refresh_token);
    } catch (err) {
      setError(err.body?.message || 'Code mismatch.');
      setCode('');
      codeRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setState(AuthStates.EMAIL);
    setCode('');
    setError('');
  };

  // --- UI COMPONENTS ---

  // Reusable Submit Circle (Check Mark)
  const SubmitButton = ({ loading, onClick, disabled, className }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group flex items-center justify-center
        bg-gray-900 text-white rounded-full 
        transition-all duration-300
        hover:scale-105 active:scale-95 hover:bg-black
        disabled:opacity-0 disabled:pointer-events-none disabled:scale-75
        z-20 shadow-lg
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </button>
  );

  const CloseButton = () => (
    <button
      onClick={onClose}
      className="absolute top-5 right-5 w-8 h-8 bg-white/40 hover:bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all z-50 shadow-sm border border-white/50"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );

  const content = (
    <div
      onClick={e => e.stopPropagation()}
      className="relative flex flex-col items-center px-10 pt-12 text-center overflow-hidden"
      style={{
        // STABLE ISLAND DIMENSIONS
        width: '440px',
        height: '380px',
        // LIQUID GLASS STYLE
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '40px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
      }}
    >
      {/* 1. FIXED CLOSE BUTTON */}
      {isModal && onClose && <CloseButton />}

      {/* 2. FIXED HEADER SECTION (Title & Subtitle) */}
      <div className="w-full mb-8 shrink-0">
        <h1
          className="text-3xl mb-2 text-gray-900 font-medium tracking-tight"
          style={{ fontFamily: 'SF-Pro-Display-Light, sans-serif' }}
        >
          {state === AuthStates.EMAIL ? 'Como' : 'Check inbox'}
        </h1>
        <p
          className="text-lg text-gray-600/80 font-light"
          style={{ fontFamily: 'SF-Pro-Display-Light, sans-serif' }}
        >
          {state === AuthStates.EMAIL
            ? 'A playground for connecting the dots.'
            : `We sent a magic link to ${email}`
          }
        </p>
      </div>

      {/* 3. ERROR MESSAGE (Absolute to prevents layout shifts) */}
      <div className="absolute top-28 w-full left-0 flex justify-center pointer-events-none z-30">
        {error && (
          <div className="px-4 py-1 text-xs font-medium text-red-500 bg-red-50/90 backdrop-blur rounded-full border border-red-100 animate-shake shadow-sm">
            {error}
          </div>
        )}
      </div>

      {/* 4. FORM AREA (Absolute positioning for smooth fades or Fixed Grid) */}
      <div className="w-full relative flex-1">
        
        {/* EMAIL FORM */}
        {state === AuthStates.EMAIL && (
          <form onSubmit={handleSendCode} className="w-full animate-fadeIn">
            <div className="relative group w-full mb-6">
              <input
                ref={emailRef}
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                // VISIBLE INACTIVE STATE: bg-white/50 + border
                className="w-full pl-6 pr-16 py-4 text-lg rounded-full outline-none transition-all placeholder:text-gray-400 text-gray-900"
                style={{ 
                  fontFamily: 'SF-Pro-Display-Light, sans-serif',
                  background: 'rgba(255, 255, 255, 0.5)', // Visible but translucent
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.01)' 
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.01)';
                }}
              />
              
              {/* BUTTON INSIDE INPUT (Right Edge) */}
              <SubmitButton 
                loading={loading} 
                onClick={handleSendCode} 
                disabled={!email.trim()}
                className="absolute right-1 top-1 bottom-1 aspect-square h-[calc(100%-8px)]"
              />
            </div>
          </form>
        )}

        {/* CODE FORM */}
        {state === AuthStates.CODE && (
          <form onSubmit={handleVerifyCode} className="w-full animate-fadeIn flex flex-col items-center">
            
            {/* ROW: Boxes + Button */}
            <div className="relative w-full flex items-center justify-between gap-3 mb-8">
               {/* Hidden Input Overlay */}
              <input
                ref={codeRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
              />
              
              {/* Visual Dots */}
              <div className="flex-1 flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div 
                    key={index}
                    className={`
                      w-10 h-12 rounded-lg flex items-center justify-center text-xl transition-all duration-200
                      ${code[index] 
                        ? 'bg-white/80 border-white text-gray-900 shadow-sm' 
                        : 'bg-white/30 border-white/40 text-transparent' // Lighter, glassy inactive state
                      }
                      ${index === code.length ? 'scale-105 bg-white border-gray-200 ring-2 ring-gray-100' : ''}
                    `}
                    style={{ border: code[index] ? '1px solid white' : '1px solid rgba(255,255,255,0.4)' }}
                  >
                    {code[index] || <div className={`w-1.5 h-1.5 rounded-full ${index === code.length ? 'bg-gray-400' : 'bg-gray-300'}`} />}
                  </div>
                ))}
              </div>

              {/* SUBMIT BUTTON (Right of boxes) */}
              <SubmitButton
                 loading={loading}
                 onClick={handleVerifyCode}
                 disabled={code.length < 6}
                 className="w-12 h-12 shrink-0" // Fixed size independent of input height
              />
            </div>

            {/* SPACIOUS LINKS (Left & Right) */}
            <div className="w-full flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-white/40 rounded-full transition-all"
              >
                ← Wrong email
              </button>
              
              <button
                type="button"
                onClick={handleSendCode}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-white/40 rounded-full transition-all"
              >
                Resend
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  // STYLES & ANIMATIONS
  const styles = (
    <style>{`
      @font-face {
        font-family: 'SF-Pro-Display-Light';
        src: url('/assets/fonts/SF-Pro-Display-Light.otf') format('opentype');
      }
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-out forwards;
      }
      .animate-shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
      }
    `}</style>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onClick={onClose}
        style={{
          // BLURRY WHITE GLASS BACKDROP
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {content}
        {styles}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-8"
      style={{
        background: NEO.bg,
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Background Texture for Non-Modal View */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />
      <div className="fixed inset-0 pointer-events-none opacity-60" style={{ backgroundImage: `radial-gradient(circle, ${NEO.accent} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
      
      {content}
      {styles}
    </div>
  );
}