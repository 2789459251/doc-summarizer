// src/pages/Login.jsx
// DocSummAI Pro - 登录页（基于 UI/UX Pro Max 设计规范 v2.0）
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const { isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login: authLogin } = useAuth();

    // 处理登录提交（适配后端 Form 格式）
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '登录失败，用户名或密码错误');
            }

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('token_type', data.token_type);

            const userResponse = await fetch('http://localhost:8000/api/me', {
                method: 'GET',
                headers: {
                    'Authorization': `${data.token_type} ${data.access_token}`
                },
                credentials: 'include'
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                localStorage.setItem('user', JSON.stringify(userData));
                await authLogin(userData.username, password);
                onLoginSuccess && onLoginSuccess(userData);
            }

        } catch (err) {
            setError(err.message || '登录失败，请检查账号信息');
        } finally {
            setLoading(false);
        }
    };

    /* 输入框统一样式 */
    const inputClass = `w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:opacity-50 ${
        isDarkMode 
            ? 'bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-500' 
            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
    }`;

    return (
        <div className={`w-full max-w-md mx-auto rounded-2xl p-8 border transition-colors duration-normal animate-scale-in ${
            isDarkMode 
                ? 'bg-black/40 backdrop-blur-xl border-white/[0.08]' 
                : 'bg-white border-gray-200 shadow-xl shadow-primary-500/[0.04]'
        }`}>
            {/* 标题 */}
            <header className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
                    isDarkMode ? 'bg-gradient-to-br from-cyan-500/15 to-blue-500/15' : 'bg-gradient-to-br from-orange-100 to-amber-100'
                }`}>
                    <User className={`w-7 h-7 ${isDarkMode ? 'text-cyan-400' : 'text-primary-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1.5`}>
                    用户登录
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    欢迎使用 DocSummAI Pro
                </p>
            </header>

            {/* 错误提示 */}
            {error && (
                <div className={`mb-5 p-3.5 rounded-lg text-sm font-medium flex items-start gap-2.5 animate-slide-up ${
                    isDarkMode 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-300' 
                        : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                    <span>⚠</span> {error}
                </div>
            )}

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* 用户名 */}
                <div>
                    <label className={`block text-xs font-medium mb-1.5 ml-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        用户名
                    </label>
                    <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <input type="text" placeholder="输入用户名" value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               className={inputClass} disabled={loading}
                               autoComplete="username" />
                    </div>
                </div>

                {/* 密码 */}
                <div>
                    <label className={`block text-xs font-medium mb-1.5 ml-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        密码
                    </label>
                    <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <input type={showPassword ? 'text' : 'password'}
                               placeholder="输入密码" value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className={`${inputClass} pr-11`} disabled={loading}
                               autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-fast ${
                                    isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                }`}>
                            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                    </div>
                </div>

                {/* 登录按钮 */}
                <button type="submit" disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-normal active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDarkMode
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-orange'
                                : 'bg-gradient-to-r from-primary-500 to-orange-500 hover:from-primary-600 hover:to-orange-600 shadow-orange'
                        }`}>
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            登录
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* 注册链接 */}
            <footer className={`mt-6 pt-5 border-t text-center text-sm transition-colors ${
                isDarkMode ? 'border-white/[0.06] text-gray-500' : 'border-gray-100 text-gray-500'
            }`}>
                还没有账号？
                <button type="button"
                        onClick={() => onSwitchToRegister && onSwitchToRegister()}
                        className={`font-medium ml-1 transition-colors duration-fast hover:underline ${
                            isDarkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
                        }`}>
                    立即注册 →
                </button>
            </footer>
        </div>
    );
};

export default Login;
