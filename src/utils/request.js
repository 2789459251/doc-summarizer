// 请求工具类：统一携带 Token
export const request = async (url, options = {}) => {
    // 默认配置
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        },
    };

    // 合并配置
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

    // 如果有 Token，添加到请求头
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    if (token && tokenType) {
        mergedOptions.headers = {
            ...mergedOptions.headers,
            'Authorization': `${tokenType} ${token}`,
        };
    }

    // 发送请求
    const response = await fetch(url, mergedOptions);

    // 统一处理响应
    const data = await response.json();

    // 401 未授权，跳转到登录页
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '#/login';
        throw new Error('登录已过期，请重新登录');
    }

    if (!response.ok) {
        throw new Error(data.detail || '请求失败');
    }

    return data;
};