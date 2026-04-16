// 文档图表生成模块 - 根据文档内容或描述生成可视化图表
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Upload, FileText, CheckCircle, X, Eye, BarChart3,
    Image, FileEdit, Play, Loader2, AlertCircle
} from 'lucide-react';
import { useToast } from '../components/Toast';
import {
    generateCharts,
    uploadFile,
    getDocument
} from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import mermaid from 'mermaid';

// 初始化 Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Microsoft YaHei, sans-serif',
    flowchart: { fit: true, htmlLabels: true, curve: 'linear' },
    sequence: { diagramMarginX: 20, diagramMarginY: 20 },
    er: { fit: true, padding: 20 },
    gantt: { fit: true, padding: 20 },
    pie: { textPosition: 0.75 },
    xyChart: { fit: true, padding: 20 }
});

// 图表类型配置
const CHART_TYPES_CONFIG = [
    { id: 'flowchart', name: '流程图', color: 'blue' },
    { id: 'sequence', name: '时序图', color: 'purple' },
    { id: 'class-diagram', name: '类图', color: 'green' },
    { id: 'state-machine', name: '状态机', color: 'red' },
    { id: 'entity-relation', name: 'ER图', color: 'yellow' },
    { id: 'gantt', name: '甘特图', color: 'cyan' },
    { id: 'pie', name: '饼图', color: 'pink' },
    { id: 'bar', name: '柱状图', color: 'orange' },
    { id: 'line', name: '折线图', color: 'indigo' },
    { id: 'scatter', name: '散点图', color: 'teal' },
    { id: 'radar', name: '雷达图', color: 'violet' },
    { id: 'heatmap', name: '热力图', color: 'rose' },
    { id: 'tree', name: '树状图', color: 'emerald' },
    { id: 'network', name: '网络图', color: 'sky' }
];

const colorMap = {
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
    purple: 'text-purple-400 bg-purple-500/20 border-purple-500/50',
    green: 'text-green-400 bg-green-500/20 border-green-500/50',
    red: 'text-red-400 bg-red-500/20 border-red-500/50',
    yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
    cyan: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50',
    pink: 'text-pink-400 bg-pink-500/20 border-pink-500/50',
    orange: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
    indigo: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/50',
    teal: 'text-teal-400 bg-teal-500/20 border-teal-500/50',
    violet: 'text-violet-400 bg-violet-500/20 border-violet-500/50',
    rose: 'text-rose-400 bg-rose-500/20 border-rose-500/50',
    emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50',
    sky: 'text-sky-400 bg-sky-500/20 border-sky-500/50'
};

const bgColorMap = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50',
    green: 'from-green-500/20 to-green-600/20 border-green-500/50',
    red: 'from-red-500/20 to-red-600/20 border-red-500/50',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/50',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/50',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/50',
    indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/50',
    teal: 'from-teal-500/20 to-teal-600/20 border-teal-500/50',
    violet: 'from-violet-500/20 to-violet-600/20 border-violet-500/50',
    rose: 'from-rose-500/20 to-rose-600/20 border-rose-500/50',
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/50',
    sky: 'from-sky-500/20 to-sky-600/20 border-sky-500/50'
};

