// src/pages/HomePage.jsx
// DocSummAI Pro - 首页（基于 UI/UX Pro Max 设计规范 v2.0）
import React, { useState } from 'react';
import { Zap, Upload, Brain, FileText, CheckCircle, Copy, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
    const { isDarkMode } = useTheme();

    /* ---- 通用样式工具函数 ---- */
    const cardClass = (extra = '') => {
        return `rounded-xl border transition-all duration-normal ${isDarkMode 
            ? `bg-gray-900/40 backdrop-blur-sm border-white/[0.07] hover:border-white/[0.14]` 
            : `bg-white/80 border-orange-100/80 hover:border-primary-300 shadow-sm hover:shadow-md`
        } ${extra}`;
    };

    const btnPrimary = 'px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-normal active:scale-[0.97] inline-flex items-center gap-2';
    const btnPrimaryDark = 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-orange';
    const btnPrimaryLight = 'bg-gradient-to-r from-primary-500 to-orange-500 hover:from-primary-600 hover:to-orange-600 text-white shadow-orange';

    return (
        <div className="space-y-10 w-full">
            {/* ====== 欢迎标题区域 ====== */}
            <header className="text-center space-y-4 animate-fade-in">
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight ${
                    isDarkMode
                        ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-br from-primary-500 via-pink-accent to-purple-500 bg-clip-text text-transparent'
                }`}>
                    DocSummAI Pro
                </h1>
                <p className={`text-lg md:text-xl font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                    专业级文档智能摘要平台
                </p>
                <p className={`text-sm max-w-2xl mx-auto leading-relaxed ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                    融合五大核心模块，提供从文档解析到个性化摘要的全流程解决方案
                </p>
            </header>

            {/* ====== 快速开始（三步卡片） ====== */}
            <section className={cardClass('p-6 sm:p-8')}>
                {/* 区域标题 */}
                <h2 className={`text-lg font-bold mb-6 flex items-center gap-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                    <span className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-primary-500" />
                    </span>
                    快速开始
                </h2>

                <div className="grid sm:grid-cols-3 gap-5">
                    
                    {/* 步骤 1：上传 */}
                    <div className={`group p-6 rounded-xl border transition-all duration-normal text-center cursor-pointer hover:-translate-y-0.5 ${
                        isDarkMode 
                            ? 'bg-gray-800/30 border-white/[0.06] hover:border-cyan-400/25' 
                            : 'bg-gradient-to-b from-orange-50/50 to-white border-orange-100 hover:border-primary-300 hover:shadow-md'
                    }`}
                         onClick={() => document.getElementById('fileInput')?.click()}>
                        {/* 图标圆圈 */}
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-normal group-hover:scale-110 ${
                            isDarkMode 
                                ? 'bg-gradient-to-br from-cyan-500/12 to-blue-500/12' 
                                : 'bg-gradient-to-br from-primary-100 to-orange-100'
                        }`}>
                            <Upload className={`w-7 h-7 ${isDarkMode ? 'text-cyan-400' : 'text-primary-500'}`} />
                        </div>
                        <h3 className={`text-base font-semibold mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            上传文档
                        </h3>
                        <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            支持多种格式 · 拖拽上传
                        </p>
                        <button onClick={(e) => e.stopPropagation()} className={`${btnPrimary} ${
                            isDarkMode 
                                ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25' 
                                : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
                        }`}>
                            选择文件
                        </button>
                    </div>

                    {/* 步骤 2：分析 */}
                    <div className={`group p-6 rounded-xl border transition-all duration-normal text-center ${
                        isDarkMode 
                            ? 'bg-gray-800/30 border-white/[0.06] hover:border-purple-400/25' 
                            : 'bg-gradient-to-b from-pink-50/50 to-white border-pink-100 hover:border-pink-accent/30 hover:shadow-md'
                    }`}>
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-normal group-hover:scale-110 ${
                            isDarkMode 
                                ? 'bg-gradient-to-br from-purple-500/12 to-pink-500/12' 
                                : 'bg-gradient-to-br from-pink-100 to-purple-100'
                        }`}>
                            <Brain className={`w-7 h-7 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                        </div>
                        <h3 className={`text-base font-semibold mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            智能分析
                        </h3>
                        <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            AI 深度理解文档内容
                        </p>
                        <button 
                            onClick={processDocument} 
                            disabled={(!fileId && !exampleMode) || isProcessing}
                            className={`${btnPrimary} ${
                                (!fileId && !exampleMode) || isProcessing ? 'opacity-40 cursor-not-allowed' : ''
                            } ${isDarkMode 
                                ? 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25' 
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                            }`}>
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    分析中...
                                </>
                            ) : '开始分析'}
                        </button>
                    </div>

                    {/* 步骤 3：导出 */}
                    <div className={`group p-6 rounded-xl border transition-all duration-normal text-center ${
                        isDarkMode 
                            ? 'bg-gray-800/30 border-white/[0.06] hover:border-emerald-400/25' 
                            : 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-100 hover:border-emerald-300 hover:shadow-md'
                    }`}>
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-normal group-hover:scale-110 ${
                            isDarkMode 
                                ? 'bg-gradient-to-br from-emerald-500/12 to-teal-500/12' 
                                : 'bg-gradient-to-br from-emerald-100 to-teal-100'
                        }`}>
                            <FileText className={`w-7 h-7 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <h3 className={`text-base font-semibold mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            获取摘要
                        </h3>
                        <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            精准提取核心内容
                        </p>
                        <button 
                            onClick={exportSummary}
                            disabled={!chineseSummary && !englishSummary}
                            className={`${btnPrimary} ${
                                !chineseSummary && !englishSummary ? 'opacity-40 cursor-not-allowed' : ''
                            } ${isDarkMode 
                                ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                            }`}>
                            导出摘要
                        </button>
                    </div>
                </div>

                {/* 隐藏的文件输入框 */}
                <input id="fileInput" type="file" className="hidden" onChange={handleFileUpload} 
                       accept=".pdf,.doc,.docx,.txt,.md,.tex,.json,.yaml,.py,.js" />

                {/* 上传进度条 */}
                {uploadedFile && (
                    <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/40' : 'bg-gray-50'} animate-slide-up`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-sm font-medium truncate mr-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                已上传：{uploadedFile.name}
                            </span>
                            <CheckCircle className={`w-5 h-5 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        </div>
                        <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div 
                                className={`h-full rounded-full transition-all duration-slow ${
                                    isDarkMode 
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                                        : 'bg-gradient-to-r from-primary-500 to-primary-600'
                                }`} 
                                style={{ width: `${uploadProgress}%` }} 
                            ></div>
                        </div>
                    </div>
                )}
            </section>

            {/* ====== 摘要结果区域 ====== */}

            {/* 中文摘要 */}
            {chineseSummary && (
                <article className={`${cardClass()} animate-slide-up`}>
                    <header className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border-default dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <h3 className={`text-base font-bold ${isDarkMode ? 'text-emerald-400' : 'text-green-600'}`}>
                                中文摘要结果
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-green-50 text-green-600'
                            }`}>
                                {countChineseChars(chineseSummary)} 字符
                            </span>
                        </div>
                        <button 
                            onClick={() => copySummary(chineseSummary)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-fast active:scale-95 ${
                                isDarkMode 
                                    ? 'bg-gray-700/60 hover:bg-gray-600/60 text-gray-300' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                        >
                            <Copy className="w-3.5 h-3.5" /> 复制
                        </button>
                    </header>
                    <div className={`text-sm leading-relaxed whitespace-pre-line ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{chineseSummary}</div>
                </article>
            )}

            {/* 英文摘要 */}
            {englishSummary && (outputLanguage === 'auto' || outputLanguage === 'english') && (
                <article className={`${cardClass()} animate-slide-up`}>
                    <header className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border-default dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <h3 className={`text-base font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                English Summary
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {countEnglishWords(englishSummary)} words
                            </span>
                        </div>
                        <button 
                            onClick={() => copySummary(englishSummary)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-fast active:scale-95 ${
                                isDarkMode 
                                    ? 'bg-gray-700/60 hover:bg-gray-600/60 text-gray-300' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                        >
                            <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                    </header>
                    <div className={`text-sm leading-relaxed whitespace-pre-line ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{englishSummary}</div>
                </article>
            )}

            {/* 导出 CTA 按钮 */}
            {(chineseSummary || englishSummary) && (
                <div className="flex justify-center pt-2">
                    <button 
                        onClick={exportSummary} 
                        className={`${btnPrimary} ${isDarkMode ? btnPrimaryDark : btnPrimaryLight}`}
                    >
                        <Download className="w-4 h-4" /> 导出摘要
                    </button>
                </div>
            )}

            {/* ====== 统计数据 ====== */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: '支持格式', value: '20+', icon: FileText },
                    { label: '处理速度', value: '2.4s', icon: Zap },
                    { label: '识别准确率', value: '98.7%', icon: CheckCircle },
                    { label: '知识库条目', value: '50K+', icon: FileText }
                ].map((stat, index) => {
                    const IconComp = stat.icon;
                    return (
                        <div key={index} className={`${cardClass('p-5')} group hover:-translate-y-0.5`}>
                            <div className="flex items-center gap-3 mb-2">
                                {/* 图标容器 */}
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    isDarkMode 
                                        ? 'bg-gray-800/60' 
                                        : `${index % 4 === 0 ? 'bg-cyan-50' : index % 4 === 1 ? 'bg-primary-50' : index % 4 === 2 ? 'bg-emerald-50' : 'bg-purple-50'}`
                                }`}>
                                    <IconComp className={`w-4.5 h-4.5 ${
                                        index % 4 === 0 
                                            ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-600')
                                            : index % 4 === 1
                                                ? (isDarkMode ? 'text-primary-400' : 'text-primary-600')
                                                : index % 4 === 2
                                                    ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                                                    : (isDarkMode ? 'text-purple-400' : 'text-purple-600')
                                    }`} />
                                </div>
                                {/* 数值 */}
                                <div className={`text-2xl font-bold tabular-nums ${
                                    index % 4 === 0 
                                        ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-600')
                                        : index % 4 === 1
                                            ? (isDarkMode ? 'text-primary-400' : 'text-primary-600')
                                            : index % 4 === 2
                                                ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                                                : (isDarkMode ? 'text-purple-400' : 'text-purple-600')
                                }`}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {stat.label}
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
};

export default HomePage;
