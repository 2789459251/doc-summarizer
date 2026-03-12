import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // 从 AuthContext 拿登录状态

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth(); // 同时拿 user 和 token

    useEffect(() => {
        // 关键：判断是否登录（只要 user 存在就算登录了）
        if (!user) {
            setLoading(false);
            setError('请先登录以查看历史记录');
            return;
        }

        // 有登录状态，才去请求历史
        const fetchHistories = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/history', {
                    headers: {
                        'Authorization': `Bearer ${token || localStorage.getItem('token')}`
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
    }, [user, token]); // 依赖 user，只要登录状态变了就重新判断

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">历史摘要</h2>

            {loading && <p className="text-gray-400">加载中...</p>}

            {!loading && error && (
                // 只有真的没登录时才显示红字，否则只显示错误提示
                <p className={user ? "text-red-400 mb-4" : "text-gray-400 mb-4"}>
                    {error}
                </p>
            )}

            {!loading && !error && history.length === 0 ? (
                <p className="text-gray-400">暂无历史摘要记录</p>
            ) : (
                history.map(item => (
                    <div key={item.id} className="bg-gray-800 p-4 mb-4 rounded">
                        <h3 className="text-white font-bold">{item.file_name}</h3>
                        <p className="text-gray-300 mt-2">{item.summary_chinese}</p>
                    </div>
                ))
            )}
        </div>
    );
}