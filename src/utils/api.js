// API 服务模块 - 统一封装所有后端API调用
import { request } from './request';

const API_BASE = 'http://localhost:8000';

// ========================================
// 1. 高级摘要 (LangGraph 工作流)
// ========================================
export const advancedSummarize = async ({
    fileId,
    userRole = 'general',
    summaryLength = 'standard',
    customStyle = 'academic',
    customPurpose = 'learning'
}) => {
    const params = new URLSearchParams({
        file_id: fileId,
        user_role: userRole,
        summary_length: summaryLength,
        custom_style: customStyle,
        custom_purpose: customPurpose
    });

    return request(`${API_BASE}/api/summarize/advanced?${params}`, {
        method: 'POST'
    });
};

// 快速摘要
export const quickSummarize = async ({ content, summaryLength = 'standard' }) => {
    return request(`${API_BASE}/api/summarize/quick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ content, summary_length: summaryLength })
    });
};

// ========================================
// 2. 智能问答
// ========================================
export const askQuestion = async ({
    fileId,
    question,
    sessionId = 'default',
    useMemory = true
}) => {
    return request(`${API_BASE}/api/qa/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            file_id: fileId,
            question,
            session_id: sessionId,
            use_memory: String(useMemory)
        })
    });
};

// 多文档问答
export const multiDocAsk = async ({ fileIds, question, sessionId = 'multi' }) => {
    return request(`${API_BASE}/api/qa/multi-doc-ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            file_ids: fileIds,
            question,
            session_id: sessionId
        })
    });
};

// WebSocket 实时问答
export const createQAWebSocket = (sessionId, callbacks) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/qa/${sessionId}`);

    ws.onopen = () => callbacks.onOpen?.();

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callbacks.onMessage?.(data);
    };

    ws.onerror = (error) => callbacks.onError?.(error);

    ws.onclose = () => callbacks.onClose?.();

    return {
        send: (data) => ws.send(JSON.stringify(data)),
        close: () => ws.close()
    };
};

// ========================================
// 3. 文档格式转换
// ========================================
export const getConverterFormats = async () => {
    return request(`${API_BASE}/api/converter/formats`);
};

export const convertDocument = async ({ fileId, outputFormat }) => {
    return request(`${API_BASE}/api/converter/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ file_id: fileId, output_format: outputFormat })
    });
};

export const batchConvert = async ({ fileIds, outputFormat }) => {
    return request(`${API_BASE}/api/converter/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            file_ids: fileIds,
            output_format: outputFormat
        })
    });
};

// ========================================
// 4. 文件上传（扩展）
// ========================================
export const uploadFile = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/api/upload/`);

        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('token_type') || 'Bearer';
        xhr.setRequestHeader('Authorization', `${tokenType} ${token}`);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress?.(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                // 401未授权错误，特殊处理
                if (xhr.status === 401) {
                    reject(new Error('UNAUTHORIZED:请先登录以使用文件上传功能'));
                } else {
                    reject(new Error(xhr.responseText || '上传失败'));
                }
            }
        };

        xhr.onerror = () => reject(new Error('网络错误'));
        xhr.send(formData);
    });
};

// ========================================
// 5. 文档处理（扩展）
// ========================================
export const processDocument = async ({
    fileId,
    summaryType = 'document',
    summaryLength = 'standard',
    outputLanguage = 'auto'
}) => {
    const formData = new FormData();
    formData.append('summary_type', summaryType);
    formData.append('summary_length', summaryLength);
    formData.append('output_language', outputLanguage);

    return request(`${API_BASE}/api/process/${fileId}`, {
        method: 'POST',
        body: formData
    });
};

export const reprocessDocument = async ({
    fileId,
    summaryType = 'document',
    summaryLength = 'standard',
    outputLanguage = 'auto'
}) => {
    const formData = new FormData();
    formData.append('summary_type', summaryType);
    formData.append('summary_length', summaryLength);
    formData.append('output_language', outputLanguage);

    return request(`${API_BASE}/api/process/${fileId}`, {
        method: 'POST',
        body: formData
    });
};

export const getTaskStatus = async (taskId) => {
    return request(`${API_BASE}/api/task/${taskId}`);
};

export const getSummary = async (taskId) => {
    return request(`${API_BASE}/api/summary/${taskId}`);
};

export const getDocument = async (fileId) => {
    return request(`${API_BASE}/api/document/${fileId}`);
};

// ========================================
// 6. 图表生成（智能文档理解模块）
// ========================================
// PlantUML 图表生成
// ========================================

/**
 * 获取支持的 PlantUML 图表类型
 */
export const getPlantUMLTypes = async () => {
    return request(`${API_BASE}/api/plantuml/types`);
};

/**
 * 生成 PlantUML 图表
 * @param {string} code - PlantUML 代码
 * @param {string} chartType - 图表类型
 */
export const generatePlantUML = async (code, chartType = 'auto') => {
    return request(`${API_BASE}/api/plantuml/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            chart_type: chartType
        })
    });
};

// ========================================
export const generateCharts = async ({ file_id, chart_types = [], user_description = '' }) => {
    // 14种图表类型
    const allChartTypes = [
        'flowchart',      // 流程图
        'sequence',       // 时序图
        'class-diagram',  // 类图
        'state-machine',  // 状态机
        'entity-relation', // ER图
        'gantt',          // 甘特图
        'pie',            // 饼图
        'bar',            // 柱状图
        'line',           // 折线图
        'scatter',        // 散点图
        'radar',          // 雷达图
        'heatmap',        // 热力图
        'tree',           // 树状图
        'network'         // 网络图
    ];

    const types = chart_types.length > 0 ? chart_types : allChartTypes;

    return request(`${API_BASE}/api/charts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            file_id: file_id, 
            chart_types: types,
            user_description: user_description  // 传递用户描述给AI
        })
    });
};

export const exportChart = async ({ chartId, format = 'xml' }) => {
    return request(`${API_BASE}/api/charts/export/${chartId}?format=${format}`);
};
