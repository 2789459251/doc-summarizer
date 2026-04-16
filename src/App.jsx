// src/App.js - 主应用组件
import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Layout from './components/Layout';
import GuideModal from './components/GuideModal';
import HomePage from './pages/HomePage';
import Parse from './pages/Parse';
import Understand from './pages/Understand';
import Summary from './pages/Summary';
import Knowledge from './pages/Knowledge';
import Customize from './pages/Customize';
import Profile from './pages/Profile';
import ToastContainer, { useToast } from './components/Toast';

function App() {
    // 核心状态管理
    const [currentModule, setCurrentModule] = useState('home');
    const [activeSubModule, setActiveSubModule] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [text, setText] = useState('');
    const [summaryType, setSummaryType] = useState('document');
    const [summaryLength, setSummaryLength] = useState('standard');
    const [englishSummary, setEnglishSummary] = useState('');
    const [chineseSummary, setChineseSummary] = useState('');
    const [outputLanguage, setOutputLanguage] = useState('auto');
    const [exampleMode, setExampleMode] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    // Toast 通知
    const { toasts, removeToast, toast } = useToast();

    // 从AuthContext获取登录状态
    const { user, token, logout } = useAuth();

    // ========== 工具函数 ==========
    // 统计中文字符
    const countChineseChars = (text) => {
        if (!text) return 0;
        return text.replace(/\s/g, '').length;
    };

    // 统计英文单词
    const countEnglishWords = (text) => {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(word => word).length;
    };

    // ========== API请求函数 ==========
    // 处理文件上传
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploadedFile(file);
        setUploadProgress(0);
        setIsProcessing(true);
        setExampleMode(false);

        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            const response = await fetch('http://localhost:8000/api/upload/', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: { 'Authorization': `${tokenType} ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '上传失败，请检查是否已登录');
            }
            const data = await response.json();
            setFileId(data.file_id);
            setUploadProgress(100);
            await fetchFileContent(data.file_id);
            setIsProcessing(false);
            toast.success(`文件 ${file.name} 上传成功！`);
        } catch (error) {
            console.error('上传错误:', error);
            toast.error('文件上传失败', {
                title: '上传失败',
                details: error.message || '请检查网络连接和登录状态'
            });
            setIsProcessing(false);
        }
    };

    // 获取文件内容
    const fetchFileContent = async (fileId) => {
        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            const response = await fetch(`http://localhost:8000/api/document/${fileId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Authorization': `${tokenType} ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '获取文件内容失败');
            }
            const data = await response.json();
            setText(data.content || '');
        } catch (error) {
            console.error('获取文件内容错误:', error);
            setText(`[无法加载文件内容: ${error.message}]`);
            toast.error('获取文件内容失败', { details: error.message });
        }
    };

    // 处理文档生成摘要
    const processDocument = async () => {
        if (!fileId && !exampleMode) {
            toast.warning('请先上传文件！');
            return;
        }
        
        // 粒度字数限制检查
        const grainularityLimits = {
            concise: 50,
            standard: 100,
            detailed: 200
        };
        const minChars = grainularityLimits[summaryLength] || 100;
        const docLength = text ? text.replace(/\s/g, '').length : 0;
        if (docLength > 0 && docLength < minChars) {
            toast.warning(`文档字数(${docLength}字)少于${summaryLength === 'concise' ? '简洁' : summaryLength === 'standard' ? '标准' : '详细'}摘要最低要求(${minChars}字)，请选择较短的粒度`);
            return;
        }
        
        setIsProcessing(true);
        setTaskStatus('processing');

        if (exampleMode) {
            const exampleSummary = {
                chinese: "本周重点学习了数据结构中的线索树和树的遍历算法...",
                english: "This week, I focused on learning threaded trees and tree traversal algorithms..."
            };
            setChineseSummary(exampleSummary.chinese);
            setEnglishSummary(exampleSummary.english);
            setIsProcessing(false);
            setTaskStatus('completed');
            toast.success('示例摘要加载成功！');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            const response = await fetch(`http://localhost:8000/api/process/${fileId}?summary_type=${summaryType}&summary_length=${summaryLength}&output_language=${outputLanguage}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Authorization': `${tokenType} ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '启动处理失败');
            }
            const data = await response.json();
            setTaskId(data.task_id);
            startPollingTaskStatus(data.task_id);
        } catch (error) {
            console.error('处理文档错误:', error);
            toast.error('处理文档失败', {
                title: '处理失败',
                details: error.message
            });
            setIsProcessing(false);
            setTaskStatus('failed');
        }
    };

    // 轮询任务状态
    const startPollingTaskStatus = (taskId) => {
        if (pollingInterval) clearInterval(pollingInterval);
        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const tokenType = localStorage.getItem('token_type') || 'Bearer';
                const response = await fetch(`http://localhost:8000/api/task/${taskId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Authorization': `${tokenType} ${token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || '获取任务状态失败');
                }
                const data = await response.json();
                setTaskStatus(data.status);
                if (data.status === 'completed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    toast.success('任务处理完成！');
                    await fetchSummary(taskId);
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    toast.error('任务处理失败', {
                        title: '处理失败',
                        details: data.error || '未知错误'
                    });
                }
            } catch (error) {
                console.error('轮询任务状态错误:', error);
                toast.error('获取任务状态失败', { details: error.message });
            }
        }, 2000);
        setPollingInterval(interval);
    };

    // 获取摘要
    const fetchSummary = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            const response = await fetch(`http://localhost:8000/api/summary/${taskId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Authorization': `${tokenType} ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '获取摘要失败');
            }
            const data = await response.json();
            const chineseContent = data.chinese || data.summary_chinese || data.summary?.chinese || '';
            const englishContent = data.english || data.summary_english || data.summary?.english || '';

            if (outputLanguage === 'chinese') {
                setChineseSummary(chineseContent);
                setEnglishSummary('');
            } else if (outputLanguage === 'english') {
                setEnglishSummary(englishContent);
                setChineseSummary('');
            } else {
                setChineseSummary(chineseContent);
                setEnglishSummary(englishContent);
            }
            toast.success('摘要生成成功！');
        } catch (error) {
            console.error('获取摘要错误:', error);
            toast.error('获取摘要失败', { details: error.message });
        }
    };

    // 查看示例
    const handleViewExample = () => {
        setExampleMode(true);
        setChineseSummary('');
        setEnglishSummary('');
        processDocument();
    };

    // 复制摘要
    const copySummary = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy)
            .then(() => toast.success('摘要复制成功！'))
            .catch(() => toast.error('复制失败，请手动复制'));
    };

    // 导出摘要
    const exportSummary = () => {
        if (!chineseSummary) {
            toast.warning('暂无摘要可导出');
            return;
        }
        
        const content = '### 文档摘要\n\n' + chineseSummary + '\n';
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `文档摘要_${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('摘要导出成功！');
    };

    // 清理轮询
    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [pollingInterval]);

    // 监听全局Toast事件（用于401未授权等错误）
    useEffect(() => {
        const handleToastEvent = (event) => {
            const { detail } = event;
            if (detail) {
                // request.js发送的detail包含type, title, message等属性
                const toastType = detail.type || 'error';
                const message = detail.message || detail.title || '发生错误';
                
                toast[toastType](message, {
                    title: detail.title,
                    details: detail.details,
                    duration: detail.duration || 8000,
                    action: detail.action
                });
            }
        };

        window.addEventListener('showToast', handleToastEvent);
        
        return () => {
            window.removeEventListener('showToast', handleToastEvent);
        };
    }, [toast]);

    // 渲染不同模块
    const renderContent = () => {
        if (currentModule === 'home') {
            return (
                <HomePage
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                    uploadProgress={uploadProgress}
                    setUploadProgress={setUploadProgress}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    fileId={fileId}
                    setFileId={setFileId}
                    text={text}
                    setText={setText}
                    summaryType={summaryType}
                    setSummaryType={setSummaryType}
                    summaryLength={summaryLength}
                    setSummaryLength={setSummaryLength}
                    outputLanguage={outputLanguage}
                    setOutputLanguage={setOutputLanguage}
                    chineseSummary={chineseSummary}
                    setChineseSummary={setChineseSummary}
                    englishSummary={englishSummary}
                    setEnglishSummary={setEnglishSummary}
                    exampleMode={exampleMode}
                    setExampleMode={setExampleMode}
                    handleFileUpload={handleFileUpload}
                    processDocument={processDocument}
                    handleViewExample={handleViewExample}
                    copySummary={copySummary}
                    exportSummary={exportSummary}
                    countChineseChars={countChineseChars}
                    countEnglishWords={countEnglishWords}
                />
            );
        }
        if (currentModule === 'login') return <Login onLoginSuccess={() => setCurrentModule('home')} onSwitchToRegister={() => setCurrentModule('register')} />;
        if (currentModule === 'register') return <Register onRegisterSuccess={() => setCurrentModule('login')} />;
        if (currentModule === 'history') return <History />;
        if (currentModule === 'parse') return (
            <Parse 
                fileId={fileId} 
                setFileId={setFileId}
                summaryLength={summaryLength}
                toast={toast} 
            />
        );
        if (currentModule === 'understand') return (
            <Understand
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                fileId={fileId}
                setFileId={setFileId}
                onShowToast={toast}
            />
        );
        if (currentModule === 'summary') return <Summary />;
        if (currentModule === 'knowledge') return (
            <Knowledge
                fileId={fileId}
                setFileId={setFileId}
                toast={toast}
            />
        );
        if (currentModule === 'customize') return <Customize />;
        if (currentModule === 'profile') {
            return (
                <Profile
                    user={user}
                    logout={logout}
                    onGoToLogin={() => setCurrentModule('login')}
                />
            );
        }
        return <div className="text-center py-8">该模块功能已拆分，敬请期待</div>;
    };

    // 主渲染
    return (
        <ThemeProvider>
            {/* Toast 通知容器 */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <Layout user={user} logout={logout} currentModule={currentModule} setCurrentModule={setCurrentModule}>
                {/* 引导动画 */}
                <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
                {/* 模块内容 */}
                {renderContent()}
            </Layout>
        </ThemeProvider>
    );
}

export default App;
