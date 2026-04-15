// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { Zap, Upload, Brain, FileText, CheckCircle, Copy, Download } from 'lucide-react';

const HomePage = ({
                      uploadedFile, setUploadedFile,
                      uploadProgress, setUploadProgress,
                      isProcessing, setIsProcessing,
                      fileId, setFileId,
                      text, setText,
                      summaryType, setSummaryType,
                      summaryLength, setSummaryLength,
                      outputLanguage, setOutputLanguage,
                      chineseSummary, setChineseSummary,
                      englishSummary, setEnglishSummary,
                      exampleMode, setExampleMode,
                      handleFileUpload,
                      processDocument,
                      handleViewExample,
                      copySummary,
                      exportSummary,
                      countChineseChars,
                      countEnglishWords
                  }) => {
    // 示例摘要数据
    const exampleSummary = {
        chinese: "本周重点学习了数据结构中的线索树和树的遍历算法...",
        english: "This week, I focused on learning threaded trees and tree traversal algorithms..."
    };

    return (
        <div className="space-y-12 w-full">
            {/* 欢迎区域 */}
            <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    DocSummAI Pro
                </h1>
                <p className="text-2xl text-gray-300 mb-8">专业级文档智能摘要平台</p>
                <p className="text-gray-400 max-w-4xl mx-auto">
                    融合五大核心模块，提供从文档解析到个性化摘要的全流程解决方案
                </p>
            </div>

            {/* 快速开始 */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 w-full">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <span>快速开始</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* 上传文档卡片 */}
                    <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-cyan-500/30 transition-all">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">上传文档</h3>
                        <p className="text-gray-400 text-sm mb-4">支持多种格式，拖拽上传</p>
                        <button onClick={() => document.getElementById('fileInput')?.click()} className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg transition-all">
                            选择文件
                        </button>
                    </div>

                    {/* 智能分析卡片 */}
                    <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">智能分析</h3>
                        <p className="text-gray-400 text-sm mb-4">AI深度理解文档内容</p>
                        <button onClick={processDocument} disabled={(!fileId && !exampleMode) || isProcessing} className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-all disabled:opacity-50">
                            {isProcessing ? '分析中...' : '开始分析'}
                        </button>
                    </div>

                    {/* 获取摘要卡片 */}
                    <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-emerald-500/30 transition-all">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">获取摘要</h3>
                        <p className="text-gray-400 text-sm mb-4">精准提取核心内容</p>
                        <button onClick={exportSummary} disabled={!chineseSummary && !englishSummary} className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-lg transition-all disabled:opacity-50">
                            导出摘要
                        </button>
                    </div>
                </div>

                {/* 上传文件输入框 */}
                <input id="fileInput" type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,.md,.tex,.json,.yaml,.py,.js" />

                {/* 上传状态显示 */}
                {uploadedFile && (
                    <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300">已上传: {uploadedFile.name}</span>
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                )}

                {/* 中文摘要 */}
                {chineseSummary && (
                    <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-emerald-400">中文摘要结果</h3>
                                <span className="text-sm text-gray-400">（{countChineseChars(chineseSummary)} 字符）</span>
                            </div>
                            <button onClick={() => copySummary(chineseSummary)} className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <Copy className="w-4 h-4" />
                                复制
                            </button>
                        </div>
                        <div className="text-gray-200 whitespace-pre-line">{chineseSummary}</div>
                    </div>
                )}

                {/* 英文摘要 */}
                {englishSummary && (outputLanguage === 'auto' || outputLanguage === 'english') && (
                    <div className="mt-4 p-6 bg-gray-800/50 rounded-xl border border-blue-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-blue-400">English Summary</h3>
                                <span className="text-sm text-gray-400">（{countEnglishWords(englishSummary)} words）</span>
                            </div>
                            <button onClick={() => copySummary(englishSummary)} className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <Copy className="w-4 h-4" />
                                Copy
                            </button>
                        </div>
                        <div className="text-gray-200 whitespace-pre-line">{englishSummary}</div>
                    </div>
                )}

                {/* 导出按钮 */}
                {(chineseSummary || englishSummary) && (
                    <button onClick={exportSummary} className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto">
                        <Download className="w-5 h-5" />
                        导出摘要
                    </button>
                )}
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: '支持格式', value: '20+', icon: FileText, color: 'text-cyan-400' },
                    { label: '处理速度', value: '2.4s', icon: Zap, color: 'text-blue-400' },
                    { label: '识别准确率', value: '98.7%', icon: CheckCircle, color: 'text-emerald-400' },
                    { label: '知识库条目', value: '50K+', icon: FileText, color: 'text-purple-400' }
                ].map((stat, index) => (
                    <div key={index} className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        </div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;