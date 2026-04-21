// src/pages/Register.jsx
// DocSummAI Pro - 注册页（基于 UI/UX Pro Max 设计规范 v2.0）
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';

const Register = ({ onRegisterSuccess }) => {
    const { isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /* 输入框统一样式 */
    const inputClass = `w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:opacity-50 ${
        isDarkMode 
            ? 'bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-500' 
            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
    }`;

    // 处理注册提交
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password || !confirmPassword) {
            setError('请填写所有必填字段');
            return;
        }

        if (password.length < 6) {
            setError('密码长度不能少于6位');
            return;
        }

        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '注册失败，用户名已存在');
            }

            setSuccess('✅ 注册成功！即将跳转到登录页面...');
            setTimeout(() => {
                onRegisterSuccess && onRegisterSuccess();
                if (window.location) window.location.href = '#/login';
            }, 2000);

        } catch (err) {
            setError(err.message || '注册失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full max-w-md mx-auto rounded-2xl p-8 border transition-colors duration-normal animate-scale-in ${
            isDarkMode 
                ? 'bg-black/40 backdrop-blur-xl border-white/[0.08]' 
                : 'bg-white border-gray-200 shadow-xl shadow-primary-500/[0.04]'
        }`}>
            {/* 标题 */}
            <header className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
                    isDarkMode ? 'bg-gradient-to-br from-purple-500/15 to-pink-500/15' : 'bg-gradient-to-br from-purple-100 to-pink-100'
                }`}>
                    <User className={`w-7 h-7 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1.5`}>
                    用户注册
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    创建你的 DocSummAI Pro 账号
                </p>
            </header>

            {/* 错误提示 */}
            {error && (
                <div className={`mb-5 p-3.5 rounded-lg text-sm font-medium flex items-start gap-2.5 animate-slide-up ${
                    isDarkMode 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-300' 
                        : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                    ⚠ {error}
                </div>
            )}

            {/* 成功提示 */}
            {success && (
                <div className="mb-5 p-3.5 rounded-lg text-sm font-medium flex items-center gap-2.5 animate-slide-in-right bg-green-50 border border-green-200 text-green-700">
                    {success}
                </div>
            )}

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 用户名 */}
                <div>
                    <label className={`block text-xs font-medium mb-1.5 ml-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        用户名
                    </label>
                    <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input type="text" placeholder="设置用户名" value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               className={inputClass} disabled={loading} maxLength={20}
                               autoComplete="new-username" />
                    </div>
                </div>

                {/* 密码 */}
                <div>
                    <label className={`block text-xs font-medium mb-1.5 ml-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        设置密码（至少 6 位）
                    </label>
                    <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input type={showPassword ? 'text' : 'password'}
                               placeholder="输入密码" value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className={`${inputClass} pr-11`} disabled={loading} minLength={6}
                               autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-fast ${
                                    isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                }`}>
                            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                    </div>
                </div>

                {/* 确认密码 */}
                <div>
                    <label className={`block text-xs font-medium mb-1.5 ml-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        确认密码
                    </label>
                    <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input type={showConfirmPassword ? 'text' : 'password'}
                               placeholder="再次输入密码" value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               className={`${inputClass} pr-11`} disabled={loading} minLength={6}
                               autoComplete="new-password" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-fast ${
                                    isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                }`}>
                            {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                    </div>
                </div>

                {/* 注册按钮 */}
                <button type="submit" disabled={loading}
                        className={`w-full py-3 mt-2 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-normal active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDarkMode
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md'
                                : 'bg-gradient-to-r from-primary-500 to-orange-500 hover:from-primary-600 hover:to-orange-600 shadow-orange'
                        }`}>
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            注册账号
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* 登录链接 */}
            <footer className={`mt-6 pt-5 border-t text-center text-sm transition-colors ${
                isDarkMode ? 'border-white/[0.06] text-gray-500' : 'border-gray-100 text-gray-500'
            }`}>
                已有账号？
                <button onClick={() => window.location.href = '#/login'}
                        className={`font-medium ml-1 transition-colors duration-fast hover:underline ${
                            isDarkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
                        }`}>
                    立即登录 →
                </button>
            </footer>
        </div>
    );
};

export default Register;
