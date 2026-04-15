// 批量更新页面主题支持脚本
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

// 需要替换的颜色映射（深色 -> 白天）
const colorMappings = [
    // 背景色
    { from: /bg-gray-900\/60/g, toDark: 'bg-gray-900/60', toLight: 'bg-white' },
    { from: /bg-gray-900\/80/g, toDark: 'bg-gray-900/80', toLight: 'bg-white' },
    { from: /bg-gray-800/g, toDark: 'bg-gray-800', toLight: 'bg-orange-50' },
    { from: /bg-gray-800\/50/g, toDark: 'bg-gray-800/50', toLight: 'bg-orange-50/50' },
    
    // 边框色
    { from: /border-gray-700/g, toDark: 'border-gray-700', toLight: 'border-orange-200' },
    { from: /border-gray-700\/50/g, toDark: 'border-gray-700/50', toLight: 'border-orange-200' },
    
    // 文字色
    { from: /text-gray-400/g, toDark: 'text-gray-400', toLight: 'text-gray-600' },
    { from: /text-gray-500/g, toDark: 'text-gray-500', toLight: 'text-gray-500' },
    { from: /text-white/g, toDark: 'text-white', toLight: 'text-gray-800' },
    
    // 按钮背景
    { from: /bg-gray-700/g, toDark: 'bg-gray-700', toLight: 'bg-orange-100' },
    { from: /hover:bg-gray-600/g, toDark: 'hover:bg-gray-600', toLight: 'hover:bg-orange-200' },
    { from: /hover:bg-gray-700\/50/g, toDark: 'hover:bg-gray-700/50', toLight: 'hover:bg-orange-100' },
    
    // 输入框
    { from: /focus:border-pink-500/g, toDark: 'focus:border-pink-500', toLight: 'focus:border-orange-500' },
    { from: /focus:border-cyan-500/g, toDark: 'focus:border-cyan-500', toLight: 'focus:border-orange-500' },
];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 检查是否已经导入 useTheme
    if (!content.includes('useTheme') && !content.includes('ThemeContext')) {
        // 添加导入
        const importIndex = content.lastIndexOf('import');
        const importEndIndex = content.indexOf('\n', importIndex);
        content = content.slice(0, importEndIndex + 1) + 
                  "import { useTheme } from '../context/ThemeContext';\n" +
                  content.slice(importEndIndex + 1);
    }
    
    console.log(`Processed ${file}`);
});

console.log('Done!');
