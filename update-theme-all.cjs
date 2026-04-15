const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 检查是否已经有 isDarkMode 的使用
    if (content.includes('isDarkMode') && content.includes('useTheme')) {
        console.log(`Skipping ${file} - already has theme support`);
        return;
    }
    
    // 添加 useTheme 导入（如果不存在）
    if (!content.includes('useTheme')) {
        const lastImport = content.lastIndexOf('import');
        const lastImportEnd = content.indexOf(';', lastImport) + 1;
        content = content.slice(0, lastImportEnd) + 
                  "\nimport { useTheme } from '../context/ThemeContext';" +
                  content.slice(lastImportEnd);
    }
    
    // 在组件函数开头添加 const { isDarkMode } = useTheme();
    const componentMatch = content.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/);
    if (componentMatch && !content.includes('const { isDarkMode } = useTheme()')) {
        const insertIndex = componentMatch.index + componentMatch[0].length;
        content = content.slice(0, insertIndex) + 
                  '\n    const { isDarkMode } = useTheme();' +
                  content.slice(insertIndex);
    }
    
    // 替换深色背景为条件样式
    // 这种方法比较粗暴，实际应该更精细地处理每个元素
    content = content.replace(
        /className="([^"]*)bg-gray-900\/60([^"]*)"/g,
        'className={`$1${isDarkMode ? \'bg-gray-900/60\' : \'bg-white border border-orange-200\'}$2`}'
    );
    
    content = content.replace(
        /className="([^"]*)bg-gray-800([^"]*)"/g,
        'className={`$1${isDarkMode ? \'bg-gray-800\' : \'bg-orange-50\'}$2`}'
    );
    
    content = content.replace(
        /className="([^"]*)border-gray-700([^"]*)"/g,
        'className={`$1${isDarkMode ? \'border-gray-700\' : \'border-orange-200\'}$2`}'
    );
    
    content = content.replace(
        /className="([^"]*)text-gray-400([^"]*)"/g,
        'className={`$1${isDarkMode ? \'text-gray-400\' : \'text-gray-600\'}$2`}'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});

console.log('All files updated!');
