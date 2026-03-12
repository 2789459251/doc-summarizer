import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const Customize = () => {
    // 1. 状态管理：存储用户选择的配置 + 加载状态
    const [style, setStyle] = useState('学术严谨'); // 风格默认值
    const [purpose, setPurpose] = useState('学习笔记'); // 用途默认值
    const [isSaving, setIsSaving] = useState(false); // 保存按钮加载状态
    const [token, setToken] = useState(''); // 登录令牌

    // 2. 页面加载时：读取本地存储的 token + 获取用户已保存的配置
    useEffect(() => {
        // 从 localStorage 获取登录令牌（适配你的登录逻辑）
        const authToken = localStorage.getItem('token');
        if (authToken) {
            setToken(authToken);
            // 获取用户已保存的个性化配置
            fetchUserPreferences(authToken);
        }
    }, []);

    // 3. 后端接口：获取用户已保存的配置
    const fetchUserPreferences = async (authToken) => {
        try {
            const response = await fetch('http://localhost:8000/api/custom-summary', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // 同步后端返回的配置到前端下拉框
                setStyle(data.summary_style || '学术严谨');
                setPurpose(data.purpose || '学习笔记');
            } else {
                console.error('获取配置失败:', await response.json());
            }
        } catch (error) {
            console.error('网络错误:', error);
        }
    };

    // 4. 后端接口：保存用户个性化配置
    const savePreferences = async () => {
        // 登录验证：未登录提示先登录
        if (!token) {
            alert('请先登录后再保存个性化设置！');
            return;
        }

        setIsSaving(true);
        try {
            // 构建表单数据（和后端字段对应）
            const formData = new FormData();
            formData.append('summary_style', style);
            formData.append('purpose', purpose);

            const response = await fetch('http://localhost:8000/api/custom-summary', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // 携带登录令牌
                },
                body: formData
            });

            if (response.ok) {
                alert('个性化设置保存成功！');
            } else {
                const error = await response.json();
                alert(`保存失败：${error.detail || '未知错误'}`);
            }
        } catch (error) {
            console.error('保存配置失败:', error);
            alert('网络错误，请稍后重试！');
        } finally {
            setIsSaving(false); // 结束加载状态
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                    个性化摘要定制
                </h1>
                <p className="text-gray-400 mt-2">按你的风格、用途、长度定制输出</p>
            </div>

            <div className="bg-gray-900/60 rounded-2xl p-8 border border-gray-700/50 space-y-6">
                {/* 风格选择框 - 绑定状态 + 变更事件 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">风格</label>
                    <select
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                    >
                        <option>学术严谨</option>
                        <option>简洁口语</option>
                        <option>重点突出</option>
                    </select>
                </div>

                {/* 用途选择框 - 绑定状态 + 变更事件 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">用途</label>
                    <select
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                    >
                        <option>学习笔记</option>
                        <option>工作汇报</option>
                        <option>论文阅读</option>
                    </select>
                </div>

                {/* 保存按钮 - 绑定点击事件 + 加载状态 */}
                <button
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl hover:shadow-lg transition disabled:opacity-50"
                    onClick={savePreferences}
                    disabled={isSaving}
                >
                    {isSaving ? '保存中...' : '保存个性化设置'}
                </button>
            </div>
        </div>
    );
};

export default Customize;