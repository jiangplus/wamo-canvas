/**
 * Auth Component
 * Passwordless authentication with email magic codes
 */
import React, { useState, useRef, useEffect } from 'react';
import { NEO } from '../../styles/theme';
import { db } from '../../lib/db';
import { setStoredAuthToken } from '../../lib/authStorage';

const AuthStates = {
  EMAIL: 'email',
  CODE: 'code',
};

export default function Auth({ isModal = false }) {
  const [state, setState] = useState(AuthStates.EMAIL);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (state === AuthStates.EMAIL) {
      emailRef.current?.focus();
    } else {
      codeRef.current?.focus();
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
      setError(err.body?.message || 'Failed to send code. Please try again.');
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
      // Auth state will update automatically via useAuth
    } catch (err) {
      setError(err.body?.message || 'Invalid code. Please try again.');
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

  const content = (
    <div
      className="relative w-full max-w-md animate-popIn"
      style={{
        background: NEO.surface,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${NEO.border}`,
        boxShadow: NEO.shadowHover,
        borderRadius: NEO.radiusLg,
        padding: '48px 40px',
      }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div
          className="w-16 h-16 flex items-center justify-center text-2xl"
          style={{
            background: NEO.ink,
            color: NEO.bg,
            boxShadow: NEO.shadow,
            borderRadius: NEO.radiusLg
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" />
            <path d="M17.8 11.8 19 13" /><path d="M15 9h.01" />
            <path d="M17.8 6.2 19 5" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-center text-2xl font-semibold mb-2"
        style={{ color: NEO.ink }}
      >
        {state === AuthStates.EMAIL ? 'Welcome to Canvas' : 'Check your email'}
      </h1>

      <p
        className="text-center text-sm mb-8"
        style={{ color: NEO.inkLight }}
      >
        {state === AuthStates.EMAIL
          ? 'Enter your email to receive a magic login code'
          : `We sent a code to ${email}`
        }
      </p>

      {/* Error message */}
      {error && (
        <div
          className="mb-6 p-3 text-sm text-center"
          style={{
            background: 'rgba(248, 113, 113, 0.1)',
            color: '#DC2626',
            borderRadius: NEO.radiusSm,
            border: '1px solid rgba(248, 113, 113, 0.2)'
          }}
        >
          {error}
        </div>
      )}

      {state === AuthStates.EMAIL ? (
        <form onSubmit={handleSendCode}>
          <input
            ref={emailRef}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3.5 text-base outline-none transition-all"
            style={{
              background: 'white',
              border: `1px solid ${NEO.border}`,
              borderRadius: NEO.radius,
              color: NEO.ink,
              boxShadow: NEO.shadowSoft,
            }}
            onFocus={(e) => e.target.style.borderColor = NEO.ink}
            onBlur={(e) => e.target.style.borderColor = NEO.border}
          />

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full mt-4 py-3.5 text-base font-medium transition-all"
            style={{
              background: loading || !email.trim() ? NEO.inkLight : NEO.ink,
              color: NEO.bg,
              borderRadius: NEO.radius,
              boxShadow: loading || !email.trim() ? 'none' : NEO.shadow,
              cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send Magic Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <input
            ref={codeRef}
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={loading}
            className="w-full px-4 py-3.5 text-base text-center tracking-[0.5em] outline-none transition-all"
            style={{
              background: 'white',
              border: `1px solid ${NEO.border}`,
              borderRadius: NEO.radius,
              color: NEO.ink,
              boxShadow: NEO.shadowSoft,
              fontFamily: 'monospace',
              fontSize: '20px',
              letterSpacing: '0.3em',
            }}
            onFocus={(e) => e.target.style.borderColor = NEO.ink}
            onBlur={(e) => e.target.style.borderColor = NEO.border}
          />

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full mt-4 py-3.5 text-base font-medium transition-all"
            style={{
              background: loading || code.length < 6 ? NEO.inkLight : NEO.ink,
              color: NEO.bg,
              borderRadius: NEO.radius,
              boxShadow: loading || code.length < 6 ? 'none' : NEO.shadow,
              cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={loading}
            className="w-full mt-3 py-2.5 text-sm font-medium transition-all"
            style={{
              background: 'transparent',
              color: NEO.ink,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Resend code
          </button>

          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="w-full mt-2 py-2.5 text-sm font-medium transition-all"
            style={{
              background: 'transparent',
              color: NEO.inkLight,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Use a different email
          </button>
        </form>
      )}

      {/* Footer */}
      <p
        className="text-center text-xs mt-8"
        style={{ color: NEO.inkLight }}
      >
        By continuing, you agree to our terms of service
      </p>
    </div>
  );

  if (isModal) {
    return (
      <>
        {content}
        <style>{`
          .animate-popIn {
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          input::placeholder {
            color: ${NEO.inkLight};
          }
        `}</style>
      </>
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
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`
        }}
      />

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${NEO.accent} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: 0.6
        }}
      />

      {content}

      <style>{`
        .animate-popIn {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        input::placeholder {
          color: ${NEO.inkLight};
        }
      `}</style>
    </div>
  );
}
