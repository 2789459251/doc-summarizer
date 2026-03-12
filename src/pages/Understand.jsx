import React from 'react';
import { Cpu, BookOpen, ListTodo } from 'lucide-react';

const Understand = () => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    智能文档理解
                </h1>
                <p className="text-gray-400 mt-2">AI 自动分析结构、章节、重点与逻辑关系</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-700/50">
                    <Cpu className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold">结构识别</h3>
                    <p className="text-sm text-gray-400">自动拆分标题、段落、列表、代码块</p>
                </div>

                <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-700/50">
                    <BookOpen className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold">章节理解</h3>
                    <p className="text-sm text-gray-400">理解上下文关系，生成章节大纲</p>
                </div>

                <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-700/50">
                    <ListTodo className="w-8 h-8 text-pink-400 mb-4" />
                    <h3 className="text-lg font-semibold">重点提取</h3>
                    <p className="text-sm text-gray-400">自动标记关键句、结论、数据与观点</p>
                </div>
            </div>
        </div>
    );
};

export default Understand;