import React from 'react';
import { User } from 'lucide-react';

const Customize = () => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                    个性化摘要定制
                </h1>
                <p className="text-gray-400 mt-2">按你的风格、用途、长度定制输出</p>
            </div>

            <div className="bg-gray-900/60 rounded-2xl p-8 border border-gray-700/50 space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">风格</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2">
                        <option>学术严谨</option>
                        <option>简洁口语</option>
                        <option>重点突出</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">用途</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2">
                        <option>学习笔记</option>
                        <option>工作汇报</option>
                        <option>论文阅读</option>
                    </select>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl hover:shadow-lg transition">
                    保存个性化设置
                </button>
            </div>
        </div>
    );
};

export default Customize;