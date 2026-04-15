// 智能文档理解模块 - 包含14种图表生成和导出功能
import React, { useState, useEffect, useRef } from 'react';
import {
    Cpu, BookOpen, ListTodo, Upload, FileText, CheckCircle, X,
    Download, Eye, BarChart3, GitBranch, Clock, Network,
    Database, PieChart, LineChart, Activity, GitMerge, TreePine, Share2
} from 'lucide-react';
import { useToast } from '../components/Toast';
import {
    generateCharts,
    exportChart,
    uploadFile,
    getDocument
} from '../utils/api';
import { useTheme } from '../context/ThemeContext';

// 14种图表类型配置
const CHART_TYPES_CONFIG = [
    { id: 'flowchart', name: '流程图', icon: GitBranch, color: 'blue' },
    { id: 'sequence', name: '时序图', icon: Clock, color: 'purple' },
    { id: 'class-diagram', name: '类图', icon: Database, color: 'green' },
    { id: 'state-machine', name: '状态机', icon: Activity, color: 'red' },
    { id: 'entity-relation', name: 'ER图', icon: GitMerge, color: 'yellow' },
    { id: 'gantt', name: '甘特图', icon: BarChart3, color: 'cyan' },
    { id: 'pie', name: '饼图', icon: PieChart, color: 'pink' },
    { id: 'bar', name: '柱状图', icon: BarChart3, color: 'orange' },
    { id: 'line', name: '折线图', icon: LineChart, color: 'indigo' },
    { id: 'scatter', name: '散点图', icon: Activity, color: 'teal' },
    { id: 'radar', name: '雷达图', icon: Network, color: 'violet' },
    { id: 'heatmap', name: '热力图', icon: BarChart3, color: 'rose' },
    { id: 'tree', name: '树状图', icon: TreePine, color: 'emerald' },
    { id: 'network', name: '网络图', icon: Network, color: 'sky' }
];

// 颜色映射
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

const Understand = ({
    uploadedFile, setUploadedFile, fileId, setFileId,
    onShowToast
}) => {
    const { isDarkMode } = useTheme();
    const { toast } = useToast();
    const [documentContent, setDocumentContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCharts, setSelectedCharts] = useState(['flowchart', 'sequence']);
    const [generatedCharts, setGeneratedCharts] = useState([]);
    const [previewChart, setPreviewChart] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef(null);

    // 处理文件上传
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setUploadProgress(0);
        setIsProcessing(true);

        try {
            const result = await uploadFile(file, (progress) => {
                setUploadProgress(progress);
            });

            setFileId(result.file_id);

            // 获取文档内容
            const docData = await getDocument(result.file_id);
            setDocumentContent(docData.content || '');

            toast.success(`文件 ${file.name} 上传成功！`);
        } catch (error) {
            console.error('上传错误:', error);
            toast.error('文件上传失败', {
                details: error.message || '请检查网络连接和登录状态'
            });
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

    // 生成图表
    const handleGenerateCharts = async () => {
        if (!fileId) {
            toast.error('请先上传文档', {
                details: '需要上传文档后才能生成图表'
            });
            return;
        }

        if (selectedCharts.length === 0) {
            toast.warning('请选择至少一种图表类型');
            return;
        }

        setIsProcessing(true);

        try {
            const result = await generateCharts({
                fileId,
                chartTypes: selectedCharts
            });

            if (result.success) {
                setGeneratedCharts(result.charts || []);
                toast.success(`成功生成 ${result.charts?.length || 0} 个图表！`);
            } else {
                throw new Error(result.detail || '图表生成失败');
            }
        } catch (error) {
            console.error('生成图表错误:', error);
            toast.error('图表生成失败', {
                details: error.message || '请检查后端服务是否运行'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // 预览图表
    const handlePreviewChart = (chart) => {
        setPreviewChart(chart);
        setShowPreview(true);
    };

    // 导出图表
    const handleExportChart = async (chart) => {
        try {
            // 生成 XML 内容
            const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<chart type="mermaid" format="xml">
    <title>${chart.name}</title>
    <mermaid><![CDATA[
${chart.code}
    ]]></mermaid>
    <metadata>
        <generated_at>${new Date().toISOString()}</generated_at>
        <generator>DocSummAI Chart Generator</generator>
    </metadata>
</chart>`;

            // 创建下载
            const blob = new Blob([xmlContent], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${chart.type}_${Date.now()}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`图表 ${chart.name} 导出成功！`);
        } catch (error) {
            console.error('导出错误:', error);
            toast.error('导出失败', {
                details: error.message
            });
        }
    };

    // 导出所有图表
    const handleExportAll = () => {
        if (generatedCharts.length === 0) {
            toast.warning('没有可导出的图表');
            return;
        }

        // 导出第一个图表作为示例
        handleExportChart(generatedCharts[0]);
    };

    // 复制图表代码
    const handleCopyCode = (chart) => {
        navigator.clipboard.writeText(chart.code)
            .then(() => toast.success('图表代码已复制到剪贴板'))
            .catch(() => toast.error('复制失败'));
    };

    // 一键全选/取消
    const toggleSelectAll = () => {
        if (selectedCharts.length === CHART_TYPES_CONFIG.length) {
            setSelectedCharts([]);
        } else {
            setSelectedCharts(CHART_TYPES_CONFIG.map(c => c.id));
        }
    };

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    智能文档理解
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>AI 自动分析结构、章节、重点与逻辑关系，生成14种可视化图表</p>
            </div>

            {/* 功能介绍卡片 */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white border border-orange-200'} p-6 rounded-xl border border-gray-700/50`}>
                    <Cpu className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold">结构识别</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>自动拆分标题、段落、列表、代码块</p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white border border-orange-200'} p-6 rounded-xl border border-gray-700/50`}>
                    <BookOpen className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold">章节理解</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>理解上下文关系，生成章节大纲</p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white border border-orange-200'} p-6 rounded-xl border border-gray-700/50`}>
                    <ListTodo className="w-8 h-8 text-pink-400 mb-4" />
                    <h3 className="text-lg font-semibold">重点提取</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>自动标记关键句、结论、数据与观点</p>
                </div>
            </div>

            {/* 文件上传区域 */}
            <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white border border-orange-200'} rounded-2xl p-6 border border-gray-700/50`}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-400" />
                    上传文档
                </h2>

                <div
                    className={`
                        flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer
                        transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/5
                        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            fileInputRef.current.files = dt.files;
                            handleFileUpload({ target: fileInputRef.current });
                        }
                    }}
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
                                    {uploadProgress < 100 ? `上传中 ${uploadProgress}%` : '上传完成'}
                                </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                    ) : (
                        <>
                            <Upload className="w-12 h-12 text-gray-500 mb-4" />
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>点击或拖拽上传文档</p>
                            <p className="text-xs text-gray-500 mt-2">支持 PDF, Word, TXT, Markdown, HTML</p>
                        </>
                    )}
                </div>
            </div>

            {/* 图表类型选择 */}
            <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white border border-orange-200'} rounded-2xl p-6 border border-gray-700/50`}>
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
                        const Icon = chart.icon;
                        const isSelected = selectedCharts.includes(chart.id);

                        return (
                            <button
                                key={chart.id}
                                onClick={() => toggleChartType(chart.id)}
                                className={`
                                    flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200
                                    ${isSelected
                                        ? `${colorMap[chart.color]} border-current`
                                        : 'border-gray-700/50 hover:border-gray-600 text-gray-400'
                                    }
                                `}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{chart.name}</span>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleGenerateCharts}
                    disabled={isProcessing || !fileId || selectedCharts.length === 0}
                    className={`
                        mt-6 w-full py-3 rounded-xl font-semibold transition-all duration-300
                        flex items-center justify-center gap-2
                        ${isProcessing || !fileId || selectedCharts.length === 0
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/25'
                        }
                    `}
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Cpu className="w-5 h-5" />
                            生成 {selectedCharts.length} 个图表
                        </>
                    )}
                </button>
            </div>

            {/* 生成的图表列表 */}
            {generatedCharts.length > 0 && (
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white border border-orange-200'} rounded-2xl p-6 border border-gray-700/50`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            已生成图表 ({generatedCharts.length})
                        </h2>
                        <button
                            onClick={handleExportAll}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
                        >
                            <Download className="w-4 h-4" />
                            导出全部
                        </button>
                    </div>

                    <div className="space-y-4">
                        {generatedCharts.map((chart, index) => {
                            const chartConfig = CHART_TYPES_CONFIG.find(c => c.id === chart.type);
                            const Icon = chartConfig?.icon || BarChart3;

                            return (
                                <div
                                    key={index}
                                    className={`${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}/50 rounded-xl p-4 border border-gray-700/30`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${colorMap[chartConfig?.color || 'blue']}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{chart.name || chart.type}</div>
                                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {chart.format?.toUpperCase()} 格式
                                                    {chart.is_sample && <span className="ml-2 text-yellow-400">(示例)</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePreviewChart(chart)}
                                                className="p-2 hover:bg-gray-700 rounded-lg transition"
                                                title="预览"
                                            >
                                                <Eye className="w-4 h-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => handleCopyCode(chart)}
                                                className="p-2 hover:bg-gray-700 rounded-lg transition"
                                                title="复制代码"
                                            >
                                                <Share2 className="w-4 h-4 text-purple-400" />
                                            </button>
                                            <button
                                                onClick={() => handleExportChart(chart)}
                                                className="p-2 hover:bg-gray-700 rounded-lg transition"
                                                title="导出"
                                            >
                                                <Download className="w-4 h-4 text-green-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 图表代码预览 */}
                                    <pre className="bg-gray-900/50 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto max-h-40 font-mono">
                                        {chart.code}
                                    </pre>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 图表预览模态框 */}
            {showPreview && previewChart && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}`}>
                        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-orange-200'}`}>
                            <h3 className="text-lg font-semibold">{previewChart.name}</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleExportChart(previewChart)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
                                >
                                    <Download className="w-4 h-4" />
                                    导出 XML
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
                            <pre className={`${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} rounded-xl p-6 text-sm text-gray-100 overflow-x-auto font-mono leading-relaxed`}>
                                {previewChart.code}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Understand;
