import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Cpu, Layers, Brain, User,
    Upload, Zap, Shield, Globe, Settings,
    ChevronRight, CheckCircle, Lock, Sparkles,
    Code, Database, GitBranch, BookOpen,
    BarChart, Target, Languages, Palette
} from 'lucide-react';
import './App.css';

function App() {
    // 状态管理 - 补充缺失的状态
    const [currentModule, setCurrentModule] = useState('home');
    const [activeSubModule, setActiveSubModule] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0); // 补充缺失的状态
    const [text, setText] = useState(''); // 补充缺失的状态
    const [summary, setSummary] = useState(''); // 新增：存储摘要结果
    const [summaryType, setSummaryType] = useState('document'); // 新增：摘要类型
    const [summaryLength, setSummaryLength] = useState('standard'); // 新增：摘要长度
    const [englishSummary, setEnglishSummary] = useState('');
    const [chineseSummary, setChineseSummary] = useState('');
    const [outputLanguage, setOutputLanguage] = useState('auto'); // auto, bilingual
    // 模块数据（保持不变）
    const modules = [
        // ... 原有模块数据 ...
        {
            id: 'parse',
            name: '多格式文档解析',
            icon: FileText,
            color: 'from-cyan-500 to-blue-500',
            description: '支持多种技术文档格式解析',
            subModules: [
                { name: 'Markdown/LaTeX解析', icon: Code },
                { name: 'Word/PDF解析', icon: FileText },
                { name: '代码文件解析', icon: Code },
                { name: '版本控制集成', icon: GitBranch },
                { name: 'API文档解析', icon: Database },
                { name: '数据库文档解析', icon: Database }
            ]
        },
        {
            id: 'understand',
            name: '智能文档理解',
            icon: Cpu,
            color: 'from-blue-500 to-purple-500',
            description: '深度理解文档结构与内容',
            subModules: [
                { name: '文档结构分析', icon: Layers },
                { name: '技术术语识别', icon: Target },
                { name: '代码-文档关联', icon: Code },
                { name: '文档质量评估', icon: BarChart },
                { name: '关键信息提取', icon: Sparkles }
            ]
        },
        {
            id: 'summary',
            name: '多粒度摘要生成',
            icon: Layers,
            color: 'from-purple-500 to-pink-500',
            description: '多层次内容摘要提取',
            subModules: [
                { name: '文档级摘要', icon: FileText },
                { name: '章节级摘要', icon: Layers },
                { name: '段落级摘要', icon: BookOpen },
                { name: '代码级摘要', icon: Code },
                { name: '对话式摘要', icon: Sparkles }
            ]
        },
        {
            id: 'knowledge',
            name: '领域知识增强',
            icon: Brain,
            color: 'from-pink-500 to-red-500',
            description: '专业知识库集成',
            subModules: [
                { name: '软件工程知识库', icon: Code },
                { name: '技术栈知识库', icon: Database },
                { name: '行业标准库', icon: Shield },
                { name: '项目上下文理解', icon: Brain }
            ]
        },
        {
            id: 'customize',
            name: '个性化摘要定制',
            icon: User,
            color: 'from-orange-500 to-yellow-500',
            description: '定制化摘要生成',
            subModules: [
                { name: '用户角色识别', icon: User },
                { name: '阅读偏好学习', icon: Brain },
                { name: '摘要风格控制', icon: Palette },
                { name: '多语言支持', icon: Languages },
                { name: '摘要格式定制', icon: Settings }
            ]
        }
    ];

    // 处理文件上传 - 完善逻辑
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadedFile(file);
        setUploadProgress(0);
        setIsProcessing(true);

        console.log('上传按钮被点击了，文件:', file);
        const formData = new FormData();
        formData.append('file', file);



        console.log('准备发起 fetch 请求');
        try {
            // 开始上传
            const response = await fetch('http://localhost:5000/api/upload/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('上传失败');
            }

            const data = await response.json();
            setFileId(data.file_id);
            setUploadProgress(100);

            // 获取文件内容
            await fetchFileContent(data.file_id);

            setIsProcessing(false);
            alert(`文件 ${file.name} 上传成功！`);
        } catch (error) {
            console.error('上传错误:', error);
            alert('文件上传失败: ' + error.message);
            setIsProcessing(false);
        }
    };

    // 获取文件内容
    const fetchFileContent = async (fileId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/document/${fileId}`);
            if (!response.ok) throw new Error('获取文件内容失败');

            const data = await response.json();
            setText(data.content);
        } catch (error) {
            console.error('获取文件内容错误:', error);
            setText(`[无法加载文件内容: ${error.message}]`);
        }
    };

    // 处理文档生成摘要
    const processDocument = async () => {
        if (!fileId) {
            alert('请先上传文件！');
            return;
        }

        setIsProcessing(true);
        setTaskStatus('processing');

        try {
            const response = await fetch(
                `http://localhost:5000/api/process/${fileId}?summary_type=${summaryType}&summary_length=${summaryLength}&output_language=${outputLanguage}`,
                { method: 'POST' }
            );

            if (!response.ok) throw new Error('启动处理失败');

            const data = await response.json();
            setTaskId(data.task_id);
            startPollingTaskStatus(data.task_id);
        } catch (error) {
            console.error('处理文档错误:', error);
            alert('处理文档失败: ' + error.message);
            setIsProcessing(false);
            setTaskStatus('failed');
        }
    };
    // 轮询任务状态
    const startPollingTaskStatus = (taskId) => {
        // 清除现有轮询
        if (pollingInterval) clearInterval(pollingInterval);

        // 创建新轮询
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/task/${taskId}`);
                if (!response.ok) throw new Error('获取任务状态失败');

                const data = await response.json();
                setTaskStatus(data.status);

                // 如果任务完成
                if (data.status === 'completed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    // 获取摘要结果
                    await fetchSummary(taskId);
                }
                // 如果任务失败
                else if (data.status === 'failed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    alert('任务处理失败: ' + (data.error || '未知错误'));
                }

            } catch (error) {
                console.error('轮询任务状态错误:', error);
            }
        }, 2000); // 每2秒轮询一次

        setPollingInterval(interval);
    };

    // 获取摘要结果
    const fetchSummary = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/summary/${taskId}`);
            if (!response.ok) throw new Error('获取摘要失败');

            const data = await response.json();
            setEnglishSummary(data.summary.english || '');
            setChineseSummary(data.summary.chinese || '');
            alert('摘要生成成功！');
        } catch (error) {
            console.error('获取摘要错误:', error);
            alert('获取摘要失败: ' + error.message);
        }
    };

    // 清理轮询
    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [pollingInterval]);

    // 渲染模块内容 - 完善UI交互
    const renderModuleContent = () => {
        const module = modules.find(m => m.id === currentModule);

        if (currentModule === 'home') {
            return (
                <div className="space-y-12">
                    {/* 欢迎区域 */}
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            DocSummAI Pro
                        </h1>
                        <p className="text-2xl text-gray-300 mb-8">
                            专业级文档智能摘要平台
                        </p>
                        <p className="text-gray-400 max-w-3xl mx-auto">
                            融合五大核心模块，提供从文档解析到个性化摘要的全流程解决方案
                        </p>
                    </div>

                    {/* 快速开始 */}
                    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-cyan-400" />
                            <span>快速开始</span>
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-cyan-500/30 transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">上传文档</h3>
                                <p className="text-gray-400 text-sm mb-4">支持多种格式，拖拽上传</p>
                                <button
                                    onClick={() => document.getElementById('fileInput')?.click()}
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg transition-all"
                                >
                                    选择文件
                                </button>
                            </div>

                            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">智能分析</h3>
                                <p className="text-gray-400 text-sm mb-4">AI深度理解文档内容</p>
                                <button
                                    onClick={processDocument}
                                    disabled={!fileId || isProcessing}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-all disabled:opacity-50"
                                >
                                    {isProcessing ? '分析中...' : '开始分析'}
                                </button>
                            </div>

                            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-emerald-500/30 transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">获取摘要</h3>
                                <p className="text-gray-400 text-sm mb-4">精准提取核心内容</p>
                                <button
                                    disabled={!taskId || taskStatus !== 'completed' || isProcessing}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-lg transition-all disabled:opacity-50"
                                >
                                    {summary ? '查看摘要' : '生成摘要'}
                                </button>
                            </div>
                        </div>

                        {/* 上传文件输入框 */}
                        <input
                            id="fileInput"
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt,.md,.tex,.json,.yaml,.py,.js"
                        />

                        {/* 上传状态显示 */}
                        {uploadedFile && (
                            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">已上传: {uploadedFile.name}</span>
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* 摘要结果显示 */}
                        {summary && (
                            <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-emerald-500/20">
                                <h3 className="text-xl font-bold mb-4 text-emerald-400">智能摘要结果</h3>
                                <div className="text-gray-200 whitespace-pre-line">{summary}</div>

                                {/* 摘要配置选项 */}
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">摘要类型</label>
                                        <select
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                            value={summaryType}
                                            onChange={(e) => setSummaryType(e.target.value)}
                                        >
                                            <option value="document">文档级摘要</option>
                                            <option value="chapter">章节级摘要</option>
                                            <option value="paragraph">段落级摘要</option>
                                            <option value="code">代码级摘要</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">摘要长度</label>
                                        <select
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                            value={summaryLength}
                                            onChange={(e) => setSummaryLength(e.target.value)}
                                        >
                                            <option value="concise">简洁 (50-100字)</option>
                                            <option value="standard">标准 (100-200字)</option>
                                            <option value="detailed">详细 (200-300字)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={processDocument}
                                    className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-lg"
                                >
                                    重新生成摘要
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 统计数据 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: '支持格式', value: '20+', icon: FileText, color: 'text-cyan-400' },
                            { label: '处理速度', value: '2.4s', icon: Zap, color: 'text-blue-400' },
                            { label: '识别准确率', value: '98.7%', icon: CheckCircle, color: 'text-emerald-400' },
                            { label: '知识库条目', value: '50K+', icon: Database, color: 'text-purple-400' }
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
        }

        // 模块内容页面（保持原有逻辑，补充交互）
        return (
            <div className="space-y-8">
                {/* 模块标题 */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${module.color} bg-opacity-20`}>
                                <module.icon className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">{module.name}</h1>
                        </div>
                        <p className="text-gray-400">{module.description}</p>
                    </div>
                    <button
                        onClick={() => setCurrentModule('home')}
                        className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        返回首页
                    </button>
                </div>

                {/* 子模块导航 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {module.subModules.map((sub, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSubModule(sub)}
                            className={`p-6 rounded-xl text-left transition-all ${
                                activeSubModule?.name === sub.name
                                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-lg'
                                    : 'bg-gray-900/40 hover:bg-gray-800/40 border border-gray-700/30'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-gray-800/50">
                                    <sub.icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-white">{sub.name}</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                点击进入{module.name}的{sub.name}功能
                            </p>
                        </button>
                    ))}
                </div>

                {/* 子模块内容区域 */}
                {activeSubModule && (
                    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900">
                                    <activeSubModule.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{activeSubModule.name}</h2>
                                    <p className="text-gray-400">{module.name}的核心功能之一</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveSubModule(null)}
                                className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                关闭
                            </button>
                        </div>

                        {/* 动态内容 */}
                        <div className="space-y-6">
                            {/* 解析功能 */}
                            {activeSubModule.name.includes('解析') && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white">文档解析示例</h3>
                                        <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm max-h-60 overflow-auto">
                                            <pre className="text-gray-300">{text || `# 请上传文件查看解析结果\n\n支持格式：PDF, Word, Markdown, 代码文件等`}</pre>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white">上传文件</h3>
                                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors">
                                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                            <p className="text-gray-400 mb-4">拖拽文件到此处或点击上传</p>
                                            <button
                                                onClick={() => document.getElementById('moduleFileInput')?.click()}
                                                className="px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg"
                                            >
                                                选择文件
                                            </button>
                                            <input
                                                id="moduleFileInput"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                accept=".pdf,.doc,.docx,.txt,.md,.tex,.json,.yaml,.py,.js"
                                            />
                                        </div>
                                        {uploadedFile && (
                                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-300">{uploadedFile.name}</span>
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 分析功能 */}
                            {activeSubModule.name.includes('分析') && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white">智能分析结果</h3>
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400 mb-2">文档结构</div>
                                            <div className="text-lg font-semibold text-white">层次清晰</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400 mb-2">关键术语</div>
                                            <div className="text-lg font-semibold text-white">12个</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400 mb-2">质量评分</div>
                                            <div className="text-lg font-semibold text-emerald-400">92/100</div>
                                        </div>
                                    </div>

                                    {/* 分析按钮 */}
                                    <button
                                        onClick={processDocument}
                                        disabled={!fileId || isProcessing}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                分析中...
                                            </div>
                                        ) : (
                                            '开始智能分析'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* 摘要功能 */}
                            {activeSubModule.name.includes('摘要') && (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-white">摘要生成配置</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">摘要类型</label>
                                                    <select
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                                        value={summaryType}
                                                        onChange={(e) => setSummaryType(e.target.value)}
                                                    >
                                                        <option value="document">文档级摘要</option>
                                                        <option value="chapter">章节级摘要</option>
                                                        <option value="paragraph">段落级摘要</option>
                                                        <option value="code">代码级摘要</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">摘要长度</label>
                                                    <select
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                                        value={summaryLength}
                                                        onChange={(e) => setSummaryLength(e.target.value)}
                                                    >
                                                        <option value="concise">简洁 (50-100字)</option>
                                                        <option value="standard">标准 (100-200字)</option>
                                                        <option value="detailed">详细 (200-300字)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">摘要风格</label>
                                                    <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                                                        <option>技术性</option>
                                                        <option>通俗易懂</option>
                                                        <option>专业报告</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                onClick={processDocument}
                                                disabled={!fileId || isProcessing}
                                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-semibold transition-all disabled:opacity-50"
                                            >
                                                {isProcessing ? '生成中...' : '生成摘要'}
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-white">摘要结果</h3>
                                            <div className="bg-gray-900/50 rounded-lg p-4 min-h-40">
                                                {summary ? (
                                                    <div className="text-gray-200 whitespace-pre-line">{summary}</div>
                                                ) : (
                                                    <div className="text-gray-500 flex items-center justify-center h-32">
                                                        {!fileId ? '请先上传文件' : '点击生成按钮获取摘要'}
                                                    </div>
                                                )}
                                            </div>

                                            {summary && (
                                                <div className="flex gap-3">
                                                    <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                                                        复制摘要
                                                    </button>
                                                    <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                                                        导出摘要
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 通用操作按钮 */}
                            <div className="flex gap-4 pt-6 border-t border-gray-700/50">
                                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-semibold transition-all">
                                    开始处理
                                </button>
                                <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                                    查看示例
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // 背景网格组件（保持不变）
    const BackgroundGrid = () => {
        const techWords = [
            "AI解析", "智能摘要", "文档理解", "知识增强",
            "多格式", "自动化", "定制化", "专业级"
        ];

        return (
            <div className="fixed inset-0 z-0 overflow-hidden">
                {/* 网格背景 */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px),
                            linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>

                {/* 浮动科技词汇 */}
                {techWords.map((word, index) => {
                    const colors = ['text-cyan-400', 'text-blue-400', 'text-purple-400'];
                    const colorClass = colors[index % colors.length];
                    const left = Math.random() * 90 + 5;
                    const top = Math.random() * 90 + 5;
                    const duration = Math.random() * 20 + 20;

                    return (
                        <div
                            key={index}
                            className={`absolute opacity-10 hover:opacity-20 transition-opacity duration-300 ${colorClass} font-mono font-bold`}
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                fontSize: '14px',
                                animation: `float ${duration}s linear infinite`
                            }}
                        >
                            {word}
                        </div>
                    );
                })}
            </div>
        );
    };

    // 主渲染
    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            <BackgroundGrid />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* 顶部导航 */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">DocSummAI</h1>
                            <p className="text-xs text-gray-400">专业文档智能平台</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentModule === 'home' ? (
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                                <Shield className="w-4 h-4" />
                                <span>企业级安全</span>
                                <Globe className="w-4 h-4 ml-4" />
                                <span>多语言支持</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setCurrentModule('home')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                返回首页
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 左侧模块导航 */}
                    <div className={`lg:w-64 ${currentModule !== 'home' ? 'hidden lg:block' : ''}`}>
                        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-cyan-400" />
                                核心模块
                            </h2>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setCurrentModule('home')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                        currentModule === 'home'
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                                            : 'hover:bg-gray-800/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5" />
                                        <span className="font-medium">欢迎主页</span>
                                    </div>
                                </button>

                                {modules.map((module) => (
                                    <button
                                        key={module.id}
                                        onClick={() => {
                                            setCurrentModule(module.id);
                                            setActiveSubModule(null);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                            currentModule === module.id
                                                ? `bg-gradient-to-r ${module.color} bg-opacity-20 border ${module.color.split(' ')[0].replace('from-', 'border-')}/30`
                                                : 'hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <module.icon className="w-5 h-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">{module.name}</div>
                                                <div className="text-xs text-gray-400 mt-1">{module.description}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* 当前状态 */}
                            <div className="mt-8 pt-6 border-t border-gray-700/50">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">处理状态</h3>
                                <div className="space-y-3">
                                    {uploadedFile && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">已上传文件</span>
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    )}
                                    {isProcessing && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">处理中...</span>
                                            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    {taskStatus === 'completed' && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">处理完成</span>
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 系统特性 */}
                        <div className="mt-4 bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                            <div className="space-y-3">
                                {[
                                    { icon: Lock, text: '数据加密存储', color: 'text-cyan-400' },
                                    { icon: Zap, text: '快速处理', color: 'text-blue-400' },
                                    { icon: Globe, text: '多语言支持', color: 'text-purple-400' }
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm">
                                        <feature.icon className={`w-4 h-4 ${feature.color}`} />
                                        <span className="text-gray-300">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右侧内容区域 */}
                    <div className="flex-1">
                        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
                            {renderModuleContent()}
                            {/* ========== 新增：中英文摘要展示区域 ========== */}
                            {/* 中文摘要 */}
                            {chineseSummary && (
                                <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-emerald-500/20">
                                    <h3 className="text-xl font-bold mb-4 text-emerald-400">中文摘要结果</h3>
                                    <div className="text-gray-200 whitespace-pre-line">{chineseSummary}</div>
                                </div>
                            )}

                            {/* 英文摘要 */}
                            {englishSummary && (
                                <div className="mt-4 p-6 bg-gray-800/50 rounded-xl border border-blue-500/20">
                                    <h3 className="text-xl font-bold mb-4 text-blue-400">English Summary</h3>
                                    <div className="text-gray-200 whitespace-pre-line">{englishSummary}</div>
                                </div>
                            )}
                        </div>

                        {/* 页脚 */}
                        <footer className="mt-8 text-center text-gray-500 text-sm">
                            <p>© 2024 DocSummAI Pro. 专业文档智能处理平台 | 版本 3.0.0</p>
                            <p className="mt-2">融合五大核心模块，提供全面的文档智能解决方案</p>
                        </footer>
                    </div>
                </div>
            </div>

            {/* 动画样式 */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
                    50% { transform: translateY(-20px) translateX(10px); opacity: 0.2; }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.5); }
                }
                
                .gradient-border {
                    border: 2px solid transparent;
                    background: linear-gradient(black, black) padding-box,
                              linear-gradient(45deg, #06b6d4, #3b82f6) border-box;
                }
            `}</style>
        </div>
    );
}

export default App;