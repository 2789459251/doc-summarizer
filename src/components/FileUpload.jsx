import { useState } from 'react';

export default function FileUpload({ onFileUpload }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStatus(`已选择文件：${selectedFile.name}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setStatus('请先选择文件！');
            return;
        }

        setStatus('正在解析文件...');
        setTimeout(() => {
            const mockResult = {
                fileName: file.name,
                format: file.name.split('.').pop(),
                contentPreview: '这是文件的预览内容（模拟）...',
            };
            onFileUpload(mockResult);
            setStatus('解析完成！');
        }, 1500);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">多格式文档解析</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".md,.tex,.docx,.pdf,.txt"
                    className="mb-4"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    解析文件
                </button>
            </form>
            {status && <p className="mt-2 text-gray-600">{status}</p>}
        </div>
    );
}