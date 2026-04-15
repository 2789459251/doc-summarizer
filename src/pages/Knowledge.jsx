// 领域知识增强 + 智能问答模块
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Brain, Send, MessageCircle, Sparkles, Loader2, Copy,
    FileText, RefreshCw, Trash2, AlertCircle, CheckCircle, X,
    BookOpen, Zap, ChevronRight
} from 'lucide-react';
import { askQuestion, multiDocAsk, uploadFile, getDocument } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

// 扩展知识库内容
const KNOWLEDGE_DOMAINS = [
    { 
        id: 'cs', 
        name: '计算机学科', 
        icon: '💻', 
        topics: ['算法', '网络', '操作系统', 'AI', '编译原理'],
        description: '涵盖软件开发、系统架构、数据结构等计算机专业知识',
        details: {
            '算法': '包括排序算法、搜索算法、图算法、动态规划、分治策略等核心算法理论与实现',
            '网络': '涵盖TCP/IP协议栈、HTTP/HTTPS、WebSocket、网络安全、分布式系统等',
            '操作系统': '包括进程管理、内存管理、文件系统、并发控制、死锁处理等',
            'AI': '机器学习、深度学习、自然语言处理、计算机视觉、强化学习等人工智能技术',
            '编译原理': '词法分析、语法分析、语义分析、中间代码生成、代码优化等编译器设计'
        }
    },
    { 
        id: 'medical', 
        name: '医学领域', 
        icon: '🏥', 
        topics: ['病例', '文献', '指南', '临床术语'],
        description: '医学文献、临床指南、病例分析等专业医学知识',
        details: {
            '病例': '各类疾病的临床表现、诊断要点、治疗方案及预后评估',
            '文献': '最新的医学研究论文、临床试验数据、专家共识',
            '指南': '国际国内官方临床诊疗指南、用药规范、医疗标准',
            '临床术语': '医学专业术语缩写、国际疾病分类(ICD)、临床检验指标解读'
        }
    },
    { 
        id: 'law', 
        name: '法律财经', 
        icon: '⚖️', 
        topics: ['合同', '条款', '财报', '政策文件'],
        description: '法律法规、合同审查、财务分析、政策解读',
        details: {
            '合同': '合同法基本原则、合同条款设计、风险防范、违约责任',
            '条款': '法律条文解读、适用条件、司法解释、判例参考',
            '财报': '资产负债表、利润表、现金流量表分析，企业财务健康评估',
            '政策文件': '国家政策解读、行业法规、合规要求、监管动态'
        }
    },
    { 
        id: 'science', 
        name: '自然科学', 
        icon: '🔬', 
        topics: ['物理', '化学', '生物', '数学'],
        description: '基础自然科学理论、实验方法、科学研究',
        details: {
            '物理': '力学、热学、电磁学、光学、量子物理等基础物理理论',
            '化学': '有机化学、无机化学、物理化学、分析化学及化学实验方法',
            '生物': '细胞生物学、分子生物学、遗传学、生态学等生命科学',
            '数学': '微积分、线性代数、概率统计、离散数学等数学基础'
        }
    },
    { 
        id: 'business', 
        name: '商业管理', 
        icon: '📊', 
        topics: ['市场', '运营', '战略', '财务'],
        description: '企业管理、市场营销、战略规划、财务管理',
        details: {
            '市场': '市场调研、消费者行为、品牌管理、营销策略、市场竞争分析',
            '运营': '供应链管理、生产运营、质量管理、流程优化、效率提升',
            '战略': '企业战略规划、商业模式创新、竞争战略、并购重组',
            '财务': '投融资决策、资本运作、成本控制、预算管理、绩效评估'
        }
    }
];

