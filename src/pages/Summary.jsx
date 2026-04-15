import React, { useState } from 'react';
import { ArrowRight, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';

const Summary = () => {
    // 转换格式选项
    const [conversionFormat, setConversionFormat] = useState('docx-to-pdf');
    const [conversionFile, setConversionFile] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [conversionMessage, setConversionMessage] = useState('');

    // 转换选项
    const conversionOptions = [
        { key: 'docx-to-pdf', from: 'Word', to: 'PDF', icon: FileText },
        { key: 'pdf-to-docx', from: 'PDF', to: 'Word', icon: FileText },
        { key: 'md-to-docx', from: 'MD', to: 'Word', icon: FileText },
        { key: 'docx-to-md', from: 'Word', to: 'MD', icon: FileText },
        { key: 'md-to-pdf', from: 'MD', to: 'PDF', icon: FileText },
        { key: 'pdf-to-md', from: 'PDF', to: 'MD', icon: FileText },
    ];

    // 处理文件选择
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setConversionFile(file);
            setConversionMessage('');
        }
    };

    // 处理格式转换
    const handleConversion = async () => {
        if (!conversionFile) {
            setConversionMessage('请先上传文件');
            return;
        }
        setIsConverting(true);
        setConversionMessage('正在转换...');

        // 模拟转换过程
        setTimeout(() => {
            setIsConverting(false);
            setConversionMessage('转换成功！文件已准备好下载。');
        }, 2000);
    };

    return (
        <div className="space-y-8">
            {/* 标题区 - 紫色字体 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    格式转换工具
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">支持 Word、PDF、Markdown 等常用文档格式互相转换</p>
            </div>

            {/* 主内容卡片 - 橙色边框，白色背景 */}
            <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-8 border-2 border-primary-500 shadow-sm">
                {/* 转换选项 */}
                <div className="mb-8">
                    <label className="block text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium">选择转换格式</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {conversionOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setConversionFormat(option.key)}
                                className={`
                                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                                    ${conversionFormat === option.key
                                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500 text-purple-700 dark:text-purple-400'
                                        : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
                                    }
                                `}
                            >
                                <span className="font-medium text-sm">{option.from}</span>
                                <ArrowRight className="w-4 h-4" />
                                <span className="font-medium text-sm">{option.to}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 上传区域 */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 bg-gray-50/50 dark:bg-transparent">
                    <Upload className="w-12 h-12 text-purple-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">上传要转换的文件</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        当前转换：{conversionOptions.find(o => o.key === conversionFormat)?.from} → {conversionOptions.find(o => o.key === conversionFormat)?.to}
                    </p>
                    <input
                        id="conversionFile"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.md,.txt"
                    />
                    <button
                        onClick={() => document.getElementById('conversionFile')?.click()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition text-white font-medium"
                    >
                        选择文件
                    </button>
                </div>

                {/* 已选文件 */}
                {conversionFile && (
                    <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-500" />
                            <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{conversionFile.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {(conversionFile.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleConversion}
                            disabled={isConverting}
                            className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition text-white text-sm font-medium disabled:opacity-50"
                        >
                            {isConverting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    转换中...
                                </span>
                            ) : (
                                '开始转换'
                            )}
                        </button>
                    </div>
                )}

                {/* 转换消息 */}
                {conversionMessage && (
                    <div className={`mt-6 p-4 rounded-lg text-center ${
                        conversionMessage.includes('成功')
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                        {conversionMessage.includes('成功') && <CheckCircle className="w-5 h-5 inline mr-2" />}
                        {conversionMessage}
                    </div>
                )}

                {/* 格式说明 */}
                <div className="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">转换说明：</p>
                    <ul className="space-y-1">
                        <li>• Word ↔ PDF：完整保留格式和排版</li>
                        <li>• Markdown ↔ Word：智能转换文本内容</li>
                        <li>• Markdown ↔ PDF：保留代码块和列表样式</li>
                    </ul>
                </div>
            </div>

            {/* 功能特点卡片 - 橙色边框，白色背景 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">快速转换</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">支持批量转换，几秒内完成</p>
                </div>
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">🔒</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">安全可靠</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">本地处理，保护您的隐私</p>
                </div>
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">📱</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">多端支持</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">支持各种设备和浏览器</p>
                </div>
            </div>
        </div>
    );
};

export default Summary;
