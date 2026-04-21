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

// 初始化 Mermaid（优化配置，兼容11.x版本）
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',  // 使用default主题避免兼容性问题
    securityLevel: 'loose',
    fontFamily: 'Microsoft YaHei, sans-serif',
    flowchart: { 
        fit: true, 
        htmlLabels: true, 
        curve: 'linear',
        nodeSpacing: 50,
        rankSpacing: 50
    },
    sequence: { 
        diagramMarginX: 20, 
        diagramMarginY: 20,
        actorMargin: 50
    },
    er: { 
        fit: true, 
        padding: 20,
        entityPadding: 15
    },
    gantt: { 
        fit: true, 
        padding: 20,
        titleTopMargin: 25,
        barHeight: 30
    },
    pie: { 
        textPosition: 0.75 
    },
    xyChart: { 
        fit: true, 
        padding: 20 
    },
    // 11.x新增配置
    logLevel: 0,  // 减少日志输出
    svgmaxLength: 10000  // 允许更大的SVG
});

// 清理Mermaid代码，修复常见兼容性问题
const sanitizeMermaidCode = (code) => {
    if (!code) return '';
    
    let cleaned = code;
    
    // 移除可能导致问题的不可见字符
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // 确保换行符一致
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 移除行尾多余空格
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
    
    // 确保指令格式正确（箭头、标签等）
    cleaned = cleaned.replace(/<--/g, '-->');  // 修正方向
    cleaned = cleaned.replace(/-->/g, '-->');   // 确保箭头格式正确
    
    return cleaned;
};

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
    const [failedCharts, setFailedCharts] = useState([]);  // 保存生成失败的图表
    const [renderedSvgs, setRenderedSvgs] = useState({});
    const [renderingStates, setRenderingStates] = useState({});
    const [previewChart, setPreviewChart] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState(0);
    const fileInputRef = useRef(null);
    const mermaidIdCounter = useRef(0);

    // 规范化 Mermaid SVG，避免被裁切/缩放异常（预览/复制使用同一份 SVG）
    const normalizeMermaidSvg = useCallback((rawSvg) => {
        if (!rawSvg || typeof rawSvg !== 'string') return rawSvg;

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rawSvg;
            const svg = tempDiv.querySelector('svg');
            if (!svg) return rawSvg;

            const viewBoxAttr = svg.getAttribute('viewBox');
            const widthAttr = svg.getAttribute('width');
            const heightAttr = svg.getAttribute('height');

            const parsePx = (v) => {
                if (!v) return null;
                if (String(v).includes('%')) return null;
                const m = String(v).match(/([0-9.]+)/);
                return m ? Number(m[1]) : null;
            };

            const vbParts = viewBoxAttr ? viewBoxAttr.split(/\s+/).map(Number) : null;
            const vbW = vbParts && vbParts.length === 4 ? vbParts[2] : null;
            const vbH = vbParts && vbParts.length === 4 ? vbParts[3] : null;

            // Mermaid 偶尔不带 viewBox，尝试用 width/height 补一个
            if (!viewBoxAttr) {
                const w = parsePx(widthAttr);
                const h = parsePx(heightAttr);
                if (w && h) {
                    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
                }
            }

            // 如果 width/height 是百分比或缺失，改为使用 viewBox 的数值，避免导出/显示裁切
            const finalViewBox = svg.getAttribute('viewBox');
            const finalVbParts = finalViewBox ? finalViewBox.split(/\s+/).map(Number) : null;
            const finalVbW = finalVbParts && finalVbParts.length === 4 ? finalVbParts[2] : vbW;
            const finalVbH = finalVbParts && finalVbParts.length === 4 ? finalVbParts[3] : vbH;

            const needsFixW = !widthAttr || String(widthAttr).includes('%');
            const needsFixH = !heightAttr || String(heightAttr).includes('%');
            if (finalVbW && needsFixW) svg.setAttribute('width', String(finalVbW));
            if (finalVbH && needsFixH) svg.setAttribute('height', String(finalVbH));

            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svg.setAttribute('overflow', 'visible');

            // 对齐 ProcessOn 的“完整展示”体验：
            // 把 SVG 挂到离屏容器，按真实图形边界重算 viewBox，避免右侧/底部被裁切
            const host = document.createElement('div');
            host.style.position = 'fixed';
            host.style.left = '-100000px';
            host.style.top = '-100000px';
            host.style.opacity = '0';
            host.style.pointerEvents = 'none';
            host.innerHTML = svg.outerHTML;
            document.body.appendChild(host);
            try {
                const liveSvg = host.querySelector('svg');
                const target = liveSvg?.querySelector('g') || liveSvg;
                if (liveSvg && target && typeof target.getBBox === 'function') {
                    const bbox = target.getBBox();
                    if (bbox && bbox.width > 0 && bbox.height > 0) {
                        const pad = 24;
                        const x = Math.floor(bbox.x - pad);
                        const y = Math.floor(bbox.y - pad);
                        const w = Math.ceil(bbox.width + pad * 2);
                        const h = Math.ceil(bbox.height + pad * 2);
                        svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
                        svg.setAttribute('width', String(w));
                        svg.setAttribute('height', String(h));
                    }
                }
            } finally {
                document.body.removeChild(host);
            }

            // 显示用样式：让 SVG 在容器内完整可见（必要时缩放）
            const prevStyle = svg.getAttribute('style') || '';
            const nextStyle = [
                prevStyle,
                'display:block',
                'max-width:100%',
                'height:auto',
            ].filter(Boolean).join(';');
            svg.setAttribute('style', nextStyle);

            return svg.outerHTML;
        } catch {
            return rawSvg;
        }
    }, []);

    // 使用 mermaid 渲染图表
    const renderChart = useCallback(async (chart) => {
        const chartId = `mermaid-${Date.now()}-${mermaidIdCounter.current++}`;

        setRenderingStates(prev => ({ ...prev, [chart.type]: 'rendering' }));

        try {
            // 验证Mermaid代码基本格式
            if (!chart.code || typeof chart.code !== 'string') {
                throw new Error('图表代码无效');
            }

            let code = chart.code.trim();
            if (!code) {
                throw new Error('图表代码为空');
            }

            // 清理代码以兼容Mermaid 11.x
            code = sanitizeMermaidCode(code);

            // 先尝试直接渲染
            let svg = null;
            let error = null;

            try {
                const result = await mermaid.render(chartId, code);
                svg = result.svg;
                error = result.error;
            } catch (renderError) {
                // 捕获渲染错误
                error = renderError.message || '渲染失败';
            }

            if (error) {
                // Mermaid返回了错误
                console.error(`[Mermaid] ${chart.type} 渲染错误:`, error);
                
                // 尝试简化代码再渲染一次（移除可能的格式问题）
                const simplifiedCode = simplifyForMermaid(code);
                if (simplifiedCode !== code) {
                    try {
                        const result2 = await mermaid.render(chartId + '-retry', simplifiedCode);
                        if (!result2.error && result2.svg) {
                            svg = result2.svg;
                            error = null;
                        }
                    } catch (retryError) {
                        console.error('[Mermaid] 重试也失败:', retryError);
                    }
                }
                
                if (error) {
                    throw new Error(error.message || 'Mermaid语法错误');
                }
            }
            
            if (!svg) {
                throw new Error('渲染结果为空');
            }

            const normalized = normalizeMermaidSvg(svg);
            setRenderedSvgs(prev => ({ ...prev, [chart.type]: normalized }));
            setRenderingStates(prev => ({ ...prev, [chart.type]: 'done' }));
            return normalized;
        } catch (error) {
            console.error(`渲染 ${chart.type} 失败:`, error);
            const errorMessage = error.message || '未知错误';
            
            // 更新渲染错误状态
            setRenderingStates(prev => ({ 
                ...prev, 
                [chart.type]: 'error',
                [`${chart.type}_error`]: errorMessage 
            }));
            
            // 如果渲染失败，将图表移到失败列表
            setGeneratedCharts(prev => {
                const updated = prev.filter(c => c.type !== chart.type);
                return updated;
            });
            const cleanMsg = cleanErrorMessage(errorMessage);
            setFailedCharts(prev => {
                const exists = prev.find(c => c.type === chart.type);
                if (exists) return prev;
                return [...prev, { 
                    ...chart, 
                    error: `渲染失败: ${cleanMsg}`,
                    detail: '图表代码可能存在语法错误，请尝试更换描述或图表类型'
                }];
            });
            
            toast.error(`${chart.name || chart.type} 渲染失败`, {
                details: cleanMsg
            });
            
            return null;
        }
    }, [normalizeMermaidSvg]);

    // 简化Mermaid代码以提高兼容性
    const simplifyForMermaid = (code) => {
        if (!code) return code;
        
        let simplified = code;
        
        // 移除所有HTML标签
        simplified = simplified.replace(/<[^>]+>/g, '');
        
        // 移除markdown格式
        simplified = simplified.replace(/\*\*/g, '');
        simplified = simplified.replace(/__/g, '');
        
        // 简化箭头，确保格式正确
        simplified = simplified.replace(/-+>/g, '-->');
        simplified = simplified.replace(/<-+/g, '--<');
        
        // 移除多余的空格
        simplified = simplified.replace(/\s+/g, ' ');
        
        return simplified;
    };

    // 清理Mermaid错误消息，隐藏技术细节
    const cleanErrorMessage = (errorMsg) => {
        if (!errorMsg) return '未知错误';
        
        // 移除版本号信息
        let cleaned = errorMsg.replace(/mermaid\s+version\s+[\d.]+/gi, '');
        
        // 移除"Syntax error in text"等技术细节，只保留核心错误
        if (cleaned.toLowerCase().includes('syntax error')) {
            return '图表语法错误';
        }
        
        // 移除URL和技术栈信息
        cleaned = cleaned.replace(/https?:\/\/[^\s]*/gi, '');
        cleaned = cleaned.replace(/at\s+[^\n]*/gi, '');
        
        // 截断过长消息
        if (cleaned.length > 100) {
            return cleaned.substring(0, 100).trim() + '...';
        }
        
        return cleaned.trim() || '图表生成失败';
    };

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

                // 只保留用户选择的图表 + 且生成成功
                const okCharts = charts.filter(chart =>
                    chart &&
                    chart.success !== false &&
                    selectedCharts.includes(chart.type) &&
                    typeof chart.code === 'string' &&
                    chart.code.trim().length > 0
                );

                const badCharts = charts.filter(chart =>
                    chart &&
                    selectedCharts.includes(chart.type) &&
                    (chart.success === false || !chart.code || String(chart.code).trim().length === 0)
                );

                setGeneratedCharts(okCharts);
                setFailedCharts(badCharts);  // 保存失败的图表用于显示

                if (badCharts.length > 0) {
                    const tip = badCharts
                        .slice(0, 3)
                        .map(c => `${CHART_TYPES_CONFIG.find(t => t.id === c.type)?.name || c.type}：${c.error || c.detail || '不适合生成'}`)
                        .join('\n');
                    toast.warning(`部分图表未生成（${badCharts.length}/${selectedCharts.length}）`, {
                        details: tip
                    });
                }

                if (okCharts.length > 0) {
                    toast.success(`成功生成 ${okCharts.length} 个图表！`);
                } else {
                    // 所有图表都失败了，显示失败原因
                    toast.error('所选图表不适合用当前描述生成', {
                        details: badCharts.map(c => c.error || c.detail || '不适合生成').join('\n')
                    });
                    return;
                }

                // 延迟打开全屏预览，等待SVG渲染完成
                if (okCharts.length > 0) {
                    const firstChart = okCharts[0];
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

    // 复制图表为PNG图片
    const handleCopyAsImage = async (chart) => {
        const svgCode = renderedSvgs[chart.type];
        if (!svgCode) {
            toast.error('图表尚未渲染完成');
            return;
        }

        // 下载文件的辅助函数
        const downloadBlob = (blob, filename) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        // 直接下载SVG
        const downloadSvg = () => {
            const normalized = normalizeMermaidSvg(svgCode);
            const svgBlob = new Blob([normalized], { type: 'image/svg+xml' });
            downloadBlob(svgBlob, `${chart.type}_${Date.now()}.svg`);
        };

        // 直接下载PNG（通过Canvas转换）
        const downloadPng = async () => {
            try {
                // 创建临时容器解析SVG
                const tempDiv = document.createElement('div');
                const normalized = normalizeMermaidSvg(svgCode);
                tempDiv.innerHTML = normalized;
                const svgElement = tempDiv.querySelector('svg');
                if (!svgElement) {
                    throw new Error('SVG 元素不存在');
                }

                // 获取SVG尺寸
                let width = 800;
                let height = 600;
                const viewBox = svgElement.getAttribute('viewBox');
                if (viewBox) {
                    const parts = viewBox.split(' ').map(Number);
                    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                        width = Math.max(parts[2], 400);
                        height = Math.max(parts[3], 300);
                    }
                }
                const svgWidth = parseFloat(svgElement.getAttribute('width')) || width;
                const svgHeight = parseFloat(svgElement.getAttribute('height')) || height;
                width = Math.max(width, svgWidth);
                height = Math.max(height, svgHeight);

                // 创建Canvas
                const padding = 20;
                const canvas = document.createElement('canvas');
                canvas.width = width + padding * 2;
                canvas.height = height + padding * 2;
                const ctx = canvas.getContext('2d');

                // 填充白色背景
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 序列化SVG并转为图片
                const svgSerializer = new XMLSerializer();
                const svgString = svgSerializer.serializeToString(svgElement);
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, padding, padding, width, height);
                        URL.revokeObjectURL(url);

                        // 导出为PNG并下载
                        canvas.toBlob((pngBlob) => {
                            if (pngBlob) {
                                resolve(pngBlob);
                            } else {
                                reject(new Error('PNG转换失败'));
                            }
                        }, 'image/png', 1.0);
                    };
                    img.onerror = () => {
                        URL.revokeObjectURL(url);
                        reject(new Error('SVG加载失败'));
                    };
                    img.src = url;
                });
            } catch (error) {
                console.error('PNG转换失败:', error);
                throw error;
            }
        };

        // 尝试复制PNG到剪贴板
        const copyPngToClipboard = async (pngBlob) => {
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                    const clipboardItem = new ClipboardItem({ 'image/png': pngBlob });
                    await navigator.clipboard.write([clipboardItem]);
                    return true;
                } catch (e) {
                    console.warn('剪贴板API失败:', e);
                    return false;
                }
            }
            return false;
        };

        // 主逻辑：优先复制PNG，失败则下载
        try {
            toast.info('正在处理图片...');

            // 1. 尝试转换为PNG
            const pngBlob = await downloadPng();

            // 2. 尝试复制到剪贴板
            const copied = await copyPngToClipboard(pngBlob);

            if (copied) {
                toast.success('图片已复制到剪贴板，可直接粘贴使用');
            } else {
                // 剪贴板不可用，下载PNG
                downloadBlob(pngBlob, `${chart.type}_${Date.now()}.png`);
                toast.success('已下载PNG图片文件');
            }
        } catch (error) {
            // PNG转换失败，fallback到下载SVG
            console.error('PNG复制失败，fallback到SVG:', error);
            downloadSvg();
            toast.warning('PNG复制失败，已下载SVG矢量图文件');
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
                            accept=".pdf,.docx,.doc,.txt,.md,.html,.sql"
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
            {(generatedCharts.length > 0 || failedCharts.length > 0) && (
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            已生成图表 ({generatedCharts.length})
                            {failedCharts.length > 0 && (
                                <span className="text-sm font-normal text-orange-400">
                                    · {failedCharts.length} 个未生成
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 成功生成的图表 */}
                        {generatedCharts.map((chart, index) => {
                            const chartConfig = CHART_TYPES_CONFIG.find(c => c.id === chart.type);
                            const svg = renderedSvgs[chart.type];
                            const renderingState = renderingStates[chart.type];

                            return (
                                <div
                                    key={`ok-${index}`}
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
                                    `}
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, rgba(156,163,175,0.35) 1px, transparent 1px)',
                                        backgroundSize: '16px 16px'
                                    }}>
                                        <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                                            {renderingState === 'rendering' && (
                                                <div className="flex flex-col items-center gap-3 h-full justify-center">
                                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                    <span className="text-sm text-gray-500">渲染中...</span>
                                                </div>
                                            )}

                                            {renderingState === 'error' && (
                                                <div className={`
                                                    flex flex-col items-center gap-4 p-6 h-full justify-center max-w-sm mx-auto text-center
                                                    ${isDarkMode ? 'bg-red-900/20 rounded-xl border border-red-800/30' : 'bg-red-50 rounded-xl border border-red-200'}
                                                `}>
                                                    {/* 错误图标 */}
                                                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                                        <AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                                                    </div>
                                                    
                                                    {/* 错误标题 */}
                                                    <div>
                                                        <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                                                            渲染失败
                                                        </p>
                                                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            图表代码存在语法错误
                                                        </p>
                                                    </div>
                                                    
                                                    {/* 错误详情（如果有） */}
                                                    {renderingStates[`${chart.type}_error`] && (
                                                        <div className={`
                                                            px-3 py-2 rounded-lg text-xs font-mono max-w-full break-all
                                                            ${isDarkMode ? 'bg-gray-900/80 text-red-300' : 'bg-white text-red-600'}
                                                        `}>
                                                            {renderingStates[`${chart.type}_error`].slice(0, 100)}
                                                            {renderingStates[`${chart.type}_error`].length > 100 && '...'}
                                                        </div>
                                                    )}
                                                    
                                                    {/* 操作建议 */}
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        💡 提示：请尝试更换描述或选择其他图表类型
                                                    </p>
                                                </div>
                                            )}

{svg && (
                                                <div
                                                    className="w-full overflow-auto flex items-center justify-center"
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

                        {/* 未生成的图表（显示失败原因） */}
                        {failedCharts.map((chart, index) => {
                            const chartConfig = CHART_TYPES_CONFIG.find(c => c.id === chart.type);
                            const errorMsg = cleanErrorMessage(chart.error || chart.detail || '不适合用当前描述生成');

                            return (
                                <div
                                    key={`fail-${index}`}
                                    className={`
                                        rounded-2xl p-5 border-2 border-dashed transition-all duration-300
                                        ${isDarkMode ? 'bg-gray-800/30 border-orange-500/30 hover:border-orange-500/50' : 'bg-orange-50/50 border-orange-300/50 hover:border-orange-400'}
                                    `}
                                >
                                    {/* 图表头部 */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                                                <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{chartConfig?.name || chart.type}</div>
                                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    未生成
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* 删除按钮 */}
                                        <button
                                            onClick={() => setFailedCharts(prev => prev.filter((_, i) => i !== index))}
                                            className={`p-1.5 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
                                            title="移除"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* 错误原因 - 美化版 */}
                                    <div className={`
                                        rounded-xl p-5 text-center
                                        ${isDarkMode ? 'bg-gray-900/60 border border-orange-800/30' : 'bg-white border border-orange-100'}
                                    `}>
                                        {/* 状态图标 */}
                                        <div className={`inline-flex p-3 rounded-full mb-4 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                                            <AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                                        </div>
                                        
                                        {/* 错误标题 */}
                                        <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                                            {errorMsg.includes('渲染失败') ? '图表渲染失败' : '不适合生成'}
                                        </p>
                                        
                                        {/* 错误详情 */}
                                        {errorMsg && (
                                            <p className={`
                                                text-xs font-mono px-3 py-2 rounded-lg mb-3 max-w-full break-all
                                                ${isDarkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-100 text-gray-600'}
                                            `}>
                                                {errorMsg.slice(0, 150)}
                                                {errorMsg.length > 150 && '...'}
                                            </p>
                                        )}
                                        
                                        {/* 解决建议 */}
                                        <div className={`
                                            text-xs px-3 py-2 rounded-lg
                                            ${isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-600'}
                                        `}>
                                            💡 {errorMsg.includes('渲染失败') 
                                                ? '请尝试更换描述或选择其他图表类型' 
                                                : '请修改描述使其包含更多具体信息后重试'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 预览弹窗（轻量遮罩 + 仅展示当前图） */}
            {showPreview && previewChart && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowPreview(false);
                    }}
                >
                    <div
                        className={`w-full max-w-7xl max-h-[95vh] rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
                            isDarkMode ? 'bg-gray-900 border-gray-700/60' : 'bg-white border-gray-200'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 顶部栏 */}
                        <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
                            isDarkMode ? 'border-gray-700/60' : 'border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-xl ${colorMap[CHART_TYPES_CONFIG.find(c => c.id === previewChart.type)?.color || 'blue']}`}>
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {CHART_TYPES_CONFIG.find(c => c.id === previewChart.type)?.name || previewChart.type}
                                    </div>
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        点击遮罩关闭
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCopyAsImage(previewChart)}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                                        isDarkMode
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    }`}
                                    title="复制为PNG（不支持则自动下载）"
                                >
                                    <Image className="w-4 h-4" />
                                    复制图片
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className={`p-2 rounded-xl transition ${
                                        isDarkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                    title="关闭"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* 图表内容区 - 使用flex-1和overflow-auto确保完整显示 */}
                        <div 
                            className="flex-1 overflow-auto flex items-start justify-center p-6"
                            style={{
                                minHeight: 0,
                                backgroundImage: 'radial-gradient(circle, rgba(156,163,175,0.28) 1px, transparent 1px)',
                                backgroundSize: '16px 16px'
                            }}
                        >
                        {renderedSvgs[previewChart.type] ? (
                            <div 
                                className="bg-white rounded-xl shadow-xl"
                                style={{ 
                                    maxWidth: '100%',
                                    overflow: 'visible'
                                }}
                            >
                                {/* 使用div包装svg，确保Mermaid SVG正确渲染 */}
                                <div
                                    style={{ 
                                        display: 'block',
                                        padding: '24px',
                                        overflow: 'visible',
                                        background: 'white',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {/* 强制SVG正确显示 */}
                                    <div 
                                        style={{
                                            display: 'block',
                                            width: 'fit-content',
                                            height: 'auto',
                                            maxWidth: 'none',
                                            overflow: 'visible'
                                        }}
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: renderedSvgs[previewChart.type] }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* 加载动画 */
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className={`w-6 h-6 animate-spin mr-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />
                                <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>图表渲染中...</span>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartGenerator;