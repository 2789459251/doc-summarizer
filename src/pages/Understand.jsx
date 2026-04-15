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
            toast.error('文件上传失败', { details: error.message || '请检查网络连接和登录状态' });
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
                fileId: fileId || 'text-source',
                chartTypes: selectedCharts
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

                if (filteredCharts.length > 0) {
                    setPreviewChart(filteredCharts[0]);
                    setShowPreview(true);
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

    // 复制图表为JPG/PNG图片
    const handleCopyAsImage = async (chart) => {
        const svgCode = renderedSvgs[chart.type];
        if (!svgCode) {
            toast.error('图表尚未渲染完成');
            return;
        }

        try {
            // 创建临时容器来获取SVG元素
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgCode;
            const svgElement = tempDiv.querySelector('svg');
            if (!svgElement) {
                throw new Error('SVG 元素不存在');
            }

            // 方法1：优先使用viewBox（Mermaid生成的SVG都有viewBox）
            let width, height;
            const viewBox = svgElement.getAttribute('viewBox');
            if (viewBox) {
                const [, , vw, vh] = viewBox.split(' ').map(Number);
                if (vw > 0 && vh > 0) {
                    width = vw;
                    height = vh;
                }
            }

            // 方法2：如果viewBox无效，尝试获取实际渲染尺寸
            if (!width || !height) {
                // 将临时div添加到文档中以获取实际尺寸
                tempDiv.style.position = 'absolute';
                tempDiv.style.opacity = '0';
                tempDiv.style.pointerEvents = 'none';
                tempDiv.style.left = '-9999px';
                document.body.appendChild(tempDiv);
                try {
                    const rect = svgElement.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        width = rect.width;
                        height = rect.height;
                    }
                } catch (e) {
                    // 忽略错误
                } finally {
                    document.body.removeChild(tempDiv);
                }
            }

            // 方法3：如果仍然无效，使用默认尺寸
            width = width || 800;
            height = height || 600;

            // 增加边距确保完整显示（根据图表大小动态调整）
            const padding = Math.max(20, Math.min(width, height) * 0.05);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width + padding * 2;
            canvas.height = height + padding * 2;

            // 设置背景色（根据主题）
            const backgroundColor = isDarkMode ? '#1a1a2e' : '#ffffff';
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 将SVG转换为数据URL
            const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // 在Canvas中心绘制SVG
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

            // 将Canvas转换为PNG Blob
            const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

            // 复制PNG到剪贴板（支持现代浏览器）
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                    const clipboardItem = new ClipboardItem({ 'image/png': pngBlob });
                    await navigator.clipboard.write([clipboardItem]);
                    toast.success('JPG/PNG 图片已复制到剪贴板！可直接粘贴到聊天或文档中');
                    return;
                } catch (clipboardError) {
                    console.warn('直接复制失败，尝试下载:', clipboardError);
                }
            }

            // 降级：提供下载
            const downloadUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${chart.type}_${Date.now()}.png`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            toast.success('图片已下载（浏览器不支持直接复制图片）');

        } catch (error) {
            console.error('复制图片失败:', error);
            // 最终降级：复制SVG代码
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
                                                    className="w-full h-full flex items-center justify-center"
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

            {/* 预览模态框 */}
            {showPreview && previewChart && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className={`
                        rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden
                        border-2 shadow-2xl
                        ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-purple-200'}
                    `}>
                        {/* 标题栏 */}
                        <div className={`
                            flex items-center justify-between px-6 py-4
                            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-100'}
                            border-b
                        `}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${colorMap[CHART_TYPES_CONFIG.find(c => c.id === previewChart.type)?.color || 'blue']}`}>
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {CHART_TYPES_CONFIG.find(c => c.id === previewChart.type)?.name || previewChart.type}
                                    </h3>
                                    <p className="text-xs text-gray-500">Mermaid 图表</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleCopyAsImage(previewChart)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition shadow-lg"
                                >
                                    <Image className="w-5 h-5" />
                                    复制图片
                                </button>

                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2.5 hover:bg-gray-700 rounded-xl transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* 图表内容 */}
                        <div className="p-8 overflow-auto max-h-[calc(95vh-100px)]">
                            <div className={`
                                rounded-2xl p-4 shadow-xl overflow-auto min-h-[300px] flex items-center justify-center
                                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                            `}>
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    dangerouslySetInnerHTML={{ __html: renderedSvgs[previewChart.type] || '' }}
                                />
                            </div>

                            {/* Mermaid 代码 */}
                            <details className="mt-6">
                                <summary className="cursor-pointer text-gray-400 hover:text-gray-300 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-800 transition">
                                    <span className="text-sm font-medium">查看 Mermaid 代码</span>
                                </summary>
                                <pre className={`
                                    rounded-xl p-5 mt-2 text-sm font-mono leading-relaxed overflow-x-auto
                                    ${isDarkMode ? 'bg-gray-950 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-800 border border-gray-200'}
                                `}>
                                    {previewChart.code}
                                </pre>
                            </details>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartGenerator;