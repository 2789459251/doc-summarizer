import React, { useEffect, useState } from 'react';
import { UserIcon, History as HistoryIcon, Settings, Shield, Clock, LogOut, Mail, FileText } from 'lucide-react';
import History from './History';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/api';

const Profile = ({ user, logout, onGoToLogin }) => {
  const { isDarkMode } = useTheme();
  const { token } = useAuth();
  const [userStats, setUserStats] = useState({ total_docs: 0, weekly_docs: 0, join_date: '' });
  const [loadingStats, setLoadingStats] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [summaryStyle, setSummaryStyle] = useState('standard');
  const [defaultLanguage, setDefaultLanguage] = useState('chinese');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const userData = user || { username: '未登录用户', email: '暂无邮箱' };
  const panelClass = `${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-orange-200'} backdrop-blur-sm rounded-2xl p-6 border`;
  const inputClass = `w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-orange-50 border-orange-200 text-gray-800'}`;
  const actionBtnClass = `px-6 py-2 rounded-lg transition disabled:opacity-50 ${isDarkMode ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-orange-500 text-white hover:bg-orange-600'}`;

  useEffect(() => {
    if (!user) { setLoadingStats(false); return; }
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stats`, { headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` } });
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

  const handlePanelToggle = (panelId) => setActivePanel(activePanel === panelId ? null : panelId);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) { alert('请填写旧密码和新密码'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('old_password', oldPassword);
      formData.append('new_password', newPassword);
      const res = await fetch(`${API_BASE}/api/change-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) {
        alert('密码修改成功！');
        setOldPassword('');
        setNewPassword('');
      } else {
        const err = await res.json();
        alert(`修改失败：${err.detail || '未知错误'}`);
      }
    } catch (err) {
      console.error('修改密码请求失败:', err);
      alert('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const formData = new FormData();
      formData.append('summary_style', summaryStyle);
      formData.append('default_language', defaultLanguage);
      const res = await fetch(`${API_BASE}/api/save-preferences`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) {
        alert('个性化配置保存成功！');
      } else {
        const err = await res.json();
        alert(`保存失败：${err.detail || '未知错误'}`);
      }
    } catch (err) {
      console.error('保存偏好配置失败:', err);
      alert('网络错误，请稍后重试');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (!user) {
    return <div className="space-y-8 w-full p-6"><h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-orange-500'}`}>个人中心</h1><div className={`${panelClass} text-center p-12`}><div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} flex items-center justify-center`}><UserIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} /></div><h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>请先登录</h2><p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>登录后才能查看个人信息和处理历史</p><button onClick={onGoToLogin} className={actionBtnClass}>立即登录</button></div></div>;
  }

  return (
    <div className="w-full p-6 space-y-8">
      <div className="flex justify-between items-center"><h1 className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-orange-500'}`}>个人中心</h1><button onClick={logout} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'}`}><LogOut className="w-4 h-4" />退出登录</button></div>
      <div className={panelClass}><div className="flex items-center gap-6"><div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-yellow-500' : 'bg-orange-500'}`}><UserIcon className="w-10 h-10 text-white" /></div><div className="flex-1 grid grid-cols-2 gap-y-2"><div><div className="flex items-center gap-2"><span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{userData.username}</span><span className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-orange-100 text-orange-600'}`}>免费版</span></div><div className={`flex items-center gap-2 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><Mail className="w-4 h-4" /><span>邮箱：{userData.email}</span></div><div className={`flex items-center gap-2 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><FileText className="w-4 h-4" /><span>处理文档：{loadingStats ? '加载中...' : userStats.total_docs} 次</span></div></div><div className={`flex flex-col gap-2 items-end ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>注册时间：{loadingStats ? '加载中...' : userStats.join_date}</span></div><div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span>账号安全</span></div></div></div></div></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ id: 'account', icon: Settings, label: '账号设置', desc: '修改密码' }, { id: 'privacy', icon: Shield, label: '隐私安全', desc: '管理数据权限与授权' }, { id: 'stats', icon: Clock, label: '使用统计', desc: '查看文档处理趋势' }, { id: 'customize', icon: UserIcon, label: '个性化配置', desc: '定制摘要偏好' }].map((item) => <div key={item.id} onClick={() => handlePanelToggle(item.id)} className={`backdrop-blur-sm rounded-xl p-4 border transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900/40 border-gray-700 hover:border-yellow-500/30' : 'bg-white border-orange-200 hover:border-orange-400 shadow-sm'}`}><div className="flex items-center gap-3 mb-2"><div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500/10' : 'bg-orange-100'}`}><item.icon className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-orange-500'}`} /></div><span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.label}</span></div><p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p></div>)}</div>
      {activePanel === 'account' && <div className={panelClass}><h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>修改密码</h3><div className="space-y-4"><div><label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>旧密码</label><input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="请输入旧密码" className={inputClass} /></div><div><label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>新密码</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码" className={inputClass} /></div><button onClick={handleChangePassword} disabled={saving} className={actionBtnClass}>{saving ? '提交中...' : '确认修改'}</button></div></div>}
      {activePanel === 'privacy' && <div className={panelClass}><h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>隐私安全</h3><div className="space-y-4"><div className="flex items-center justify-between"><span className={isDarkMode ? 'text-white' : 'text-gray-800'}>允许保存文档处理历史</span><input type="checkbox" defaultChecked className={`w-5 h-5 ${isDarkMode ? 'accent-yellow-500' : 'accent-orange-500'}`} /></div><div className="flex items-center justify-between"><span className={isDarkMode ? 'text-white' : 'text-gray-800'}>允许匿名数据统计</span><input type="checkbox" defaultChecked className={`w-5 h-5 ${isDarkMode ? 'accent-yellow-500' : 'accent-orange-500'}`} /></div></div></div>}
      {activePanel === 'stats' && <div className={panelClass}><h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>使用统计</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}`}><div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-orange-500'}`}>{loadingStats ? '...' : userStats.total_docs}</div><div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>总处理文档数</div></div><div className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}`}><div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-orange-500'}`}>{loadingStats ? '...' : userStats.weekly_docs || 0}</div><div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>近 7 天处理数</div></div><div className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}`}><div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-orange-500'}`}>0</div><div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>本月处理数</div></div></div></div>}
      {activePanel === 'customize' && <div className={panelClass}><h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>个性化配置</h3><div className="space-y-6"><div><label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>默认摘要风格</label><select value={summaryStyle} onChange={(e) => setSummaryStyle(e.target.value)} className={inputClass}><option value="concise">简洁版</option><option value="standard">标准版</option><option value="detailed">详细版</option></select></div><div><label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>默认输出语言</label><select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className={inputClass}><option value="chinese">中文</option><option value="english">英文</option><option value="bilingual">中英双语</option></select></div><button onClick={handleSavePreferences} disabled={savingPrefs} className={actionBtnClass}>{savingPrefs ? '保存中...' : '保存偏好设置'}</button></div></div>}
      <div className="space-y-4"><div className="flex items-center gap-2"><HistoryIcon className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-orange-500'}`} /><h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>最近处理历史</h2></div><History /></div>
    </div>
  );
};

export default Profile;
