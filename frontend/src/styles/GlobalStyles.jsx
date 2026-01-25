import { useEffect } from 'react';
import { theme } from './theme';

/**
 * Global styles component for dark mode
 * Injects CSS reset and base styles optimized for mobile
 */
const GlobalStyles = () => {
  useEffect(() => {
    // Inject global styles
    const style = document.createElement('style');
    style.textContent = `
      /* CSS Reset */
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* Root styles */
      :root {
        --color-bg-primary: ${theme.colors.background.primary};
        --color-bg-secondary: ${theme.colors.background.secondary};
        --color-bg-tertiary: ${theme.colors.background.tertiary};
        --color-primary: ${theme.colors.primary.main};
        --color-text-primary: ${theme.colors.text.primary};
        --color-text-secondary: ${theme.colors.text.secondary};
        --color-border: ${theme.colors.border.main};
      }

      /* HTML & Body */
      html {
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        /* Prevent text size adjustment on orientation change */
        -webkit-text-size-adjust: 100%;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: ${theme.typography.fontFamily.primary};
        font-size: ${theme.typography.fontSize.base};
        font-weight: ${theme.typography.fontWeight.normal};
        line-height: ${theme.typography.lineHeight.normal};
        color: ${theme.colors.text.primary};
        background-color: ${theme.colors.background.primary};
        overflow-x: hidden;
        /* Prevent pull-to-refresh on mobile */
        overscroll-behavior-y: contain;
        /* Enable smooth scrolling */
        scroll-behavior: smooth;
      }

      /* Mobile viewport fixes */
      #root {
        min-height: 100vh;
        min-height: -webkit-fill-available;
        width: 100%;
        position: relative;
      }

      /* Remove default button styles */
      button {
        font-family: inherit;
        border: none;
        background: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      /* Remove default input styles */
      input, textarea, select {
        font-family: inherit;
        font-size: inherit;
        border: none;
        background: none;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
      }

      /* Remove input zoom on iOS */
      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="number"],
      textarea {
        font-size: 16px; /* Prevents zoom on iOS */
      }

      /* Remove link default styles */
      a {
        color: inherit;
        text-decoration: none;
        -webkit-tap-highlight-color: transparent;
      }

      /* List styles */
      ul, ol {
        list-style: none;
      }

      /* Image styles */
      img {
        display: block;
        max-width: 100%;
        height: auto;
      }

      /* Selection color */
      ::selection {
        background-color: ${theme.colors.primary.main};
        color: ${theme.colors.text.inverse};
      }

      /* Scrollbar styles (Webkit) */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: ${theme.colors.background.secondary};
      }

      ::-webkit-scrollbar-thumb {
        background: ${theme.colors.border.strong};
        border-radius: ${theme.borderRadius.full};
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${theme.colors.primary.dark};
      }

      /* Custom focus styles */
      *:focus-visible {
        outline: 2px solid ${theme.colors.primary.main};
        outline-offset: 2px;
      }

      /* Disable focus outline for mouse users */
      *:focus:not(:focus-visible) {
        outline: none;
      }

      /* Touch feedback */
      button:active,
      a:active {
        opacity: 0.7;
        transform: scale(0.98);
      }

      /* Prevent text selection on buttons */
      button, .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }

      /* Safe area insets for notched devices */
      @supports (padding-top: env(safe-area-inset-top)) {
        body {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
      }

      /* Animations */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      /* Utility classes */
      .fade-in {
        animation: fadeIn ${theme.animation.normal} ${theme.easing.default};
      }

      .slide-up {
        animation: slideUp ${theme.animation.normal} ${theme.easing.default};
      }

      .pulse {
        animation: pulse 2s ${theme.easing.default} infinite;
      }

      /* Skeleton loader */
      .skeleton {
        background: linear-gradient(
          90deg,
          ${theme.colors.background.secondary} 0%,
          ${theme.colors.background.tertiary} 50%,
          ${theme.colors.background.secondary} 100%
        );
        background-size: 1000px 100%;
        animation: shimmer 2s infinite linear;
      }

      /* Text truncation */
      .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default GlobalStyles;
