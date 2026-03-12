import React from 'react';
import { FileText, Upload, CheckCircle } from 'lucide-react';

const Parse = () => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    多格式文档解析
                </h1>
                <p className="text-gray-400 mt-2">支持 PDF、Word、TXT、MD、代码等 20+ 格式自动解析</p>
            </div>

            <div className="bg-gray-900/60 rounded-2xl p-8 border border-gray-700/50">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-10">
                    <Upload className="w-12 h-12 text-cyan-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">拖拽或点击上传文档</h3>
                    <p className="text-gray-400 text-sm mb-6">系统将自动识别格式并提取文本内容</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:shadow-lg transition">
                        选择文件
                    </button>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                            <div className="font-medium">论文.pdf</div>
                            <div className="text-xs text-gray-400">已解析完成 · 文本提取成功</div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Parse;