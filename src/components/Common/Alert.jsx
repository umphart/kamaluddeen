// src/components/Common/Alert.jsx
import React, { useEffect, useState } from 'react';
import './Alert.css'; // Optional CSS file for custom styles

const Alert = ({ 
  type = 'success', 
  message, 
  title, 
  duration = 5000, 
  onClose,
  showCloseButton = true,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left, center
  variant = 'default' // default, minimal, filled, outline, modern
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      // Progress bar animation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - (100 / (duration / 50));
        });
      }, 50);

      // Auto dismiss
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  // Define multiple style variants
  const variants = {
    default: {
      success: {
        container: 'bg-green-50 border border-green-200 shadow-lg',
        icon: 'text-green-500',
        title: 'text-green-800',
        message: 'text-green-700',
        progress: 'bg-green-500',
        close: 'text-green-500 hover:text-green-700',
      },
      error: {
        container: 'bg-red-50 border border-red-200 shadow-lg',
        icon: 'text-red-500',
        title: 'text-red-800',
        message: 'text-red-700',
        progress: 'bg-red-500',
        close: 'text-red-500 hover:text-red-700',
      },
      warning: {
        container: 'bg-yellow-50 border border-yellow-200 shadow-lg',
        icon: 'text-yellow-500',
        title: 'text-yellow-800',
        message: 'text-yellow-700',
        progress: 'bg-yellow-500',
        close: 'text-yellow-500 hover:text-yellow-700',
      },
      info: {
        container: 'bg-blue-50 border border-blue-200 shadow-lg',
        icon: 'text-blue-500',
        title: 'text-blue-800',
        message: 'text-blue-700',
        progress: 'bg-blue-500',
        close: 'text-blue-500 hover:text-blue-700',
      },
    },
    minimal: {
      success: {
        container: 'bg-white border-l-4 border-l-green-500 shadow-md',
        icon: 'text-green-500',
        title: 'text-gray-800',
        message: 'text-gray-600',
        progress: 'bg-green-500',
        close: 'text-gray-400 hover:text-gray-600',
      },
      error: {
        container: 'bg-white border-l-4 border-l-red-500 shadow-md',
        icon: 'text-red-500',
        title: 'text-gray-800',
        message: 'text-gray-600',
        progress: 'bg-red-500',
        close: 'text-gray-400 hover:text-gray-600',
      },
    },
    filled: {
      success: {
        container: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
        icon: 'text-white',
        title: 'text-white',
        message: 'text-green-50',
        progress: 'bg-green-700',
        close: 'text-white hover:text-green-100',
      },
      error: {
        container: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg',
        icon: 'text-white',
        title: 'text-white',
        message: 'text-red-50',
        progress: 'bg-red-700',
        close: 'text-white hover:text-red-100',
      },
    },
    modern: {
      success: {
        container: 'bg-white border border-gray-100 shadow-xl rounded-xl backdrop-blur-sm bg-opacity-95',
        icon: 'text-emerald-500',
        title: 'text-gray-900',
        message: 'text-gray-600',
        progress: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
        close: 'text-gray-400 hover:text-gray-600',
      },
      error: {
        container: 'bg-white border border-gray-100 shadow-xl rounded-xl backdrop-blur-sm bg-opacity-95',
        icon: 'text-rose-500',
        title: 'text-gray-900',
        message: 'text-gray-600',
        progress: 'bg-gradient-to-r from-rose-400 to-rose-500',
        close: 'text-gray-400 hover:text-gray-600',
      },
    }
  };

  // Icons for each type
  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  // Position classes
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  const style = variants[variant]?.[type] || variants.default[type];
  const positionClass = positions[position] || positions['top-right'];

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className={`fixed z-50 max-w-md animate-slideIn ${positionClass}`}>
      <div className={`rounded-lg overflow-hidden ${style.container}`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${style.icon}`}>
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={`text-sm font-semibold ${style.title}`}>
                  {title}
                </h3>
              )}
              <div className={`mt-1 text-sm ${style.message}`}>
                {message}
              </div>
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className={`flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-5 transition-colors ${style.close}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {duration > 0 && (
          <div className="h-1 w-full bg-gray-200 bg-opacity-50 overflow-hidden">
            <div 
              className={`h-full ${style.progress} transition-all duration-50 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;