import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, Loader2, Sparkles } from 'lucide-react';

const Parse = () => {
    // 粒度选择
    const [summaryLength, setSummaryLength] = useState('standard');
    const [hasUserSelected, setHasUserSelected] = useState(false);

    // 粒度选项
    const grainularityOptions = [
        { key: 'concise', label: '简洁', icon: '📋', desc: '快速概览' },
        { key: 'standard', label: '标准', icon: '📄', desc: '平衡信息' },
        { key: 'detailed', label: '详细', icon: '📑', desc: '完整理解' }
    ];

    // 粒度限制
    const grainularityLimits = {
        concise: { min: 50, label: '简洁摘要' },
        standard: { min: 100, label: '标准摘要' },
        detailed: { min: 200, label: '详细摘要' }
    };

    return (
        <div className="space-y-8">
            {/* 标题区 - 蓝色字体 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    多格式文档解析
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">支持 PDF、Word、TXT、MD、代码等 20+ 格式自动解析</p>
            </div>

            {/* 主内容卡片 - 橙色边框，白色背景 */}
            <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-8 border-2 border-primary-500 shadow-sm">
                {/* 上传区域 */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 bg-gray-50/50 dark:bg-transparent">
                    <Upload className="w-12 h-12 text-cyan-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">拖拽或点击上传文档</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">系统将自动识别格式并提取文本内容</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:shadow-lg transition text-white font-medium">
                        选择文件
                    </button>
                </div>

                {/* 粒度选择区域 */}
                <div className="mt-8">
                    <label className="block text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium">
                        选择摘要粒度
                        {!hasUserSelected && (
                            <span className="inline-flex items-center gap-1 ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                                <Sparkles className="w-3 h-3" />
                                推荐
                            </span>
                        )}
                        {hasUserSelected && (
                            <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                                已选择：{grainularityLimits[summaryLength]?.label}
                            </span>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {grainularityOptions.map((level) => (
                            <button
                                key={level.key}
                                onClick={() => {
                                    setSummaryLength(level.key);
                                    setHasUserSelected(true);
                                }}
                                className={`
                                    flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-all min-w-[90px]
                                    ${summaryLength === level.key
                                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-400'
                                        : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
                                    }
                                `}
                            >
                                <span className="text-xl mb-1">{level.icon}</span>
                                <span className="font-semibold text-sm">{level.label}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{level.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 已上传文件列表 */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <FileText className="w-5 h-5 text-cyan-500" />
                        <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">论文.pdf</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">已解析完成 · 文本提取成功</div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                </div>

                {/* 摘要结果预览 */}
                <div className="mt-8 p-6 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">摘要结果</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">（约 150 字符）</span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        点击上方粒度按钮切换不同长度的摘要，系统将根据您选择的长度自动调整摘要内容...
                    </div>
                </div>
            </div>

            {/* 功能说明卡片 - 橙色边框，白色背景 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">📋</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">简洁摘要</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">快速概览核心要点，适合快速浏览</p>
                </div>
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">📄</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">标准摘要</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">平衡信息量与篇幅，适合一般阅读</p>
                </div>
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">📑</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">详细摘要</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">完整理解内容，适合深度学习</p>
                </div>
            </div>
        </div>
    );
};

export default Parse;
