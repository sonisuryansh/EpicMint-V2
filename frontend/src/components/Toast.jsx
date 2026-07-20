import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const icons = {
        success: '✅',
        error: '⚠️',
        warning: '⚡',
        info: 'ℹ️',
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast-item ${toast.type}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <span>{icons[toast.type] || 'ℹ️'}</span>
                        <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
                        <button
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                            onClick={(e) => { e.stopPropagation(); removeToast(toast.id) }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) {
        return { addToast: () => {} }
    }
    return ctx
}

export default ToastProvider
