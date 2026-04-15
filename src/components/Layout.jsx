// src/components/Layout.jsx
// DocSummAI Pro - 主布局组件（基于 UI/UX Pro Max 设计规范 v2.0）
import React from 'react';
import { Brain, Layers, ChevronRight, Shield, Globe, Sun, Moon, FileText, Cpu, User, HistoryIcon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ---- 图标映射（统一图标集）---- */
const ICON_MAP = {
    parse: FileText,
    understand: Cpu,
    summary: Layers,
    knowledge: Brain,
    customize: Sparkles,
    history: HistoryIcon,
    profile: User,
};

/* ---- 背景网格组件 ---- */
const BackgroundGrid = ({ isDarkMode }) => {
    const techWords = ["AI解析", "智能摘要", "文档理解", "知识增强", "多格式", "自动化", "定制化", "专业级"];
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute inset-0 bg-[size:40px_40px] ${
                isDarkMode 
                    ? 'bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)]' 
                    : 'bg-[radial-gradient(rgba(249,115,22,0.06)_1px,transparent_1px)]'
            }`}></div>
            {techWords.map((word, index) => (
                <div key={index} 
                     className={`absolute text-base font-medium select-none ${
                         isDarkMode ? 'text-gray-700/30' : 'text-orange-200/40'
                     }`}
                     style={{ 
                         top: `${10 + Math.random() * 80}%`, 
                         left: `${5 + Math.random() * 85}%`, 
                         animationDelay: `${index * 0.6}s`, 
                         animationDuration: `${18 + index * 3}s` 
                     }}>
                    {word}
                </div>
            ))}
        </div>
    );
};

/* ---- 布局主组件 ---- */
const Layout = ({ user, logout, currentModule, setCurrentModule, children }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    const modules = [
        { id: 'parse', name: '多格式文档解析', icon: 'FileText', description: '支持多种技术文档格式解析' },
        { id: 'understand', name: '文档图表生成', icon: 'Cpu', description: '根据文档内容生成可视化图表' },
        { id: 'summary', name: '格式转换工具', icon: 'Layers', description: '支持文档格式互转与摘要提取' },
        { id: 'knowledge', name: '领域知识增强', icon: 'Brain', description: '专业知识库集成' },
        { id: 'customize', name: '个性化摘要定制', icon: 'Sparkles', description: '定制化摘要生成' },
        { id: 'history', name: '处理历史', icon: 'HistoryIcon', description: '查看您的文档处理历史' },
        { id: 'profile', name: '个人中心', icon: 'User', description: '管理您的账户信息' },
    ];

    /* 通用模块按钮样式生成器 */
    const getModuleBtnClass = (moduleId) => {
        const isActive = currentModule === moduleId;
        if (isDarkMode) {
            return isActive 
                ? 'bg-primary-500/15 border border-primary-400/25 text-white'
                : 'hover:bg-gray-800/50 text-gray-300 hover:text-white border-transparent';
        }
        // 白天模式：激活态用橙色渐变背景，非激活态用浅色悬停
        return isActive
            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-primary-300 text-gray-900 font-semibold shadow-sm'
            : 'hover:bg-orange-50/60 text-gray-600 hover:text-gray-900 border-transparent';
    };

    return (
        <div className={`relative w-full min-h-screen overflow-hidden transition-colors duration-normal ${
            isDarkMode ? 'bg-black' : 'bg-stone-50'
        }`}>
            {/* 背景网格 */}
            <BackgroundGrid isDarkMode={isDarkMode} />

            {/* ====== 顶部导航栏 ====== */}
            <nav className="relative z-fixed w-full mx-auto px-4 sm:px-6 lg:px-12 py-3 flex justify-between items-center">
                {/* Logo 区域 */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center shadow-orange">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-lg font-bold leading-tight tracking-tight ${
                            isDarkMode 
                                ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' 
                                : 'bg-gradient-to-r from-primary-600 to-pink-accent bg-clip-text text-transparent'
                        }`}>
                            DocSummAI Pro
                        </h1>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} tracking-wide`}>
                            专业文档智能平台
                        </p>
                    </div>
                </div>

                {/* 右侧操作区 */}
                <div className="flex items-center gap-3 sm:gap-5">
                    {/* 功能标签 */}
                    <div className={`hidden lg:flex items-center gap-4 text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-emerald-400">
                            <Shield className="w-3.5 h-3.5" /> 企业级安全
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 text-sky-400">
                            <Globe className="w-3.5 h-3.5" /> 多语言支持
                        </span>
                    </div>

                    {/* 主题切换 */}
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        title={isDarkMode ? '切换到白天模式 ☀️' : '切换到黑夜模式 🌙'}
                        aria-label={isDarkMode ? '切换到白天模式' : '切换到黑夜模式'}
                    >
                        {isDarkMode 
                            ? <Sun className="w-[18px] h-[18px]" /> 
                            : <Moon className="w-[18px] h-[18px]" />}
                    </button>

                    {/* 用户区域 */}
                    {user ? (
                        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border-default dark:border-white/10">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-pink-accent flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                {user.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium leading-none ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    欢迎，{user.username}
                                </span>
                            </div>
                            <button 
                                onClick={() => logout()} 
                                className="px-3 py-1.5 text-xs rounded-lg transition-all duration-fast font-medium bg-red-50 text-red-500 hover:bg-red-100 active:scale-95"
                            >
                                退出
                            </button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex gap-2">
                            <button 
                                onClick={() => setCurrentModule('login')} 
                                className="px-4 py-2 text-sm rounded-lg transition-all duration-fast font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 active:scale-97"
                            >
                                登录
                            </button>
                            <button 
                                onClick={() => setCurrentModule('register')} 
                                className="px-4 py-2 text-sm rounded-lg transition-all duration-fast font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-orange active:scale-97"
                            >
                                注册
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* ====== 页面主体区域 ====== */}
            <main className="relative z-base w-full mx-auto px-4 sm:px-6 lg:px-12 py-6">

                {/* 返回首页按钮 */}
                {currentModule !== 'home' && (
                    <div className="mb-6 animate-slide-up">
                        <button 
                            onClick={() => setCurrentModule('home')} 
                            className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-normal font-medium text-sm ${
                                isDarkMode 
                                    ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50' 
                                    : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 shadow-sm'
                            }`}
                        >
                            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                            返回首页
                        </button>
                    </div>
                )}

                {/* 侧边栏 + 内容区 */}
                <div className="flex flex-col lg:flex-row gap-5 w-full">
                    
                    {/* 左侧导航栏 */}
                    {(currentModule === 'home') && (
                        <aside className="lg:w-72 shrink-0 animate-fade-in">
                            <div className={`backdrop-blur-sm rounded-xl border p-5 w-full transition-colors duration-normal sticky top-24 ${
                                isDarkMode 
                                    ? 'bg-black/40 border-white/[0.07] shadow-lg' 
                                    : 'bg-white/80 border-orange-100 shadow-md shadow-primary-500/[0.03]'
                            }`}>
                                {/* 标题 */}
                                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-border-default dark:border-white/[0.08]">
                                    <Layers className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-primary-500'}`} />
                                    <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        核心模块
                                    </h2>
                                </div>

                                {/* 模块列表 */}
                                <nav className="space-y-1.5" role="navigation" aria-label="核心模块导航">
                                    {/* 首页 */}
                                    <button
                                        onClick={() => setCurrentModule('home')}
                                        className={`w-full text-left px-3.5 py-2.5 rounded-lg transition-all duration-fast flex items-center gap-3 group ${
                                            currentModule === 'home'
                                                ? (isDarkMode 
                                                    ? 'bg-primary-500/12 text-white border border-primary-400/20' 
                                                    : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-primary-200 text-gray-900')
                                                : (isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50')
                                        }`}
                                    >
                                        <Layers className={`w-[18px] h-[18px] shrink-0 ${isDarkMode ? '' : 'text-primary-500'}`} />
                                        <span className="font-medium text-sm">欢迎主页</span>
                                    </button>

                                    {/* 子模块 */}
                                    {modules.map((mod) => {
                                        const IconComp = ICON_MAP[mod.icon];
                                        return (
                                            <button
                                                key={mod.id}
                                                onClick={() => setCurrentModule(mod.id)}
                                                className={`
                                                    w-full text-left px-3.5 py-2.5 rounded-lg transition-all duration-fast group
                                                    ${getModuleBtnClass(mod.id)}
                                                    border
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {IconComp && (
                                                        <IconComp className={`w-[18px] h-[18px] shrink-0 ${
                                                            isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-primary-500'
                                                        }`} />
                                                    )}
                                                    {!IconComp && <Layers className={`w-[18px] h-[18px] shrink-0 ${isDarkMode ? '' : 'text-primary-500'}`} />}
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm truncate">{mod.name}</div>
                                                        <div className={`text-xs mt-0.5 truncate ${
                                                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                                        }`}>{mod.description}</div>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 shrink-0 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all ${
                                                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                                    }`} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* 右侧内容区 */}
                    <section className="flex-1 min-w-0 w-full animate-fade-in">
                        <div className={`backdrop-blur-sm rounded-xl border p-6 sm:p-8 w-full transition-colors duration-normal ${
                            isDarkMode 
                                ? 'bg-black/40 border-white/[0.07]' 
                                : 'bg-white/90 border-orange-100 shadow-md shadow-primary-500/[0.03]'
                        }`}>
                            {children}
                        </div>

                        {/* 页脚 */}
                        <footer className={`mt-8 text-center text-xs w-full pb-6 transition-colors ${
                            isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                            <p>© 2024 DocSummAI Pro · 专业文档智能处理平台 | 版本 3.0.0</p>
                            <p className="mt-1.5 opacity-60">融合五大核心模块，提供全面的文档智能解决方案</p>
                        </footer>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Layout;
