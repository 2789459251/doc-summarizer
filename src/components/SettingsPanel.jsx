import { useState } from 'react';

export default function SettingsPanel({ onSettingsChange }) {
    const [role, setRole] = useState('开发者');
    const [style, setStyle] = useState('技术深度');
    const [lang, setLang] = useState('中文');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSettingsChange({ role, style, lang });
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">个性化摘要定制</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">用户角色：</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option>开发者</option>
                        <option>测试</option>
                        <option>产品</option>
                        <option>管理</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1">摘要风格：</label>
                    <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option>技术深度</option>
                        <option>详细程度</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1">多语言支持：</label>
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option>中文</option>
                        <option>英文</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    保存设置
                </button>
            </form>
        </div>
    );
}