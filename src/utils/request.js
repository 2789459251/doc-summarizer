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

    // 读取响应体文本（处理空响应）
    const responseText = await response.text();
    if (!responseText) {
        if (!response.ok) {
            throw new Error(`请求失败 (${response.status})`);
        }
        return {};
    }
    const data = JSON.parse(responseText);

    // 401 未授权
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 通知 AuthContext 清除 user 状态（更新右上角登录状态）
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // 检查当前是否在错误处理中，避免循环
        if (!url.includes('/api/login') && !window.showingAuthToast) {
            window.showingAuthToast = true;
            
            // 清理状态
            window.clearAuthState = () => {
                window.showingAuthToast = false;
                if (window.authToastTimeout) {
                    clearTimeout(window.authToastTimeout);
                }
            };
            
            // 显示登录提示弹窗
            const toastEvent = new CustomEvent('showToast', {
                detail: {
                    type: 'error',
                    title: '登录已过期',
                    message: '您的登录已过期，请重新登录以继续使用',
                    duration: 0, // 不自动关闭
                    action: {
                        label: '立即登录',
                        onClick: () => {
                            // 清理状态
                            if (window.clearAuthState) {
                                window.clearAuthState();
                            }
                            // 使用window.location跳转到登录页
                            window.location.hash = '#/login';
                            window.location.reload();
                        }
                    }
                }
            });
            window.dispatchEvent(toastEvent);
            
            // 5秒后如果没有点击按钮，也跳转到登录页
            window.authToastTimeout = setTimeout(() => {
                if (window.showingAuthToast) {
                    window.location.hash = '#/login';
                    window.location.reload();
                }
            }, 5000);
        }
        
        throw new Error('UNAUTHORIZED:登录已过期，请重新登录');
    }

    if (!response.ok) {
        throw new Error(data.detail || '请求失败');
    }

    return data;
};