import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // 新增：引入 AuthContext

// 接收两个回调：登录成功、切换到注册
const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const { isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login: authLogin } = useAuth(); // 新增：获取 AuthContext 的 login 方法

    // 处理登录提交（适配后端 Form 格式）
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 简单验证
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. 创建 FormData（匹配后端 Form 格式）
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            // 2. 发送登录请求（后端地址：localhost:8000）
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                body: formData,  // 发送 FormData 而非 JSON
                credentials: 'include'  // 携带 cookie
            });

            // 3. 处理响应
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '登录失败，用户名或密码错误');
            }

            // 4. 登录成功处理
            console.log('登录成功:', data);
            // 保存 token 到本地存储
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('token_type', data.token_type);

            // 获取用户信息
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

                // 新增：同步更新 AuthContext 的 user 状态（关键）
                await authLogin(userData.username, password); // 调用 Context 的 login 方法

                // 调用父组件登录成功回调
                onLoginSuccess && onLoginSuccess(userData);
            }

        } catch (err) {
            setError(err.message || '登录失败，请检查账号信息');
            console.error('登录错误:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}/50`}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">用户登录</h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>欢迎使用 DocSummAI Pro</p>
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* 登录表单 */}
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
                    />
                </div>

                {/* 密码输入框 */}
                <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Lock className="w-5 h-5"/>
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-3 ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500`}
                        disabled={loading}
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

                {/* 登录按钮 */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            登录
                            <ArrowRight className="w-4 h-4"/>
                        </>
                    )}
                </button>
            </form>

            {/* 注册链接 - 修复点击跳转逻辑 */}
            <div className={`mt-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                还没有账号？{" "}
                <button
                    type="button"  // 必须加 type="button" 防止表单提交
                    onClick={() => {
                        // 调用父组件的切换注册回调
                        onSwitchToRegister && onSwitchToRegister();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    立即注册
                </button>
            </div>
        </div>
    );
};

export default Login;