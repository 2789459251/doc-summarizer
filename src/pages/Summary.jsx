import React, { useMemo, useState } from 'react';
import { ArrowRight, Upload, FileText, Loader2, CheckCircle, Download, XCircle } from 'lucide-react';
import { API_BASE } from '../utils/api';

const Summary = () => {
    const [conversionFormat, setConversionFormat] = useState('pdf');
    const [conversionFile, setConversionFile] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [conversionMessage, setConversionMessage] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');

    const conversionOptions = [
        { key: 'pdf', from: 'Word', to: 'PDF', icon: FileText, accept: '.doc,.docx' },
        { key: 'docx', from: 'PDF', to: 'Word', icon: FileText, accept: '.pdf', disabled: true, reason: '当前环境下 PDF 转 Word 暂不稳定支持' },
        { key: 'md', from: 'Word', to: 'MD', icon: FileText, accept: '.doc,.docx' },
        { key: 'html', from: 'MD', to: 'HTML', icon: FileText, accept: '.md' },
        { key: 'txt', from: 'PDF', to: 'TXT', icon: FileText, accept: '.pdf' },
    ];

    const currentOption = useMemo(
        () => conversionOptions.find((option) => option.key === conversionFormat) || conversionOptions[0],
        [conversionFormat]
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setConversionFile(file);
            setConversionMessage('');
            setDownloadUrl('');
        }
    };

    const handleConversion = async () => {
        if (!conversionFile) {
            setConversionMessage('请先上传文件');
            return;
        }

        if (currentOption.disabled) {
            setConversionMessage(currentOption.reason || '当前转换暂不支持');
            return;
        }

        setIsConverting(true);
        setConversionMessage('正在转换...');
        setDownloadUrl('');

        try {
            const formData = new FormData();
            formData.append('file', conversionFile);
            formData.append('target_format', conversionFormat);

            const token = localStorage.getItem('token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';

            const res = await fetch(`${API_BASE}/api/convert/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: token ? { Authorization: `${tokenType} ${token}` } : {},
            });

            const responseText = await res.text();
            if (!responseText) {
                setConversionMessage(`转换失败：服务器无响应 (${res.status})`);
                return;
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                setConversionMessage(`转换失败：响应格式错误 (${res.status})`);
                return;
            }

            if (res.status === 401) {
                const toastEvent = new CustomEvent('showToast', {
                    detail: {
                        type: 'error',
                        title: '登录已过期',
                        message: '您的登录已过期，请重新登录以继续使用',
                        duration: 0,
                        action: {
                            label: '立即登录',
                            onClick: () => {
                                window.location.hash = '#/login';
                                window.location.reload();
                            },
                        },
                    },
                });
                window.dispatchEvent(toastEvent);
                setConversionMessage('转换失败：未登录，请先登录');
                return;
            }

            if (res.ok && data.success) {
                setConversionMessage('转换成功！');
                const resolvedUrl = data.download_url?.startsWith('http')
                    ? data.download_url
                    : `${API_BASE}${data.download_url}`;
                setDownloadUrl(resolvedUrl);
            } else {
                setConversionMessage(data.detail || data.error || '转换失败，请检查文件格式或服务器状态');
            }
        } catch (err) {
            setConversionMessage(`转换失败: ${err.message}`);
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    格式转换工具
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">支持 Word、PDF、Markdown 等常用文档格式互相转换</p>
            </div>

            <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-8 border-2 border-primary-500 shadow-sm">
                <div className="mb-8">
                    <label className="block text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium">选择转换格式</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {conversionOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => !option.disabled && setConversionFormat(option.key)}
                                title={option.reason || ''}
                                className={`
                                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                                    ${conversionFormat === option.key
                                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500 text-purple-700 dark:text-purple-400'
                                        : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
                                    }
                                    ${option.disabled ? 'opacity-50 cursor-not-allowed hover:border-gray-300 dark:hover:border-gray-700' : ''}
                                `}
                            >
                                <span className="font-medium text-sm">{option.from}</span>
                                <ArrowRight className="w-4 h-4" />
                                <span className="font-medium text-sm">{option.to}</span>
                            </button>
                        ))}
                    </div>
                    {currentOption.disabled && (
                        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{currentOption.reason}</p>
                    )}
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 bg-gray-50/50 dark:bg-transparent">
                    <Upload className="w-12 h-12 text-purple-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">上传要转换的文件</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        当前转换：{currentOption.from} → {currentOption.to}
                    </p>
                    <input
                        id="conversionFile"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept={currentOption.accept}
                    />
                    <button
                        onClick={() => document.getElementById('conversionFile')?.click()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition text-white font-medium"
                    >
                        选择文件
                    </button>
                </div>

                {conversionFile && (
                    <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-500" />
                            <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{conversionFile.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {(conversionFile.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleConversion}
                            disabled={isConverting || currentOption.disabled}
                            className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition text-white text-sm font-medium disabled:opacity-50"
                        >
                            {isConverting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    转换中...
                                </span>
                            ) : (
                                '开始转换'
                            )}
                        </button>
                    </div>
                )}

                {conversionMessage && (
                    <div className={`mt-6 p-4 rounded-lg text-center ${
                        conversionMessage.includes('成功')
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                        {conversionMessage.includes('成功')
                            ? <CheckCircle className="w-5 h-5 inline mr-2" />
                            : <XCircle className="w-5 h-5 inline mr-2" />
                        }
                        {conversionMessage}
                    </div>
                )}

                {downloadUrl && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-white font-medium transition"
                        >
                            <Download className="w-5 h-5" />
                            下载转换文件
                        </button>
                    </div>
                )}

                <div className="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">转换说明：</p>
                    <ul className="space-y-1">
                        <li>• Word → PDF：当前最稳定，适合正式导出</li>
                        <li>• Word → Markdown：适合提取正文内容做二次编辑</li>
                        <li>• PDF → TXT：适合提取纯文本内容</li>
                        <li>• PDF → Word：当前环境下暂不稳定支持，已临时禁用</li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">快速转换</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">支持常见办公文档格式转换</p>
                </div>
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">🔒</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">安全可靠</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">本地服务处理，保护您的隐私</p>
                </div>
                <div className="bg-white dark:bg-gray-900/40 rounded-xl p-6 border-2 border-primary-500 shadow-sm">
                    <div className="text-2xl mb-2">📱</div>
                    <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">能力清晰</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">仅展示当前环境下稳定可用的转换能力</p>
                </div>
            </div>
        </div>
    );
};

export default Summary;
