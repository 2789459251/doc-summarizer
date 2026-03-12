// src/components/GuideModal.jsx
import React, { useState, useEffect } from 'react';

const GuideModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);

    // 步骤轮播逻辑
    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setStep(prev => (prev % 3) + 1);
        }, 2500);
        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null; // 未打开时不渲染

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-[500px] bg-gray-900/95 p-8 rounded-2xl border border-cyan-500/40 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-cyan-400 text-xl font-bold">使用引导</h4>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>
                <div className="space-y-4 text-base text-gray-300">
                    <div className={`flex items-center gap-4 transition-all ${step === 1 ? 'text-cyan-400 font-bold scale-105' : 'text-gray-500'}`}>
                        <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current text-sm">1</span>
                        <div>
                            <div className="font-semibold">上传文档</div>
                            <div className="text-sm text-gray-400">选择或拖拽文件到上传区域</div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-4 transition-all ${step === 2 ? 'text-cyan-400 font-bold scale-105' : 'text-gray-500'}`}>
                        <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current text-sm">2</span>
                        <div>
                            <div className="font-semibold">解析内容</div>
                            <div className="text-sm text-gray-400">系统自动解析文档结构与文本</div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-4 transition-all ${step === 3 ? 'text-cyan-400 font-bold scale-105' : 'text-gray-500'}`}>
                        <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current text-sm">3</span>
                        <div>
                            <div className="font-semibold">生成摘要</div>
                            <div className="text-sm text-gray-400">一键生成多语言结构化摘要</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideModal;