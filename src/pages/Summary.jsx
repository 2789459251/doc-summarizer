import React from 'react';
import { Layers, Copy, Download } from 'lucide-react';

const Summary = () => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    多粒度摘要生成
                </h1>
                <p className="text-gray-400 mt-2">简洁 / 标准 / 详细 / 章节级 / 全文级</p>
            </div>

            <div className="bg-gray-900/60 rounded-2xl p-8 border border-gray-700/50">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-semibold">摘要结果</h3>
                    <div className="flex gap-3">
                        <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                            <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-gray-800/50 rounded-xl text-gray-200">
                    本文主要介绍了文档智能解析与摘要系统的整体架构与实现方法，包括前端交互、后端接口、AI模型调用等内容。
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                    <button className="py-2 px-4 bg-gray-800 rounded-lg hover:bg-purple-500/20 transition">简洁版</button>
                    <button className="py-2 px-4 bg-gray-800 rounded-lg hover:bg-purple-500/20 transition">标准版</button>
                    <button className="py-2 px-4 bg-gray-800 rounded-lg hover:bg-purple-500/20 transition">详细版</button>
                </div>
            </div>
        </div>
    );
};

export default Summary;