const ChartGenerator = ({ uploadedFile, setUploadedFile, fileId, setFileId }) => {
    const { isDarkMode } = useTheme();
    const { toast } = useToast();
    const [documentContent, setDocumentContent] = useState('');
    const [textDescription, setTextDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCharts, setSelectedCharts] = useState(['flowchart']);
    const [generatedCharts, setGeneratedCharts] = useState([]);
    const [renderedSvgs, setRenderedSvgs] = useState({});
    const [renderingStates, setRenderingStates] = useState({});
    const [previewChart, setPreviewChart] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState(0);
    const fileInputRef = useRef(null);
    const mermaidIdCounter = useRef(0);

    // 使用 mermaid 渲染图表
    const renderChart = useCallback(async (chart) => {
        const chartId = `mermaid-${Date.now()}-${mermaidIdCounter.current++}`;

        setRenderingStates(prev => ({ ...prev, [chart.type]: 'rendering' }));

        try {
            const { svg } = await mermaid.render(chartId, chart.code);
            setRenderedSvgs(prev => ({ ...prev, [chart.type]: svg }));
            setRenderingStates(prev => ({ ...prev, [chart.type]: 'done' }));
            return svg;
        } catch (error) {
            console.error(`渲染 ${chart.type} 失败:`, error);
            setRenderingStates(prev => ({ ...prev, [chart.type]: 'error' }));
            return null;
        }
    }, []);

    // 渲染所有图表
    useEffect(() => {
        if (generatedCharts.length > 0) {
            generatedCharts.forEach(chart => {
                if (!renderedSvgs[chart.type]) {
                    renderChart(chart);
                }
            });
        }
    }, [generatedCharts, renderChart, renderedSvgs]);

    // 处理文件上传
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setUploadProgress(0);
        setIsProcessing(true);
        setTextDescription('');
        setGeneratedCharts([]);
        setRenderedSvgs({});

        try {
            const result = await uploadFile(file, (progress) => {
                setUploadProgress(progress);
            });

            setFileId(result.file_id);

            const docData = await getDocument(result.file_id);
            setDocumentContent(docData.content || '');

            toast.success(`文件 ${file.name} 上传成功！`);
        } catch (error) {
            console.error('上传错误:', error);
            
            // 特殊处理401未授权错误，显示登录提示
            if (error.message && error.message.startsWith('UNAUTHORIZED:')) {
                const errorDetails = error.message.replace('UNAUTHORIZED:', '').trim();
                toast.error('登录要求', { 
                    details: errorDetails,
                    duration: 8000, // 延长显示时间
                    action: {
                        label: '立即登录',
                        onClick: () => {
                            window.location.href = '#/login';
                        }
                    }
                });
            } else {
                toast.error('文件上传失败', { details: error.message || '请检查网络连接和登录状态' });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // 切换图表选择
    const toggleChartType = (chartId) => {
        setSelectedCharts(prev =>
            prev.includes(chartId)
                ? prev.filter(id => id !== chartId)
                : [...prev, chartId]
        );
    };

    // 全选/取消全选
    const toggleSelectAll = () => {
        if (selectedCharts.length === CHART_TYPES_CONFIG.length) {
            setSelectedCharts([]);
        } else {
            setSelectedCharts(CHART_TYPES_CONFIG.map(c => c.id));
        }
    };

    // 生成图表
    const handleGenerateCharts = async () => {
        const hasFile = !!fileId && !!documentContent;
        const hasText = !!textDescription && textDescription.trim().length > 0;

        if (!hasFile && !hasText) {
            toast.error('请上传文档或输入描述文字');
            return;
        }

        if (selectedCharts.length === 0) {
            toast.warning('请选择至少一种图表类型');
            return;
        }

        setIsProcessing(true);
        setGeneratingProgress(0);
        setGeneratedCharts([]);
        setRenderedSvgs({});

        try {
            // 模拟进度
            const progressInterval = setInterval(() => {
                setGeneratingProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const chartsResult = await generateCharts({
                file_id: fileId || 'text-source',
                chart_types: selectedCharts,
                user_description: textDescription  // 传递用户描述给AI生成
            });

            clearInterval(progressInterval);
            setGeneratingProgress(100);

            if (chartsResult.success) {
                const charts = chartsResult.charts || [];
                // 只保留用户选择的图表
                const filteredCharts = charts.filter(chart =>
                    selectedCharts.includes(chart.type)
                );

                setGeneratedCharts(filteredCharts);
                toast.success(`成功生成 ${filteredCharts.length} 个图表！`);

                // 延迟打开全屏预览，等待SVG渲染完成
                if (filteredCharts.length > 0) {
                    const firstChart = filteredCharts[0];
                    setPreviewChart(firstChart);
                    
                    // 检查SVG是否已经渲染
                    if (renderedSvgs[firstChart.type]) {
                        setShowPreview(true);
                    } else {
                        // 等待SVG渲染完成后再打开预览
                        const checkRender = () => {
                            if (renderedSvgs[firstChart.type]) {
                                setShowPreview(true);
                            } else {
                                setTimeout(checkRender, 100);
                            }
                        };
                        checkRender();
                    }
                }
            } else {
                throw new Error(chartsResult.detail || '图表生成失败');
            }
        } catch (error) {
            console.error('生成图表错误:', error);
            toast.error('图表生成失败', { details: error.message || '请检查后端服务是否运行' });
        } finally {
            setIsProcessing(false);
            setGeneratingProgress(0);
        }
    };

    // 复制图表为PNG图片（支持Clipboard API + Blob）
    const handleCopyAsImage = async (chart) => {
        const svgCode = renderedSvgs[chart.type];
        if (!svgCode) {
            toast.error('图表尚未渲染完成');
            return;
        }

        const copyAsPng = async () => {
            try {
                // 创建临时容器来获取SVG元素
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svgCode;
                const svgElement = tempDiv.querySelector('svg');
                if (!svgElement) {
                    throw new Error('SVG 元素不存在');
                }

                // 获取SVG尺寸
                let width, height;
                const viewBox = svgElement.getAttribute('viewBox');
                if (viewBox) {
                    const [, , vw, vh] = viewBox.split(' ').map(Number);
                    if (vw > 0 && vh > 0) {
                        width = vw;
                        height = vh;
                    }
                }
                if (!width || !height) {
                    width = svgElement.getAttribute('width') || 800;
                    height = svgElement.getAttribute('height') || 600;
                }

                // 增加边距
                const padding = Math.max(20, Math.min(width, height) * 0.05);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = width + padding * 2;
                canvas.height = height + padding * 2;

                // 设置背景色
                ctx.fillStyle = isDarkMode ? '#1a1a2e' : '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 将SVG转换为数据URL并绘制到Canvas
                const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const img = new Image();

                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        ctx.drawImage(img, padding, padding, width, height);
                        URL.revokeObjectURL(url);
                        resolve();
                    };
                    img.onerror = (err) => {
                        URL.revokeObjectURL(url);
                        reject(new Error('图片加载失败'));
                    };
                    img.src = url;
                });

                // 转换为PNG Blob
                const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

                // 方法1：使用Clipboard API复制到剪贴板
                if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                    try {
                        const clipboardItem = new ClipboardItem({ 'image/png': pngBlob });
                        await navigator.clipboard.write([clipboardItem]);
                        toast.success('PNG 图片已复制到剪贴板！可直接粘贴到聊天或文档中');
                        return true;
                    } catch (e) {
                        console.warn('Clipboard API失败:', e);
                    }
                }

                // 方法2：降级为下载PNG
                downloadBlob(pngBlob, `${chart.type}_${Date.now()}.png`);
                toast.success('浏览器不支持直接复制图片，已下载PNG');
                return true;

            } catch (error) {
                console.error('复制图片失败:', error);
                return false;
            }
        };

        const downloadBlob = (blob, filename) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        };

        // 尝试复制PNG，如果失败则复制SVG代码
        const success = await copyAsPng();
        if (!success) {
            try {
                await navigator.clipboard.writeText(svgCode);
                toast.success('无法复制图片，已复制SVG代码到剪贴板');
            } catch (err) {
                toast.error('复制失败，请尝试右键保存图片');
            }
        }
    };



    // 重新渲染单个图表
    const handleReRender = (chart) => {
        setRenderedSvgs(prev => {
            const newState = { ...prev };
            delete newState[chart.type];
            return newState;
        });
        renderChart(chart);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    文档图表生成
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    上传文档或输入描述文字，AI 自动生成可视化图表
                </p>
            </div>

            {/* 文件上传 + 文本描述 */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* 文件上传卡片 */}
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-orange-200'}`}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-400" />
                        上传文档
                    </h2>

                    <div
                        className={`
                            flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer
                            transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/5
                            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                            ${uploadedFile ? 'border-green-500/50 bg-green-500/5' : ''}
                        `}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt,.md,.html"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {uploadedFile ? (
                            <div className="flex items-center gap-3">
                                <FileText className="w-10 h-10 text-green-400" />
                                <div>
                                    <div className="font-medium">{uploadedFile.name}</div>
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {uploadProgress < 100 ? `上传中 ${uploadProgress}%` : '上传完成 ✓'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>点击或拖拽上传文档</p>
                                <p className="text-xs text-gray-500 mt-2">支持 PDF, Word, TXT, Markdown</p>
                            </>
                        )}
                    </div>

                    {documentContent && (
                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                            <p className="text-sm text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                文档已加载 ({documentContent.length} 字符)
                            </p>
                        </div>
                    )}
                </div>

                {/* 文本描述卡片 */}
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-purple-200'}`}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileEdit className="w-5 h-5 text-purple-400" />
                        输入描述文字
                    </h2>

                    <textarea
                        value={textDescription}
                        onChange={(e) => {
                            setTextDescription(e.target.value);
                            setUploadedFile(null);
                            setFileId(null);
                            setDocumentContent('');
                        }}
                        placeholder="输入描述文字，系统将根据内容生成图表..."
                        className={`
                            w-full h-40 p-4 rounded-xl border resize-none
                            ${isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500'
                                : 'bg-purple-50 border-purple-200 text-gray-800 placeholder-gray-400'
                            }
                            focus:outline-none focus:ring-2 focus:ring-purple-500/50
                        `}
                    />

                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {textDescription.length} / 5000 字符
                    </p>

                    {textDescription && (
                        <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <p className="text-sm text-purple-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                描述已输入 ({textDescription.length} 字符)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 图表类型选择 */}
            <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        选择图表类型
                        <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            (已选 {selectedCharts.length}/14)
                        </span>
                    </h2>
                    <button
                        onClick={toggleSelectAll}
                        className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                        {selectedCharts.length === CHART_TYPES_CONFIG.length ? '取消全选' : '全选'}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {CHART_TYPES_CONFIG.map((chart) => {
                        const isSelected = selectedCharts.includes(chart.id);

                        return (
                            <button
                                key={chart.id}
                                onClick={() => toggleChartType(chart.id)}
                                className={`
                                    flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                                    ${isSelected
                                        ? `${colorMap[chart.color]} border-current bg-gradient-to-br ${bgColorMap[chart.color]}`
                                        : `${isDarkMode ? 'border-gray-700/50 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                                    }
                                `}
                            >
                                <BarChart3 className="w-6 h-6" />
                                <span className="text-xs font-medium">{chart.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 生成按钮 */}
                <button
                    onClick={handleGenerateCharts}
                    disabled={isProcessing || (!fileId && !textDescription) || selectedCharts.length === 0}
                    className={`
                        mt-6 w-full py-4 rounded-xl font-semibold transition-all duration-300
                        flex items-center justify-center gap-3 text-lg
                        ${isProcessing || (!fileId && !textDescription) || selectedCharts.length === 0
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02]'
                        }
                    `}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            {generatingProgress > 0 ? `生成中... ${generatingProgress}%` : '生成中...'}
                        </>
                    ) : (
                        <>
                            <Play className="w-6 h-6" />
                            生成 {selectedCharts.length} 个图表
                        </>
                    )}
                </button>

                {/* 进度条 */}
                {isProcessing && generatingProgress > 0 && (
                    <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${generatingProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* 生成的图表列表 */}
            {generatedCharts.length > 0 && (
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            已生成图表 ({generatedCharts.length})
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {generatedCharts.map((chart, index) => {
                            const chartConfig = CHART_TYPES_CONFIG.find(c => c.id === chart.type);
                            const svg = renderedSvgs[chart.type];
                            const renderingState = renderingStates[chart.type];

                            return (
                                <div
                                    key={index}
                                    className={`
                                        rounded-2xl p-5 border-2 transition-all duration-300
                                        ${isDarkMode ? 'bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}
                                    `}
                                >
                                    {/* 图表头部 */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${colorMap[chartConfig?.color || 'blue']}`}>
                                                <BarChart3 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{chartConfig?.name || chart.type}</div>
                                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    Mermaid 图表
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => { setPreviewChart(chart); setShowPreview(true); }}
                                                className="p-2 rounded-lg hover:bg-gray-700 transition"
                                                title="全屏预览"
                                            >
                                                <Eye className="w-4 h-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => handleCopyAsImage(chart)}
                                                disabled={!svg}
                                                className="p-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                                                title="复制图片"
                                            >
                                                <Image className="w-4 h-4 text-purple-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 图表渲染区域 */}
                                    <div className={`
                                        rounded-xl min-h-[200px] flex items-center justify-center relative overflow-auto
                                        ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
                                    `}>
                                        <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                                            {renderingState === 'rendering' && (
                                                <div className="flex flex-col items-center gap-3 h-full justify-center">
                                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                    <span className="text-sm text-gray-500">渲染中...</span>
                                                </div>
                                            )}

                                            {renderingState === 'error' && (
                                                <div className="flex flex-col items-center gap-3 text-red-400 p-4 h-full justify-center">
                                                    <AlertCircle className="w-8 h-8" />
                                                    <span className="text-sm">渲染失败</span>
                                                </div>
                                            )}

{svg && (
                                                <div
                                                    className="w-full overflow-auto"
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        minHeight: '200px'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: svg }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 全屏预览 - 美化版 */}
            {showPreview && previewChart && (
                <div 
                    className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 cursor-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowPreview(false);
                    }}
                >
                    {/* 顶部渐变标题栏 */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-purple-900/80 backdrop-blur-md border-b border-white/10 z-20 flex items-center justify-between px-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[CHART_TYPES_CONFIG.find(c => c.id === previewChart.type)?.color || 'blue']} shadow-lg`}>
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {CHART_TYPES_CONFIG.find(c => c.id === previewChart.type)?.name || previewChart.type}
                                </h3>
                                <p className="text-xs text-white/60">全屏预览模式</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* 复制图片按钮 */}
                            <button
                                onClick={() => handleCopyAsImage(previewChart)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition text-white border border-white/20 hover:border-white/30"
                            >
                                <Image className="w-4 h-4" />
                                <span className="text-sm font-medium">复制图片</span>
                            </button>

                            {/* 关闭按钮 */}
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2.5 bg-white/10 hover:bg-red-500/80 text-white rounded-xl transition backdrop-blur-sm border border-white/20"
                                title="退出全屏预览"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* 图表容器 - 带玻璃态效果 */}
                    <div className="w-full h-full pt-16 overflow-auto flex items-start justify-center">
                        {renderedSvgs[previewChart.type] ? (
                            <div 
                                className="mermaid-fullscreen-container bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/10"
                                dangerouslySetInnerHTML={{ __html: renderedSvgs[previewChart.type] }}
                                style={{
                                    display: 'block',
                                    width: 'fit-content',
                                    height: 'auto',
                                    maxWidth: 'none',
                                    minWidth: 'unset',
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8">
                                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-white/60">图表渲染中...</p>
                            </div>
                        )}
                    </div>

                    {/* 底部代码查看器 */}
                    <div className="absolute bottom-0 right-0 p-4 z-20">
                        <details className="cursor-pointer">
                            <summary className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center gap-2 px-4 py-2.5 rounded-xl transition border border-white/20 hover:border-white/30">
                                <Code className="w-4 h-4" />
                                <span className="text-sm font-medium">查看代码</span>
                                <ChevronDown className="w-4 h-4" />
                            </summary>
                            <div className="absolute bottom-full right-0 mb-2 w-[32rem] max-h-80 overflow-auto rounded-xl shadow-2xl">
                                <pre className="rounded-xl p-5 text-sm font-mono leading-relaxed overflow-x-auto bg-slate-900/95 backdrop-blur-sm text-emerald-400 border border-white/10">
                                    {previewChart.code}
                                </pre>
                            </div>
                        </details>
                    </div>

                    {/* 装饰性背景元素 */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
            )}
        </div>
    );
};

export default ChartGenerator;