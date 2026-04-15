// src/components/Layout.jsx
import React from 'react';
import { Brain, Layers, ChevronRight, Shield, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// 背景网格组件（原App里的BackgroundGrid）
const BackgroundGrid = ({ isDarkMode }) => {
    const techWords = ["AI解析", "智能摘要", "文档理解", "知识增强", "多格式", "自动化", "定制化", "专业级"];
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute inset-0 bg-[size:40px_40px] ${isDarkMode ? 'bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)]' : 'bg-[radial-gradient(rgba(249,115,22,0.08)_1px,transparent_1px)]'}`}></div>
            {techWords.map((word, index) => (
                <div key={index} className={`absolute text-xl font-medium animate-float ${isDarkMode ? 'text-gray-700/50' : 'text-orange-200/60'}`}
                     style={{ top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`, animationDelay: `${index * 0.5}s`, animationDuration: `${15 + index * 2}s` }}>
                    {word}
                </div>
            ))}
        </div>
    );
};

// 布局主组件
const Layout = ({ user, logout, currentModule, setCurrentModule, children }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    // 模块数据（原App里的modules）
    const modules = [
        { id: 'parse', name: '多格式文档解析', icon: 'FileText', color: 'from-cyan-500 to-blue-500', description: '支持多种技术文档格式解析' },
        { id: 'understand', name: '智能文档理解', icon: 'Cpu', color: 'from-blue-500 to-purple-500', description: '深度理解文档结构与内容' },
        { id: 'summary', name: '多粒度摘要生成', icon: 'Layers', color: 'from-purple-500 to-pink-500', description: '多层次内容摘要提取' },
        { id: 'knowledge', name: '领域知识增强', icon: 'Brain', color: 'from-pink-500 to-red-500', description: '专业知识库集成' },
        { id: 'customize', name: '个性化摘要定制', icon: 'User', color: 'from-orange-500 to-yellow-500', description: '定制化摘要生成' },
        { id: 'history', name: '处理历史', icon: 'HistoryIcon', color: 'from-green-500 to-emerald-500', description: '查看您的文档处理历史' },
        { id: 'profile', name: '个人中心', icon: 'UserIcon', color: 'from-amber-500 to-yellow-500', description: '管理您的账户信息' },
    ];

    return (
        <div className={`relative w-full min-h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-stone-50 text-gray-800'}`}>
            {/* 背景网格 */}
            <BackgroundGrid isDarkMode={isDarkMode} />

            {/* 顶部导航栏 */}
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-12 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            DocSummAI Pro
                        </h1>
                        <p className="text-xs text-gray-400">专业文档智能平台</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {/* 主题切换按钮 */}
                    <button
                        onClick={toggleTheme}
                        className={`theme-toggle-btn ${isDarkMode ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-gray-700 to-gray-800'}`}
                        title={isDarkMode ? '切换到白天模式' : '切换到黑夜模式'}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <div className={`hidden md:flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${isDarkMode ? '' : 'text-primary-500'}`} />
                            <span>企业级安全</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className={`w-4 h-4 ${isDarkMode ? '' : 'text-primary-500'}`} />
                            <span>多语言支持</span>
                        </div>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>欢迎，{user.username}</span>
                            <button onClick={() => logout()} className={`px-3 py-2 text-xs rounded-lg transition ${isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                                退出登录
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentModule('login')} className={`px-3 py-2 text-xs rounded-lg transition ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'}`}>
                                登录
                            </button>
                            <button onClick={() => setCurrentModule('register')} className={`px-3 py-2 text-xs rounded-lg transition ${isDarkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                                注册
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 页面主体区域 */}
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
                {/* 非主页返回按钮 - 白天模式白底黑字，黑夜模式黑底白字 */}
                {currentModule !== 'home' && (
                    <div className="mb-8">
                        <button onClick={() => setCurrentModule('home')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white' : 'bg-white border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 shadow-sm'}`}>
                            <ChevronRight className={`w-4 h-4 rotate-180 ${isDarkMode ? '' : 'text-gray-600'}`} />
                            返回首页
                        </button>
                    </div>
                )}

                {/* 侧边栏+内容区布局 */}
                <div className="flex flex-col lg:flex-row gap-6 w-full">
                    {/* 左侧侧边栏 */}
                    <div className={`lg:w-80 shrink-0 ${currentModule !== 'home' ? 'hidden lg:block' : ''}`}>
                        <div className={`backdrop-blur-sm rounded-2xl border p-6 w-full transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900/60 to-black/60 border-gray-700/50' : 'bg-white border-orange-200 shadow-lg shadow-orange-500/5'}`}>
                            <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? '' : 'text-gray-800'}`}>
                                <Layers className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-primary-500'}`} />
                                核心模块
                            </h2>
                            <div className="space-y-2 w-full">
                                <button onClick={() => setCurrentModule('home')} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${currentModule === 'home' ? (isDarkMode ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' : 'bg-gradient-to-r from-primary-100 to-orange-100 border border-primary-300') : (isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-orange-50')}`}>
                                    <div className="flex items-center gap-3">
                                        <Layers className={`w-5 h-5 ${isDarkMode ? '' : 'text-primary-600'}`} />
                                        <span className={`font-medium ${isDarkMode ? '' : 'text-gray-700'}`}>欢迎主页</span>
                                    </div>
                                </button>
                                {modules.map((module) => (
                                    <button key={module.id} onClick={() => setCurrentModule(module.id)} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${currentModule === module.id ? (isDarkMode ? `bg-gradient-to-r ${module.color} bg-opacity-20 border ${module.color.split(' ')[0].replace('from-', 'border-')}/30` : 'bg-gradient-to-r from-primary-100 to-orange-100 border border-primary-300') : (isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-orange-50')}`}>
                                        <div className="flex items-center gap-3">
                                            <Layers className={`w-5 h-5 ${isDarkMode ? '' : 'text-primary-600'}`} />
                                            <div className="flex-1">
                                                <div className={`font-medium ${isDarkMode ? '' : 'text-gray-700'}`}>{module.name}</div>
                                                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{module.description}</div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右侧内容区（渲染子组件） */}
                    <div className="flex-1 min-w-0 w-full">
                        <div className={`backdrop-blur-sm rounded-2xl border p-8 w-full transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900/60 to-black/60 border-gray-700/50' : 'bg-white border-orange-200 shadow-lg shadow-orange-500/5'}`}>
                            {children}
                        </div>
                        {/* 页脚 */}
                        <footer className={`mt-8 text-center text-sm w-full ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <p>© 2024 DocSummAI Pro. 专业文档智能处理平台 | 版本 3.0.0</p>
                            <p className="mt-2">融合五大核心模块，提供全面的文档智能解决方案</p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;