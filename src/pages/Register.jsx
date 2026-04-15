import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

    // 处理注册提交（适配后端 JSON 格式）
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. 前端验证
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
        setSuccess('');

        try {
            // 2. 发送注册请求（后端接收 JSON 格式）
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
               // credentials: 'include'
            });

            // 3. 处理响应
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '注册失败，用户名已存在');
            }

            const data = await response.json();

            // 4. 注册成功
            setSuccess('注册成功！即将跳转到登录页面...');
            console.log('注册成功:', data);

            // 延迟跳转到登录页
            setTimeout(() => {
                onRegisterSuccess && onRegisterSuccess();
                // 也可以直接跳转
                if (window.location) {
                    window.location.href = '#/login';
                }
            }, 2000);

        } catch (err) {
            setError(err.message || '注册失败，请稍后重试');
            console.error('注册错误:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}/50`}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">用户注册</h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>创建你的 DocSummAI Pro 账号</p>
            </div>

            {/* 错误/成功提示 */}
            {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    {success}
                </div>
            )}

            {/* 注册表单 */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 用户名输入框 */}
                <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <User className="w-5 h-5"/>
                    </div>
                    <input
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500`}
                        disabled={loading}
                        maxLength={20}
                    />
                </div>

                {/* 密码输入框 */}
                <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Lock className="w-5 h-5"/>
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="设置密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-3 ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500`}
                        disabled={loading}
                        minLength={6}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-white`}
                        disabled={loading}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                </div>

                {/* 确认密码输入框 */}
                <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Lock className="w-5 h-5"/>
                    </div>
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="确认密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-3 ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500`}
                        disabled={loading}
                        minLength={6}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-white`}
                        disabled={loading}
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                </div>

                {/* 注册按钮 */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            注册账号
                            <ArrowRight className="w-4 h-4"/>
                        </>
                    )}
                </button>
            </form>

            {/* 登录链接 */}
            <div className={`mt-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                已有账号？{" "}
                <button
                    onClick={() => {
                        if (window.location) {
                            window.location.href = '#/login';
                        }
                    }}
                    className="text-cyan-400 hover:text-cyan-300"
                >
                    立即登录
                </button>
            </div>
        </div>
    );
};

export default Register;