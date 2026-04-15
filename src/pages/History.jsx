import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FileText, Clock } from 'lucide-react'; // 可选：增加图标更美观

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        // 未登录：直接提示，不请求接口
        if (!user) {
            setLoading(false);
            setError('请先登录以查看历史记录');
            return;
        }

        // 已登录：请求历史记录
        const fetchHistories = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/history', {
                    headers: {
                        // 优先用 localStorage 的 token，更稳定
                        'Authorization': `Bearer ${localStorage.getItem('token') || token}`
                    },
                    withCredentials: true
                });
                setHistory(res.data);
                setError('');
            } catch (err) {
                console.error('获取历史记录失败:', err);
                setError('获取历史记录失败，请重试');
            } finally {
                setLoading(false);
            }
        };

        fetchHistories();
    }, [user, token]);

    return (
        <div className="p-6">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>历史摘要</h2>

            {/* 加载中 */}
            {loading && <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>加载中...</p>}

            {/* 错误/未登录提示 */}
            {!loading && error && (
                <p className={user ? (isDarkMode ? "text-red-400 mb-4" : "text-red-500 mb-4") : (isDarkMode ? "text-gray-400 mb-4" : "text-gray-500 mb-4")}>
                    {error}
                </p>
            )}

            {/* 无历史记录 */}
            {!loading && !error && history.length === 0 ? (
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>暂无历史摘要记录</p>
            ) : (
                // 历史记录列表（优化样式+显示文件名）
                history.map(item => (
                    <div key={item.id} className={`p-4 mb-4 rounded border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200 shadow-sm hover:border-orange-300'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-orange-500'}`} />
                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.file_name || '未知文件'}</h3>
                            <span className={`text-xs flex items-center gap-1 ml-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Clock className="w-3 h-3" />
                                {item.create_time ? new Date(item.create_time).toLocaleDateString() : ''}
                            </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.summary_chinese || item.summary_english || '暂无摘要内容'}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}