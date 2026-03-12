// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';
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
function App() {
    // 核心状态管理（保留不动）
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

    // 从AuthContext获取登录状态
    const { user, token, logout } = useAuth();

    // ========== 工具函数（保留不动） ==========
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

    // ========== API请求函数（保留不动） ==========
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
            if (!response.ok) throw new Error('上传失败，请检查是否已登录');
            const data = await response.json();
            setFileId(data.file_id);
            setUploadProgress(100);
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
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            const response = await fetch(`http://localhost:8000/api/document/${fileId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Authorization': `${tokenType} ${token}` }
            });
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
        if (!fileId && !exampleMode) {
            alert('请先上传文件！');
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
            alert('示例摘要加载成功！');
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
                if (!response.ok) throw new Error('获取任务状态失败');
                const data = await response.json();
                setTaskStatus(data.status);
                if (data.status === 'completed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    await fetchSummary(taskId);
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    alert('任务处理失败: ' + (data.error || '未知错误'));
                }
            } catch (error) {
                console.error('轮询任务状态错误:', error);
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
            if (!response.ok) throw new Error('获取摘要失败');
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
            alert('摘要生成成功！');
        } catch (error) {
            console.error('获取摘要错误:', error);
            alert('获取摘要失败: ' + error.message);
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
            .then(() => alert('摘要复制成功！'))
            .catch(() => alert('复制失败，请手动复制'));
    };

    // 导出摘要
    const exportSummary = () => {
        let content = '';
        if (chineseSummary) {
            content += '### 中文摘要\n' + chineseSummary + '\n\n';
        }
        if (englishSummary && (outputLanguage === 'auto' || outputLanguage === 'english')) {
            content += '### 英文摘要\n' + englishSummary + '\n\n';
        }
        if (!content) {
            alert('暂无摘要可导出');
            return;
        }
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `文档摘要_${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 清理轮询
    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [pollingInterval]);

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
        if (currentModule === 'parse') return <Parse />;
        if (currentModule === 'understand') return <Understand />;
        if (currentModule === 'summary') return <Summary />;
        if (currentModule === 'knowledge') return <Knowledge />;
        if (currentModule === 'customize') return <Customize />;
        // App.js 中渲染 Profile 的地方
        // App.js 里的 renderContent 函数
        // App.js 中的 renderContent
        if (currentModule === 'profile') {
            return (
                <Profile
                    user={user}
                    logout={logout}
                    // 用一个不会写错的名字传递跳转函数
                    onGoToLogin={() => setCurrentModule('login')}
                />
            );
        }
        return <div className="text-center py-8">该模块功能已拆分，敬请期待</div>;
    };

    // 主渲染
    return (
        <Layout user={user} logout={logout} currentModule={currentModule} setCurrentModule={setCurrentModule}>
            {/* 引导动画 */}
            <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
            {/* 模块内容 */}
            {renderContent()}
        </Layout>
    );
}

export default App;