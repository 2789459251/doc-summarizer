// src/components/Layout.jsx
import React from 'react';
import { Brain, Layers, ChevronRight, Shield, Globe } from 'lucide-react';

// 背景网格组件（原App里的BackgroundGrid）
const BackgroundGrid = () => {
    const techWords = ["AI解析", "智能摘要", "文档理解", "知识增强", "多格式", "自动化", "定制化", "专业级"];
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            {techWords.map((word, index) => (
                <div key={index} className="absolute text-gray-700/50 text-xl font-medium animate-float"
                     style={{ top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`, animationDelay: `${index * 0.5}s`, animationDuration: `${15 + index * 2}s` }}>
                    {word}
                </div>
            ))}
        </div>
    );
};

// 布局主组件
const Layout = ({ user, logout, currentModule, setCurrentModule, children }) => {
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
        <div className="relative w-full min-h-screen overflow-hidden bg-black text-white">
            {/* 背景网格 */}
            <BackgroundGrid />

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
                    <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>企业级安全</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span>多语言支持</span>
                        </div>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-200">欢迎，{user.username}</span>
                            <button onClick={() => logout()} className="px-3 py-2 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">
                                退出登录
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentModule('login')} className="px-3 py-2 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition">
                                登录
                            </button>
                            <button onClick={() => setCurrentModule('register')} className="px-3 py-2 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition">
                                注册
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 页面主体区域 */}
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
                {/* 非主页返回按钮 */}
                {currentModule !== 'home' && (
                    <div className="mb-8">
                        <button onClick={() => setCurrentModule('home')} className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            返回首页
                        </button>
                    </div>
                )}

                {/* 侧边栏+内容区布局 */}
                <div className="flex flex-col lg:flex-row gap-6 w-full">
                    {/* 左侧侧边栏 */}
                    <div className={`lg:w-80 shrink-0 ${currentModule !== 'home' ? 'hidden lg:block' : ''}`}>
                        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 w-full">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-cyan-400" />
                                核心模块
                            </h2>
                            <div className="space-y-2 w-full">
                                <button onClick={() => setCurrentModule('home')} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${currentModule === 'home' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' : 'hover:bg-gray-800/50'}`}>
                                    <div className="flex items-center gap-3">
                                        <Layers className="w-5 h-5" />
                                        <span className="font-medium">欢迎主页</span>
                                    </div>
                                </button>
                                {modules.map((module) => (
                                    <button key={module.id} onClick={() => setCurrentModule(module.id)} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${currentModule === module.id ? `bg-gradient-to-r ${module.color} bg-opacity-20 border ${module.color.split(' ')[0].replace('from-', 'border-')}/30` : 'hover:bg-gray-800/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-5 h-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">{module.name}</div>
                                                <div className="text-xs text-gray-400 mt-1">{module.description}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右侧内容区（渲染子组件） */}
                    <div className="flex-1 min-w-0 w-full">
                        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 w-full">
                            {children}
                        </div>
                        {/* 页脚 */}
                        <footer className="mt-8 text-center text-gray-500 text-sm w-full">
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