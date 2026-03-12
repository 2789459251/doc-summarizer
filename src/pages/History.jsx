// pages/History.js（修改后）
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setError('请先登录以查看历史记录');
            return;
        }

        // 关键：添加 Token 到请求头（后端需要鉴权）
        axios.get('http://localhost:8000/api/history', {
            headers: {
                'Authorization': `Bearer ${token}`, // 必须加 Token
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
            .then(res => {
                setHistory(res.data);
                setError('');
            })
            .catch(err => {
                console.error('获取历史记录失败:', err);
                setError('获取历史记录失败，请重试');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">历史摘要</h2>

            {loading && <p className="text-gray-400">加载中...</p>}
            {error && <p className="text-red-400 mb-4">{error}</p>}

            {!loading && !error && (
                <>
                    {history.length === 0 ? (
                        <p className="text-gray-400">暂无历史摘要记录</p>
                    ) : (
                        history.map(item => (
                            <div key={item.id} className="bg-gray-800 p-4 mb-4 rounded-lg border border-gray-700">
                                <h3 className="text-white font-bold">{item.file_name}</h3>
                                <p className="text-gray-300 mt-2 text-sm">
                                    生成时间：{new Date(item.create_time).toLocaleString()}
                                </p>
                                <p className="text-gray-300 mt-2">{item.summary_chinese}</p>
                                {/* 可选：显示英文摘要 */}
                                {item.summary_english && (
                                    <p className="text-gray-300 mt-2 text-purple-400">
                                        {item.summary_english}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}