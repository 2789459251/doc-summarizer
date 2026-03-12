// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { UserIcon, History as HistoryIcon, Settings, Shield, Clock, LogOut } from 'lucide-react';
import History from './History';
import { useAuth } from '../context/AuthContext';

const Profile = ({ user, logout, onGoToLogin }) => {
    const { token } = useAuth();
    const [userStats, setUserStats] = useState({ total_docs: 0, weekly_docs: 0, join_date: '' });
    const [loadingStats, setLoadingStats] = useState(true);
    const [activePanel, setActivePanel] = useState(null);

    // 只保留修改密码需要的状态
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const userData = user || {
        username: '456',
        email: '456@example.com',
    };

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/stats', {
                    headers: {
                        'Authorization': `Bearer ${token || localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                setUserStats(data);
            } catch (err) {
                console.error('获取统计失败:', err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [user, token]);

    const handlePanelToggle = (panelId) => {
        setActivePanel(activePanel === panelId ? null : panelId);
    };

    // 只做一件事：修改密码
    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            alert('请填写旧密码和新密码');
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('old_password', oldPassword);
            formData.append('new_password', newPassword);

            const res = await fetch('http://localhost:8000/api/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || localStorage.getItem('token')}`
                },
                body: formData
            });

            if (res.ok) {
                alert('密码修改成功！');
                setOldPassword('');
                setNewPassword('');
            } else {
                const err = await res.json();
                alert(`修改失败：${err.detail}`);
            }
        } catch (err) {
            console.error('修改密码请求失败:', err);
            alert('网络错误，请稍后重试');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="space-y-8 w-full p-6">
                <h1 className="text-3xl font-bold text-yellow-400 mb-4">个人中心</h1>
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-800 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">请先登录</h2>
                    <p className="text-gray-400 mb-6">登录后才能查看个人信息和处理历史</p>
                    <button
                        onClick={onGoToLogin}
                        className="px-6 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition"
                    >
                        立即登录
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-yellow-400">个人中心</h1>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition"
                >
                    <LogOut className="w-4 h-4" />
                    退出登录
                </button>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-y-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white">{userData.username}</span>
                                <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">免费版</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                                <Mail className="w-4 h-4" />
                                <span>邮箱：{userData.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                                <FileText className="w-4 h-4" />
                                <span>处理文档：{loadingStats ? '加载中...' : userStats.total_docs} 次</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-gray-400">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>注册时间：{loadingStats ? '加载中...' : userStats.join_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>账号安全</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 四个功能框 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { id: 'account', icon: Settings, label: '账号设置', desc: '修改密码' },
                    { id: 'privacy', icon: Shield, label: '隐私安全', desc: '管理数据权限与授权' },
                    { id: 'stats', icon: Clock, label: '使用统计', desc: '查看文档处理趋势' },
                    { id: 'customize', icon: UserIcon, label: '个性化配置', desc: '定制摘要偏好' }
                ].map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => handlePanelToggle(item.id)}
                        className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-yellow-500/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                <item.icon className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="font-semibold text-white">{item.label}</span>
                        </div>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* ✅ 只保留：修改密码 */}
            {activePanel === 'account' && (
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">修改密码</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">旧密码</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="请输入旧密码"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">新密码</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="请输入新密码"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                            />
                        </div>
                        <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
                        >
                            {saving ? '保存中...' : '确认修改密码'}
                        </button>
                    </div>
                </div>
            )}

            {activePanel === 'privacy' && (
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">隐私安全</h3>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-lg text-gray-300">数据权限管理</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-white">允许保存文档处理历史</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-yellow-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white">允许匿名数据统计</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-yellow-500" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg text-gray-300">数据清理</h4>
                            <button className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">
                                清除所有历史记录
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activePanel === 'stats' && (
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">使用统计</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-800 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-1">
                                {loadingStats ? '加载中...' : userStats.total_docs}
                            </div>
                            <div className="text-gray-400 text-sm">总处理文档数</div>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-1">
                                {loadingStats ? '加载中...' : userStats.weekly_docs || 0}
                            </div>
                            <div className="text-gray-400 text-sm">近7天处理数</div>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-1">0</div>
                            <div className="text-gray-400 text-sm">本月处理数</div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <h4 className="text-lg text-gray-300 mb-3">处理趋势（近30天）</h4>
                        <div className="h-40 bg-gray-900 rounded-lg flex items-end p-4 gap-2">
                            {[1,3,5,2,7,4,6,8,3,5].map((val, idx) => (
                                <div
                                    key={idx}
                                    className="flex-1 bg-yellow-500/70 rounded-t-md"
                                    style={{ height: `${val * 10}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activePanel === 'customize' && (
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">个性化配置</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">默认摘要风格</label>
                            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                                <option>简洁版（核心要点）</option>
                                <option selected>标准版（完整概括）</option>
                                <option>详细版（深度分析）</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">默认输出语言</label>
                            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                                <option selected>中文</option>
                                <option>英文</option>
                                <option>中英双语</option>
                            </select>
                        </div>
                        <button className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition">
                            保存偏好设置
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">最近处理历史</h2>
                </div>
                <History />
            </div>
        </div>
    );
};

const Mail = ({ className }) => <span className={className}>✉️</span>;
const FileText = ({ className }) => <span className={className}>📄</span>;

export default Profile;