/**
 * AppWithAuth - Authentication wrapper for the main app
 */
import React, { useState, useEffect, useRef } from 'react';
import { db } from './lib/db';
import App from './App';
import Auth from './components/auth/Auth';
import BoardsPage from './components/boards/BoardsPage';
import LandingPage from './components/landing/LandingPage';
import { NEO } from './styles/theme';
import { getStoredAuthToken, clearStoredAuthToken } from './lib/authStorage';

function LoadingScreen() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
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

      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 flex items-center justify-center animate-pulse"
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
        <span style={{ color: NEO.inkLight, fontSize: '14px' }}>Loading...</span>
      </div>
    </div>
  );
}

export default function AppWithAuth() {
  const { isLoading, user, error } = db.useAuth();
  const [selectedCanvasId, setSelectedCanvasId] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const restoreAttemptedRef = useRef(false);

  // Check for canvas ID in URL hash or localStorage
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setSelectedCanvasId(hash);
    }
  }, []);

  useEffect(() => {
    if (restoreAttemptedRef.current) return;
    if (isLoading || user || error) return;
    const token = getStoredAuthToken();
    restoreAttemptedRef.current = true;
    if (!token) return;
    setIsRestoring(true);
    db.auth
      .signInWithToken(token)
      .catch(() => {
        clearStoredAuthToken();
      })
      .finally(() => {
        setIsRestoring(false);
      });
  }, [isLoading, user, error]);

  // Update URL hash when canvas changes
  useEffect(() => {
    if (selectedCanvasId) {
      window.location.hash = selectedCanvasId;
    } else {
      window.location.hash = '';
    }
  }, [selectedCanvasId]);

  const handleSelectBoard = (canvasId) => {
    setSelectedCanvasId(canvasId);
  };

  const handleBack = () => {
    setSelectedCanvasId(null);
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // If there's a canvas ID in URL, show the canvas immediately (don't wait for auth)
  // Public/readonly canvases can be viewed without login
  // The App component will handle access control based on canvas visibility
  if (selectedCanvasId) {
    return (
      <App
        canvasId={selectedCanvasId}
        onBack={handleBack}
        user={user}
        authLoading={isLoading || isRestoring}
      />
    );
  }

  // For other pages (boards, auth), wait for auth to load
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isRestoring) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{ background: NEO.bg }}
      >
        <div
          className="text-center p-8"
          style={{
            background: NEO.surface,
            borderRadius: NEO.radiusLg,
            boxShadow: NEO.shadow,
          }}
        >
          <p style={{ color: '#DC2626', marginBottom: '16px' }}>
            Authentication error: {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium"
            style={{
              background: NEO.ink,
              color: NEO.bg,
              borderRadius: NEO.radius,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show landing page when no user is logged in
  if (!user) {
    return (
      <div className="relative">
        <LandingPage onLoginClick={handleLoginClick} />
        {showAuthModal && (
          <Auth isModal={true} onClose={handleCloseAuthModal} />
        )}
      </div>
    );
  }

  // Show boards page
  return <BoardsPage onSelectBoard={handleSelectBoard} />;
}
