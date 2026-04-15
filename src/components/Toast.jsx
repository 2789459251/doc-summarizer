// Toast 错误提示组件 - 统一的错误/成功提示
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast 类型配置
const toastConfig = {
    error: {
        icon: AlertCircle,
        bgColor: 'bg-red-900/90',
        borderColor: 'border-red-500',
        textColor: 'text-red-100',
        iconColor: 'text-red-400'
    },
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-900/90',
        borderColor: 'border-green-500',
        textColor: 'text-green-100',
        iconColor: 'text-green-400'
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-900/90',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-100',
        iconColor: 'text-yellow-400'
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-900/90',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-100',
        iconColor: 'text-blue-400'
    }
};

// Toast 组件
const Toast = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);
    const config = toastConfig[toast.type] || toastConfig.info;
    const Icon = config.icon;

    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => onRemove(toast.id), 300);
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}
                shadow-lg backdrop-blur-sm min-w-[320px] max-w-[480px]
                transform transition-all duration-300
                ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
            `}
        >
            <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <div className={`font-semibold ${config.textColor} mb-1`}>
                        {toast.title}
                    </div>
                )}
                <div className={`${config.textColor} text-sm break-words`}>
                    {toast.message}
                </div>
                {toast.details && (
                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300 font-mono overflow-auto max-h-32">
                        {toast.details}
                    </div>
                )}
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className={`mt-2 px-3 py-1 text-sm ${config.textColor} bg-white/10 hover:bg-white/20 rounded transition`}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button
                onClick={handleClose}
                className={`${config.iconColor} hover:opacity-70 transition flex-shrink-0`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Toast 容器
const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

// Toast 上下文 Hook
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = ({ type = 'error', title, message, details, duration = 5000, action }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, title, message, details, duration, action }]);
        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toast = {
        error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
        success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
        warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
        info: (message, options = {}) => addToast({ type: 'info', message, ...options })
    };

    return { toasts, addToast, removeToast, toast };
};

export default ToastContainer;
