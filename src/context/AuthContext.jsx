// src/context/AuthContext.js
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // 模拟登录
    const login = async (username, password) => {
        // 简单验证，实际项目替换为接口请求
        if (!username || !password) {
            throw new Error('用户名和密码不能为空');
        }
        // 模拟登录成功
        setUser({ username, email: `${username}@example.com` });
    };

    // 模拟注册
    const register = async (username, email, password) => {
        if (!username || !email || !password) {
            throw new Error('请填写完整信息');
        }
        // 模拟注册成功
        return true;
    };

    // 退出登录
    const logout = () => {
        setUser(null);
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