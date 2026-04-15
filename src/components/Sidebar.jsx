import { useState } from 'react';

export default function Sidebar({ onModuleChange }) {
    const modules = [
        { id: 1, name: '多格式文档解析' },
        { id: 2, name: '智能文档理解' },
        { id: 3, name: '格式转换工具' },
        { id: 4, name: '领域知识增强' },
        { id: 5, name: '个性化摘要定制' },
    ];

    const [activeModule, setActiveModule] = useState(1);

    const handleClick = (id) => {
        setActiveModule(id);
        onModuleChange(id);
    };

    return (
        <div className="w-64 bg-gray-800 text-white p-4">
            <h2 className="text-xl font-bold mb-4">功能模块</h2>
            <ul>
                {modules.map((module) => (
                    <li key={module.id} className="mb-2">
                        <button
                            onClick={() => handleClick(module.id)}
                            className={`w-full text-left p-2 rounded ${
                                activeModule === module.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                            }`}
                        >
                            {module.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}