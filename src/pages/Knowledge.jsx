import React from 'react';
import { Brain } from 'lucide-react';

const Knowledge = () => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
                    领域知识增强
                </h1>
                <p className="text-gray-400 mt-2">结合专业知识库，让摘要更专业、更准确</p>
            </div>

            <div className="bg-gray-900/60 rounded-2xl p-8 border border-gray-700/50">
                <Brain className="w-12 h-12 text-pink-400 mx-auto mb-6" />

                <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium">计算机学科</h4>
                        <p className="text-xs text-gray-400">算法、网络、操作系统、AI、编译原理</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium">医学领域</h4>
                        <p className="text-xs text-gray-400">病例、文献、指南、临床术语</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium">法律财经</h4>
                        <p className="text-xs text-gray-400">合同、条款、财报、政策文件</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Knowledge;