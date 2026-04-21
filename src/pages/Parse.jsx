import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Upload, CheckCircle, Loader2, Sparkles, X, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE } from '../utils/api';

const Parse = ({ 
    fileId: externalFileId, 
    setFileId: setExternalFileId, 
    summaryLength: externalSummaryLength,
    toast 
}) => {
    // ========== 状态管理 ==========
    const [summaryLength, setSummaryLength] = useState(externalSummaryLength || 'standard');
    const [hasUserSelected, setHasUserSelected] = useState(false);
    
    // 文件上传相关状态
    const [uploadedFile, setUploadedFile] = useState(null);
    const [localFileId, setLocalFileId] = useState(externalFileId || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // 处理状态
    const [isProcessing, setIsProcessing] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const [processingProgress, setProcessingProgress] = useState(0);
    
    // 摘要结果
    const [summaryResult, setSummaryResult] = useState(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    
    // 文件拖拽
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // 粒度选项
    const grainularityOptions = [
        { key: 'concise', label: '简洁', icon: '📋', desc: '一句话，极简概括', minChars: 10 },
        { key: 'standard', label: '标准', icon: '📄', desc: '核心观点 + 结论', minChars: 100 },
        { key: 'detailed', label: '详细', icon: '📑', desc: '完整逻辑 + 细节', minChars: 200 }
    ];

    // 粒度字数映射
    const grainularityLimits = {
        concise: { min: 10, label: '简洁摘要（极简版）' },
        standard: { min: 100, label: '标准摘要（常规版）' },
        detailed: { min: 200, label: '详细摘要（完整版）' }
    };

    // ========== 文件上传处理 ==========
    const handleFileSelect = async (file) => {
        if (!file) return;
        
        // 检查文件类型
        const allowedTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain', 
            'text/markdown',
            'text/x-python',
            'text/x-java-source',
            'application/json',
            'application/yaml'
        ];
        const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md', '.py', '.java', '.js', '.json', '.yaml', '.tex'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
            toast?.warning?.('不支持的文件格式，请上传 PDF、Word、TXT、MD 等文档');
            return;
        }

        // 检查文件大小（限制 50MB）
        if (file.size > 50 * 1024 * 1024) {
            toast?.warning?.('文件过大，请上传小于 50MB 的文件');
            return;
        }

        setUploadedFile(file);
        setIsUploading(true);
        setUploadProgress(0);
        setSummaryResult(null);
        setTaskStatus(null);

        // 模拟上传进度
        const progressTimer = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressTimer);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/api/upload/`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: { 
                    'Authorization': `${tokenType} ${token}`
                }
            });

            if (!response.ok) {
                clearInterval(progressTimer);
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '上传失败');
            }

            const data = await response.json();
            setUploadProgress(100);
            
            toast?.success?.(`文件 ${file.name} 上传成功！`);
            
            // 首次处理文档（使用原始 /api/process 接口）
            const firstProcessResponse = await fetch(
                `${API_BASE}/api/process/${data.file_id}?summary_type=document&summary_length=${summaryLength}&output_language=chinese`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 
                        'Authorization': `${tokenType} ${token}`
                    }
                }
            );

            if (!firstProcessResponse.ok) {
                clearInterval(progressTimer);
                const errorData = await firstProcessResponse.json().catch(() => ({}));
                throw new Error(errorData.detail || '启动处理失败');
            }

            clearInterval(progressTimer);

            const processData = await firstProcessResponse.json();
            setLocalFileId(data.file_id);
            setExternalFileId?.(data.file_id);
            setTaskId(processData.task_id);
            
            // 开始轮询任务状态
            startPollingTaskStatus(processData.task_id);
            
        } catch (error) {
            clearInterval(progressTimer);
            console.error('上传错误:', error);
            toast?.error?.('文件上传失败', { 
                title: '上传失败',
                details: error.message || '请检查网络连接和登录状态'
            });
            setUploadedFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    // 处理文件选择事件
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // 处理拖拽
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // ========== 文档处理 ==========
    const processDocument = async (fileIdToUse) => {
        if (!fileIdToUse && !localFileId) {
            toast?.warning?.('请先上传文件');
            return;
        }

        const targetFileId = fileIdToUse || localFileId;
        
        setIsProcessing(true);
        setTaskStatus('processing');
        setProcessingProgress(0);
        setIsRegenerating(!!fileIdToUse); // 如果传入了fileId，说明是重新生成

        // 模拟处理进度
        const progressTimer = setInterval(() => {
            setProcessingProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressTimer);
                    return prev;
                }
                return prev + Math.random() * 15;
            });
        }, 500);

        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            
            // 重新处理文档（使用新的粒度）
            const reprocessResponse = await fetch(
                `${API_BASE}/api/process/${targetFileId}/reprocess?summary_type=document&summary_length=${summaryLength}&output_language=chinese`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 
                        'Authorization': `${tokenType} ${token}`
                    }
                }
            );

            if (!reprocessResponse.ok) {
                const errorData = await reprocessResponse.json().catch(() => ({}));
                throw new Error(errorData.detail || '启动重新处理失败');
            }

            const data = await reprocessResponse.json();
            setTaskId(data.task_id);
            
            // 开始轮询任务状态
            startPollingTaskStatus(data.task_id);
            
        } catch (error) {
            clearInterval(progressTimer);
            console.error('处理文档错误:', error);
            toast?.error?.('处理文档失败', {
                title: '处理失败',
                details: error.message
            });
            setIsProcessing(false);
            setTaskStatus('failed');
        }
    };

    // 轮询任务状态
    const startPollingTaskStatus = (taskIdToPoll) => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const tokenType = localStorage.getItem('token_type') || 'Bearer';
                
                const response = await fetch(`${API_BASE}/api/task/${taskIdToPoll}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 
                        'Authorization': `${tokenType} ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || '获取任务状态失败');
                }

                const data = await response.json();
                setTaskStatus(data.status);
                setProcessingProgress(data.progress || 100);

                if (data.status === 'completed') {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                    setIsProcessing(false);
                    setIsRegenerating(false);
                    setProcessingProgress(100);
                    toast?.success?.('文档处理完成！');
                    
                    // 获取摘要结果
                    await fetchSummary(taskIdToPoll);
                } else if (data.status === 'failed') {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                    setIsProcessing(false);
                    setIsRegenerating(false);
                    toast?.error?.('文档处理失败', {
                        title: '处理失败',
                        details: data.error || '未知错误'
                    });
                }
            } catch (error) {
                console.error('轮询任务状态错误:', error);
            }
        }, 1500);
    };

    // 获取摘要结果
    const fetchSummary = async (taskIdToFetch) => {
        try {
            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';
            
            const response = await fetch(`${API_BASE}/api/summary/${taskIdToFetch}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 
                    'Authorization': `${tokenType} ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || '获取摘要失败');
            }

            const data = await response.json();
            
            // 提取摘要内容
            const chineseContent = data.chinese || data.summary_chinese || data.summary?.chinese || '';
            const englishContent = data.english || data.summary_english || data.summary?.english || '';
            
            setSummaryResult({
                chinese: chineseContent,
                english: englishContent,
                metadata: data.metadata || {}
            });
            
        } catch (error) {
            console.error('获取摘要错误:', error);
            toast?.error?.('获取摘要结果失败', { details: error.message });
        }
    };

    // ========== 粒度切换处理 ==========
    const handleGrainularityChange = (key) => {
        setSummaryLength(key);
        setHasUserSelected(true);
        
        // 如果已经有文件在处理，重新生成摘要
        if (localFileId && summaryResult) {
            processDocument(localFileId);
        }
    };

    // ========== 清理 ==========
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // ========== 渲染 ==========
    return (
        <div className="space-y-8">
            {/* 标题区 - 蓝色字体 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    多格式文档解析
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">支持 PDF、Word、TXT、MD、代码等 20+ 格式自动解析</p>
            </div>

            {/* 主内容卡片 */}
            <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-8 border-2 border-primary-500 shadow-sm">
                {/* 上传区域 */}
                <div 
                    className={`
                        flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 transition-all
                        ${isDragOver 
                            ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-500/10' 
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-transparent'
                        }
                        ${isUploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-12 h-12 text-cyan-500 mb-4 animate-spin" />
                            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">正在上传文件...</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{uploadedFile?.name}</p>
                            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-12 h-12 text-cyan-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">拖拽或点击上传文档</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">系统将自动识别格式并提取文本内容</p>
                            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:shadow-lg transition text-white font-medium">
                                选择文件
                            </button>
                            <p className="text-xs text-gray-400 mt-3">支持 PDF、DOCX、TXT、MD、代码等格式</p>
                        </>
                    )}
                </div>

                {/* 隐藏的文件输入 */}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.md,.py,.java,.js,.json,.yaml,.tex"
                />

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
                                onClick={() => handleGrainularityChange(level.key)}
                                disabled={!uploadedFile && !localFileId}
                                className={`
                                    flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-all min-w-[90px]
                                    ${summaryLength === level.key
                                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-400'
                                        : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
                                    }
                                    ${(!uploadedFile && !localFileId) ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <span className="text-xl mb-1">{level.icon}</span>
                                <span className="font-semibold text-sm">{level.label}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{level.desc}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        切换粒度后将自动重新生成摘要
                    </p>
                </div>

                {/* 已上传文件列表 */}
                <div className="mt-8 space-y-4">
                    {uploadedFile || localFileId ? (
                        <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <FileText className="w-5 h-5 text-cyan-500" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {uploadedFile?.name || '已上传文件'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {uploadedFile?.size ? `${(uploadedFile.size / 1024).toFixed(1)} KB · ` : ''}
                                    {isProcessing ? (
                                        <span className="text-cyan-500">处理中... {Math.round(processingProgress)}%</span>
                                    ) : taskStatus === 'completed' ? (
                                        <span className="text-green-500">已解析完成</span>
                                    ) : taskStatus === 'failed' ? (
                                        <span className="text-red-500">处理失败</span>
                                    ) : (
                                        '等待处理'
                                    )}
                                </div>
                                {isProcessing && (
                                    <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                                            style={{ width: `${processingProgress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            {taskStatus === 'completed' && (
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            )}
                            {taskStatus === 'failed' && (
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                            {isRegenerating && (
                                <button
                                    onClick={() => processDocument(localFileId)}
                                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    title="重新生成"
                                >
                                    <RefreshCw className="w-4 h-4 text-gray-500" />
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setUploadedFile(null);
                                    setLocalFileId(null);
                                    setSummaryResult(null);
                                    setTaskStatus(null);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="清除"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                暂无上传文件
                            </div>
                        </div>
                    )}
                </div>

                {/* 摘要结果预览 */}
                <div className="mt-8 p-6 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {isRegenerating ? '正在重新生成摘要...' : '摘要结果'}
                        </h3>
                        {summaryResult && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                （约 {summaryResult.chinese?.replace(/\s/g, '').length || 0} 字符）
                            </span>
                        )}
                    </div>
                    
                    {isProcessing || isRegenerating ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mr-3" />
                            <span className="text-gray-500">正在生成摘要，请稍候...</span>
                        </div>
                    ) : summaryResult?.chinese ? (
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {summaryResult.chinese}
                        </div>
                    ) : taskStatus === 'failed' ? (
                        <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                            <span>处理失败，请重试或上传其他文件</span>
                        </div>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                            上传文件后，系统将自动生成摘要结果
                        </div>
                    )}
                </div>

                {/* 操作按钮 */}
                {uploadedFile || localFileId ? (
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={() => processDocument(localFileId)}
                            disabled={isProcessing || isRegenerating}
                            className={`
                                px-6 py-3 rounded-xl font-medium transition-all
                                flex items-center gap-2
                                ${isProcessing || isRegenerating
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg'
                                }
                            `}
                        >
                            {isProcessing || isRegenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    处理中...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    重新生成摘要
                                </>
                            )}
                        </button>
                    </div>
                ) : null}
            </div>

            {/* 功能说明卡片 */}
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
