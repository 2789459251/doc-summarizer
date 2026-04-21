import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // 初始化：优先从 localStorage 恢复登录状态
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    // 监听 401 等场景触发的登出事件，更新右上角登录状态
    useEffect(() => {
        const handleAuthLogout = () => setUser(null);
        window.addEventListener('auth:logout', handleAuthLogout);
        return () => window.removeEventListener('auth:logout', handleAuthLogout);
    }, []);

    // 登录：接收真实用户数据（不再需要模拟 username/password）
    const login = async (username, password, userData = null) => {
        try {
            // 如果传了 userData（从后端获取的），直接用；否则模拟
            const finalUserData = userData || {
                username,
                email: `${username}@example.com`
            };

            // 更新状态 + 持久化
            setUser(finalUserData);
            localStorage.setItem('user', JSON.stringify(finalUserData));

            return finalUserData;
        } catch (err) {
            throw new Error('登录状态更新失败');
        }
    };

    // 注册（保留原有逻辑）
    const register = async (username, email, password) => {
        if (!username || !email || !password) {
            throw new Error('请填写完整信息');
        }
        return true;
    };

    // 退出登录
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}