const Knowledge = ({ fileId, setFileId, toast }) => {
    const { isDarkMode } = useTheme();
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [domainDetailModal, setDomainDetailModal] = useState(null); // 查看知识库详情
    const [selectedTopic, setSelectedTopic] = useState(null); // 选中的具体话题

    // 问答相关状态
    const [qaFileId, setQaFileId] = useState(null);
    const [qaFile, setQaFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputQuestion, setInputQuestion] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [sessionId] = useState(() => `qa_${Date.now()}`);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // 追踪正在处理的请求
    const [pendingQuestions, setPendingQuestions] = useState([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 处理文件上传用于问答
    const handleQaFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setQaFile(file);
        setIsAnalyzing(true);

        try {
            const result = await uploadFile(file, () => {});
            setQaFileId(result.file_id);

            const docData = await getDocument(result.file_id);

            setAnalysisResult({
                fileName: file.name,
                fileSize: result.file_size,
                contentLength: docData.content?.length || 0,
                truncated: docData.truncated,
                preview: docData.content?.substring(0, 500) + '...'
            });

            toast?.success(`文档 ${file.name} 加载成功！可以开始提问了。`);
        } catch (error) {
            console.error('上传错误:', error);
            toast?.error('文档加载失败', {
                title: '加载失败',
                details: error.message
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 发送问题 - 支持并发
    const handleSendQuestion = async () => {
        if (!inputQuestion.trim()) return;

        const question = inputQuestion.trim();
        const questionId = `q_${Date.now()}`;
        setInputQuestion('');
        setIsAsking(true);

        // 添加用户消息（包含知识库信息）
        setMessages(prev => [...prev, {
            id: questionId,
            role: 'user',
            content: question,
            time: new Date().toLocaleTimeString(),
            status: 'sending',
            domain: selectedDomain ? KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.name : null,
            topic: selectedTopic
        }]);

        // 追踪这个请求
        setPendingQuestions(prev => [...prev, questionId]);

        try {
            let result;
            const targetFileId = qaFileId || fileId;

            if (!targetFileId) {
                throw new Error('请先上传文档或使用已上传的文档');
            }

            // 构建包含知识库上下文的增强问题
            let enhancedQuestion = question;
            if (selectedDomain) {
                const domain = KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain);
                if (domain) {
                    // 如果选中了具体话题，添加话题上下文
                    if (selectedTopic && domain.details?.[selectedTopic]) {
                        enhancedQuestion = `[关于${domain.name}的${selectedTopic}]: ${question}\n\n相关知识背景: ${domain.details[selectedTopic]}`;
                    } else {
                        enhancedQuestion = `[${domain.name}领域]: ${question}`;
                    }
                }
            }

            result = await askQuestion({
                fileId: targetFileId,
                question: enhancedQuestion,
                sessionId
            });

            // 更新消息状态
            setMessages(prev => prev.map(msg =>
                msg.id === questionId
                    ? { ...msg, status: 'completed' }
                    : msg
            ));

            if (result.success || result.answer) {
                // 构建带来源标注的回答
                let answerContent = result.answer || '抱歉，我无法回答这个问题。';
                
                // 如果使用了知识库，添加标注
                if (result.source_types?.length > 0 || result.has_knowledge_content) {
                    const sources = [];
                    if (result.has_document_content) sources.push('📄 文档');
                    if (result.has_knowledge_content) sources.push('📚 知识库');
                    if (sources.length > 0) {
                        answerContent = `【信息来源: ${sources.join(' + ')}】\n\n${answerContent}`;
                    }
                }

                setMessages(prev => [...prev, {
                    id: `a_${Date.now()}`,
                    role: 'assistant',
                    content: answerContent,
                    time: new Date().toLocaleTimeString(),
                    sources: result.sources,
                    sourceTypes: result.source_types
                }]);

                if (result.needs_clarification && result.clarification_question) {
                    setMessages(prev => [...prev, {
                        id: `s_${Date.now()}`,
                        role: 'system',
                        content: `💡 追问建议: ${result.clarification_question}`,
                        time: new Date().toLocaleTimeString()
                    }]);
                }
            } else {
                throw new Error(result.detail || '回答生成失败');
            }
        } catch (error) {
            console.error('问答错误:', error);
            toast?.error('回答生成失败', {
                title: '生成失败',
                details: error.message
            });

            setMessages(prev => prev.map(msg =>
                msg.id === questionId
                    ? { ...msg, status: 'error', error: error.message }
                    : msg
            ));
        } finally {
            setIsAsking(false);
            setPendingQuestions(prev => prev.filter(id => id !== questionId));
        }
    };

    // 发送追问 - 不清空输入
    const handleFollowUp = useCallback(async (question) => {
        if (!question.trim()) return;

        const questionId = `q_${Date.now()}`;

        setMessages(prev => [...prev, {
            id: questionId,
            role: 'user',
            content: question,
            time: new Date().toLocaleTimeString(),
            status: 'sending'
        }]);

        setPendingQuestions(prev => [...prev, questionId]);
        setIsAsking(true);

        try {
            const targetFileId = qaFileId || fileId;
            if (!targetFileId) throw new Error('请先上传文档');

            const result = await askQuestion({
                fileId: targetFileId,
                question,
                sessionId
            });

            setMessages(prev => prev.map(msg =>
                msg.id === questionId ? { ...msg, status: 'completed' } : msg
            ));

            if (result.success || result.answer) {
                setMessages(prev => [...prev, {
                    id: `a_${Date.now()}`,
                    role: 'assistant',
                    content: result.answer || '无法回答',
                    time: new Date().toLocaleTimeString()
                }]);
            }
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.id === questionId ? { ...msg, status: 'error', error: error.message } : msg
            ));
            toast?.error('追问失败', { details: error.message });
        } finally {
            setIsAsking(false);
            setPendingQuestions(prev => prev.filter(id => id !== questionId));
        }
    }, [qaFileId, fileId, sessionId, toast]);

    // 清空对话
    const handleClearChat = () => {
        setMessages([]);
        toast?.info('对话已清空');
    };

    // 复制消息
    const handleCopyMessage = (content) => {
        navigator.clipboard.writeText(content)
            .then(() => toast?.success('已复制到剪贴板'))
            .catch(() => toast?.error('复制失败'));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendQuestion();
        }
    };

    // 获取当前可用的文件ID
    const availableFileId = qaFileId || fileId;

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
                    领域知识增强 & 智能问答
                </h1>
                <p className="text-gray-400 mt-2">结合专业知识库和文档内容，获得精准的智能问答体验</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* 左侧 */}
                <div className="space-y-6">
                    {/* 领域知识卡片 */}
                    <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white border-orange-200'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-pink-400" />
                            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>领域知识</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {KNOWLEDGE_DOMAINS.map(domain => (
                                <button
                                    key={domain.id}
                                    onClick={() => {
                                        const newDomain = selectedDomain === domain.id ? null : domain.id;
                                        setSelectedDomain(newDomain);
                                        setSelectedTopic(null); // 切换领域时重置话题
                                    }}
                                    onDoubleClick={() => setDomainDetailModal(domain)} // 双击查看详情
                                    className={`
                                        p-4 rounded-xl border transition-all text-left
                                        ${selectedDomain === domain.id
                                            ? isDarkMode ? 'border-pink-500 bg-pink-500/10' : 'border-orange-500 bg-orange-50'
                                            : isDarkMode ? 'border-gray-700/50 hover:border-gray-600' : 'border-orange-200 hover:border-orange-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl mb-2">{domain.icon}</div>
                                        {selectedDomain === domain.id && (
                                            <span className={`text-xs ${isDarkMode ? 'text-pink-400' : 'text-orange-500'}`}>
                                                ✓ 已激活
                                            </span>
                                        )}
                                    </div>
                                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{domain.name}</div>
                                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {domain.topics.join(' · ')}
                                    </div>
                                    <div className="text-xs mt-2 text-gray-500 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        双击查看详情
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedDomain && (
                            <div className={`mt-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-orange-50'}`}>
                                <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.name} 知识库已激活
                                </div>
                                <div className={`text-xs mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.description}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.topics.map(topic => (
                                        <button
                                            key={topic}
                                            onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                                selectedTopic === topic
                                                    ? isDarkMode ? 'bg-pink-500 text-white' : 'bg-orange-500 text-white'
                                                    : isDarkMode ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
                                            }`}
                                        >
                                            {selectedTopic === topic && '✓ '}{topic}
                                        </button>
                                    ))}
                                </div>
                                {selectedTopic && (
                                    <div className={`mt-3 p-3 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-white text-gray-600'}`}>
                                        <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
                                        <strong>选中话题:</strong> {selectedTopic}
                                        <p className="mt-1">
                                            {KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.details?.[selectedTopic]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 智能问答区域 */}
                    <div className={`rounded-2xl border flex flex-col h-[500px] ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white border-orange-200'}`}>
                        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}`}>
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-pink-400" />
                                <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>智能问答</h2>
                                {availableFileId && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                        {qaFile?.name || '已加载文档'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {pendingQuestions.length > 0 && (
                                    <span className="text-xs text-yellow-400">
                                        {pendingQuestions.length} 个问题处理中...
                                    </span>
                                )}
                                <button
                                    onClick={handleClearChat}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                                    title="清空对话"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* 消息列表 */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Sparkles className="w-12 h-12 mb-4 text-pink-400/50" />
                                    <p className="text-center">
                                        {availableFileId
                                            ? '文档已加载，请开始提问'
                                            : '请先上传文档或使用已上传的文档'
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        支持多轮对话，我会记住上下文
                                    </p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {/* 白天模式：白底黑字；黑夜模式：黑底白字 */}
                                    <div className={`
                                        max-w-[80%] rounded-2xl p-4
                                        ${isDarkMode
                                            ? (msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                : msg.role === 'error'
                                                    ? 'bg-red-900/50 border border-red-500/30 text-red-200'
                                                    : msg.role === 'system'
                                                        ? 'bg-yellow-900/30 border border-yellow-500/30 text-yellow-200'
                                                        : 'bg-gray-800 text-gray-100 rounded-bl-md')
                                            : (msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-md'  // 用户消息保持蓝色
                                                : msg.role === 'error'
                                                    ? 'bg-white border border-orange-300 text-black'
                                                    : msg.role === 'system'
                                                        ? 'bg-white border border-orange-300 text-black'
                                                        : 'bg-white border border-gray-300 text-gray-900 rounded-bl-md')
                                        }
                                    `}>
                                        {msg.status === 'sending' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Loader2 className={`w-4 h-4 animate-spin ${isDarkMode ? '' : 'text-gray-700'}`} />
                                                <span className={`text-xs opacity-60 ${isDarkMode ? '' : 'text-gray-600'}`}>发送中...</span>
                                            </div>
                                        )}
                                        <div className={`text-sm whitespace-pre-wrap ${isDarkMode ? '' : 'text-gray-900'}`}>{msg.content}</div>
                                        {msg.status === 'error' && (
                                            <div className="mt-2 text-xs text-red-400">
                                                错误: {msg.error}
                                            </div>
                                        )}
                                        <div className={`
                                            flex items-center justify-between mt-2 pt-2 border-t
                                            ${isDarkMode
                                                ? (msg.role === 'user' ? 'border-blue-500/30' : 'border-gray-700')
                                                : (msg.role === 'user' ? 'border-blue-500/30' : 'border-gray-300')
                                            }
                                        `}>
                                            <span className="text-xs opacity-60">{msg.time}</span>
                                            {msg.role === 'assistant' && (
                                                <button
                                                    onClick={() => handleCopyMessage(msg.content)}
                                                    className="p-1 hover:bg-white/10 rounded transition"
                                                >
                                                    <Copy className="w-3 h-3 opacity-60" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* 输入区域 - 白天模式白底黑字，黑夜模式黑底白字 */}
                        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}`}>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".pdf,.docx,.doc,.txt,.md"
                                    onChange={handleQaFileUpload}
                                    className="hidden"
                                />
                                {/* 上传文档按钮 */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isAnalyzing}
                                    className={`p-3 rounded-xl transition ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'}`}
                                    title="上传文档"
                                >
                                    {isAnalyzing ? (
                                        <Loader2 className={`w-5 h-5 animate-spin ${isDarkMode ? '' : 'text-gray-800'}`} />
                                    ) : (
                                        <FileText className={`w-5 h-5 ${isDarkMode ? '' : 'text-gray-800'}`} />
                                    )}
                                </button>

                                {/* 文本输入框 - 白天模式白底黑字，黑夜模式黑底白字 */}
                                <textarea
                                    value={inputQuestion}
                                    onChange={(e) => setInputQuestion(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={availableFileId ? '输入问题，按回车发送...' : '请先上传文档'}
                                    disabled={!availableFileId}
                                    className={`flex-1 border rounded-xl px-4 py-3 resize-none focus:outline-none disabled:opacity-50 ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-pink-500' : 'bg-white border-gray-300 focus:border-pink-400 text-gray-900'}`}
                                    rows={1}
                                />

                                {/* 发送按钮 - 白天模式白色背景+粉色边框，黑夜模式保持粉色 */}
                                <button
                                    onClick={handleSendQuestion}
                                    disabled={isAsking || !inputQuestion.trim() || !availableFileId}
                                    className={`
                                        p-3 rounded-xl transition
                                        ${isAsking || !inputQuestion.trim() || !availableFileId
                                            ? isDarkMode ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gray-200 cursor-not-allowed opacity-50 text-gray-500'
                                            : isDarkMode ? 'bg-pink-600 hover:bg-pink-500' : 'bg-white border border-pink-400 hover:bg-pink-50'
                                        }
                                        ${!isDarkMode && !(isAsking || !inputQuestion.trim() || !availableFileId) ? 'text-pink-600' : ''}
                                    `}
                                >
                                    {isAsking ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧 */}
                <div className="space-y-6">
                    {/* 文档状态 */}
                    <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white border-orange-300'}`}>
                        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-pink-500'}`}>
                            <FileText className="w-5 h-5 text-green-400" />
                            当前文档
                        </h2>

                        {qaFile ? (
                            <div className="space-y-3">
                                <div className={`flex items-center gap-3 p-3 border rounded-xl ${isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-pink-600'}`}>{qaFile.name}</div>
                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-pink-400'}`}>
                                            {(qaFile.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setQaFile(null);
                                            setQaFileId(null);
                                            setAnalysisResult(null);
                                            setMessages([]);
                                        }}
                                        className={`p-1 hover:rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-pink-100'}`}
                                    >
                                        <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-pink-400'}`} />
                                    </button>
                                </div>

                                {analysisResult && (
                                    <div className={`p-4 rounded-xl space-y-2 ${isDarkMode ? 'bg-gray-800/50' : 'bg-orange-50'}`}>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className={isDarkMode ? 'text-gray-400' : 'text-pink-500'}>文件大小：</span>
                                                <span className={isDarkMode ? '' : 'text-pink-600'}>{(analysisResult.fileSize / 1024).toFixed(1)} KB</span>
                                            </div>
                                            <div>
                                                <span className={isDarkMode ? 'text-gray-400' : 'text-pink-500'}>内容长度：</span>
                                                <span className={isDarkMode ? '' : 'text-pink-600'}>{analysisResult.contentLength} 字符</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-orange-300 hover:border-orange-400'}`}
                            >
                                <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-pink-300'}`} />
                                <p className={isDarkMode ? 'text-gray-400' : 'text-pink-500'}>点击上传文档开始问答</p>
                                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-pink-400'}`}>支持 PDF、Word、TXT、Markdown</p>
                            </div>
                        )}
                    </div>

                    {/* 问答提示 - 粉色字体+橙色边框+白色背景 */}
                    <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white border-orange-300'}`}>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-500">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            问答技巧
                        </h2>

                        <div className="space-y-3">
                            {[
                                { title: '具体提问', desc: '越具体的问题，答案越准确', num: '1' },
                                { title: '多轮对话', desc: '可以追问深入探讨同一话题', num: '2' },
                                { title: '选择领域', desc: '选择相关领域可获得更专业的回答', num: '3' }
                            ].map((item) => (
                                <div key={item.num} className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-orange-50'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-100 text-pink-500'}`}>{item.num}</div>
                                    <div>
                                        <div className={`font-medium text-sm ${isDarkMode ? '' : 'text-pink-600'}`}>{item.title}</div>
                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-pink-400'}`}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 示例问题 - 粉色字体+橙色边框+白色背景 */}
                    <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white border-orange-300'}`}>
                        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? '' : 'text-pink-500'}`}>示例问题</h2>
                        <div className="space-y-2">
                            {[
                                '这篇文档的主要观点是什么？',
                                '总结文档的核心内容',
                                '有哪些关键数据和结论？',
                                '文档的结构是怎样的？'
                            ].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInputQuestion(q);
                                        document.querySelector('textarea')?.focus();
                                    }}
                                    className={`w-full text-left p-3 rounded-lg transition text-sm ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-orange-50 hover:bg-orange-100 text-pink-600 border border-transparent hover:border-orange-200'}`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 知识库详情弹窗 */}
            {domainDetailModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setDomainDetailModal(null)}
                >
                    <div 
                        className={`rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 弹窗头部 */}
                        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{domainDetailModal.icon}</span>
                                    <div>
                                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            {domainDetailModal.name}
                                        </h3>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {domainDetailModal.description}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDomainDetailModal(null)}
                                    className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                >
                                    <X className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                </button>
                            </div>
                        </div>

                        {/* 知识话题列表 */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <h4 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                点击话题直接使用，或选择后进行问答
                            </h4>
                            <div className="space-y-4">
                                {domainDetailModal.topics.map((topic, index) => (
                                    <div 
                                        key={topic}
                                        className={`p-4 rounded-xl border transition-all ${
                                            isDarkMode 
                                                ? 'bg-gray-800/50 border-gray-700 hover:border-pink-500/50' 
                                                : 'bg-orange-50 border-orange-200 hover:border-orange-400'
                                        }`}
                                    >
                                        <button
                                            onClick={() => {
                                                setSelectedDomain(domainDetailModal.id);
                                                setSelectedTopic(topic);
                                                setDomainDetailModal(null);
                                                toast?.success(`已选择 ${topic} 话题，提问时将优先使用该知识`);
                                            }}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {index + 1}. {topic}
                                                </h5>
                                                <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                            </div>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {domainDetailModal.details?.[topic]}
                                            </p>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-pink-50 border border-pink-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className={`w-4 h-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                                        使用提示
                                    </span>
                                </div>
                                <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <li>• 点击话题即可在问答时使用该领域知识</li>
                                    <li>• 选中的话题会作为上下文传给 AI，获得更专业的回答</li>
                                    <li>• 可以同时结合上传的文档和知识库内容进行问答</li>
                                </ul>
                            </div>
                        </div>

                        {/* 弹窗底部 */}
                        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}`}>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedDomain(domainDetailModal.id);
                                        setDomainDetailModal(null);
                                        toast?.info(`已激活 ${domainDetailModal.name} 全部知识`);
                                    }}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                        isDarkMode 
                                            ? 'bg-pink-600 hover:bg-pink-500 text-white' 
                                            : 'bg-pink-500 hover:bg-pink-600 text-white'
                                    }`}
                                >
                                    使用全部话题
                                </button>
                                <button
                                    onClick={() => setDomainDetailModal(null)}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Knowledge;
