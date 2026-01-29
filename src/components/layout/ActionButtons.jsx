/**
 * ActionButtons Component
 * 右下角操作按钮 - 分享
 */
import React, { useState } from 'react';
import { NEO } from '../../styles/theme';
import { IconShare } from '../../icons';
import { db, tx } from '../../lib/db';

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function SharePopup({ isOpen, onClose, canvasId, visibility, isOwner, onVisibilityChange }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVisibilityToggle = (newVisibility) => {
    if (canvasId && isOwner) {
      db.transact([tx.canvases[canvasId].update({ visibility: newVisibility })]);
      onVisibilityChange?.(newVisibility);
    }
  };

  if (!isOpen) return null;

  // Generate QR code URL using a free API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200]"
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="fixed z-[201] animate-popIn"
        style={{
          bottom: '80px',
          right: '24px',
          width: '320px',
          background: NEO.surface,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${NEO.border}`,
          borderRadius: NEO.radiusLg,
          boxShadow: NEO.shadowHover,
          padding: '24px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: NEO.ink }}>
            Share this canvas
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-all hover:bg-black/5"
            style={{ color: NEO.inkLight }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* QR Code */}
        <div
          className="flex items-center justify-center mb-5 p-4 rounded-xl"
          style={{
            background: 'white',
            border: `1px solid ${NEO.border}`,
          }}
        >
          <img
            src={qrCodeUrl}
            alt="QR Code"
            width={180}
            height={180}
            style={{ borderRadius: '8px' }}
          />
        </div>

        {/* URL display */}
        <div
          className="flex items-center gap-2 p-3 mb-4 rounded-lg"
          style={{
            background: NEO.bg,
            border: `1px solid ${NEO.border}`,
          }}
        >
          <span
            className="flex-1 text-sm truncate"
            style={{ color: NEO.inkLight }}
          >
            {shareUrl}
          </span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all hover:scale-[1.02]"
          style={{
            background: copied ? '#10B981' : NEO.ink,
            color: NEO.bg,
            borderRadius: NEO.radius,
            boxShadow: NEO.shadow,
          }}
        >
          {copied ? (
            <>
              <CheckIcon />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon />
              Copy Link
            </>
          )}
        </button>

        {/* Visibility Toggle - Owner Only */}
        {isOwner && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: NEO.border }}>
            <p className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: NEO.inkLight }}>
              Share Access
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleVisibilityToggle('readonly')}
                className="flex-1 py-2.5 px-3 text-sm font-medium transition-all rounded-lg hover:scale-[1.02]"
                style={{
                  background: visibility === 'readonly' ? '#F59E0B' : NEO.bg,
                  color: visibility === 'readonly' ? 'white' : NEO.ink,
                  border: `1px solid ${visibility === 'readonly' ? '#F59E0B' : NEO.border}`,
                  cursor: 'pointer',
                }}
              >
                Readonly
              </button>
              <button
                onClick={() => handleVisibilityToggle('public')}
                className="flex-1 py-2.5 px-3 text-sm font-medium transition-all rounded-lg hover:scale-[1.02]"
                style={{
                  background: visibility === 'public' ? '#10B981' : NEO.bg,
                  color: visibility === 'public' ? 'white' : NEO.ink,
                  border: `1px solid ${visibility === 'public' ? '#10B981' : NEO.border}`,
                  cursor: 'pointer',
                }}
              >
                Public
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: NEO.inkLight }}>
              {visibility === 'readonly'
                ? 'Shared users can view, only you can edit'
                : 'Shared users can view and edit'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export const ActionButtons = ({ canvasId, visibility, isOwner, onVisibilityChange }) => {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[140]">
        <button
          onClick={() => setShowShare(true)}
          className="group relative"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            backgroundColor: NEO.ink,
            boxShadow: NEO.shadowHover,
            color: NEO.bg,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <IconShare />
          <div
            className="absolute right-full mr-3 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap pointer-events-none"
            style={{
              borderRadius: NEO.radius,
              background: NEO.ink,
              color: NEO.bg,
            }}
          >
            Share
          </div>
        </button>
      </div>

      <SharePopup
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        canvasId={canvasId}
        visibility={visibility}
        isOwner={isOwner}
        onVisibilityChange={onVisibilityChange}
      />
    </>
  );
};

export default ActionButtons;
