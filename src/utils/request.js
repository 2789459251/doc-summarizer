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

    // 401 未授权
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 检查当前是否在错误处理中，避免循环
        if (!url.includes('/api/login') && !window.showingAuthToast) {
            window.showingAuthToast = true;
            
            // 显示登录提示弹窗
            const toastEvent = new CustomEvent('showToast', {
                detail: {
                    type: 'error',
                    title: '登录已过期',
                    message: '您的登录已过期，请重新登录以继续使用',
                    duration: 8000,
                    action: {
                        label: '立即登录',
                        onClick: () => {
                            window.location.href = '#/login';
                            window.showingAuthToast = false;
                        }
                    }
                }
            });
            window.dispatchEvent(toastEvent);
            
            // 3秒后重置标志
            setTimeout(() => {
                window.showingAuthToast = false;
            }, 3000);
        }
        
        // 仍然跳转到登录页，但先让用户看到提示
        setTimeout(() => {
            window.location.href = '#/login';
        }, 1500);
        
        throw new Error('UNAUTHORIZED:登录已过期，请重新登录');
    }

    if (!response.ok) {
        throw new Error(data.detail || '请求失败');
    }

    return data;
};