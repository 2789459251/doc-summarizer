// import { useState, useEffect, useRef } from 'react';
// import { Upload, FileText, Zap, Shield, Clock, CheckCircle } from 'lucide-react';
// import './App.css';
//
// function App() {
//     // 状态管理
//     const [text, setText] = useState('');
//     const [summary, setSummary] = useState('');
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [uploadedFile, setUploadedFile] = useState(null);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [docCount, setDocCount] = useState(128);
//     const [uploadTime, setUploadTime] = useState('2.4s');
//
//     // 引用文件输入
//     const fileInputRef = useRef(null);
//
//     // 科技感词汇数据
//     const techWords = [
//         "AI人工智能", "机器学习", "神经网络", "深度学习", "数据分析",
//         "云计算", "大数据", "区块链", "物联网", "量子计算",
//         "边缘计算", "数字孪生", "元宇宙", "智能合约", "自然语言处理"
//     ];
//
//     // 处理文件上传
//     const handleFileUpload = (event) => {
//         const file = event.target.files[0];
//         if (!file) return;
//
//         setUploadedFile(file);
//         setUploadProgress(0);
//
//         // 模拟上传进度
//         const progressInterval = setInterval(() => {
//             setUploadProgress(prev => {
//                 if (prev >= 100) {
//                     clearInterval(progressInterval);
//
//                     // 模拟文件读取和文本提取
//                     setTimeout(() => {
//                         const mockText = `本文档是${file.name}的模拟内容。\n\n` +
//                             `人工智能技术在文档处理领域的应用日益广泛。智能文档摘要系统利用自然语言处理技术，能够快速分析长文档，提取核心信息，生成简洁准确的摘要。\n\n` +
//                             `该系统支持多种文档格式，包括PDF、Word、Excel等，能够处理中文、英文等多种语言。通过深度学习算法，系统不断优化摘要质量，确保关键信息不遗漏。\n\n` +
//                             `在实际应用中，智能文档摘要可以大大提高工作效率，减少人工阅读时间，帮助用户快速获取文档要点。特别是在处理大量文档时，优势更加明显。`;
//
//                         setText(mockText);
//                         simulateProcessing(mockText);
//                     }, 500);
//
//                     return 100;
//                 }
//                 return prev + 10;
//             });
//         }, 100);
//     };
//
//     // 模拟处理函数
//     const simulateProcessing = (content) => {
//         setIsProcessing(true);
//
//         // 模拟AI处理过程
//         setTimeout(() => {
//             const sentences = content.split(/[.!?]+/).filter(s => s.trim());
//             const summaryText = sentences.length > 3
//                 ? sentences.slice(0, 3).join('. ') + '...'
//                 : sentences.join('. ');
//
//             setSummary(summaryText);
//             setIsProcessing(false);
//             setDocCount(prev => prev + 1);
//             setUploadTime((Math.random() * 1 + 2).toFixed(1) + 's');
//         }, 2000);
//     };
//
//     // 处理直接输入
//     const handleProcess = () => {
//         if (!text.trim()) return;
//         simulateProcessing(text);
//     };
//
//     // 创建科技感背景元素
//     const BackgroundGrid = () => {
//         return (
//             <div className="fixed inset-0 z-0 overflow-hidden">
//                 {/* 网格背景 */}
//                 <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
//                     <div className="absolute inset-0 opacity-20" style={{
//                         backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px),
//                             linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
//                         backgroundSize: '50px 50px'
//                     }}></div>
//                 </div>
//
//                 {/* 动态流动线 */}
//                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
//                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
//
//                 {/* 浮动科技词汇 */}
//                 {techWords.slice(0, 12).map((word, index) => {
//                     const colors = ['text-cyan-400', 'text-blue-400', 'text-purple-400', 'text-emerald-400'];
//                     const colorClass = colors[index % colors.length];
//                     const size = Math.random() * 20 + 12;
//                     const left = Math.random() * 90 + 5;
//                     const top = Math.random() * 90 + 5;
//                     const duration = Math.random() * 20 + 20;
//                     const delay = Math.random() * 5;
//
//                     return (
//                         <div
//                             key={index}
//                             className={`absolute opacity-10 hover:opacity-30 transition-opacity duration-300 ${colorClass} font-mono font-bold`}
//                             style={{
//                                 left: `${left}%`,
//                                 top: `${top}%`,
//                                 fontSize: `${size}px`,
//                                 animation: `float ${duration}s linear ${delay}s infinite`
//                             }}
//                         >
//                             {word}
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };
//
//     // 步骤卡片组件
//     const StepCard = ({ number, title, description, icon: Icon, color }) => (
//         <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all group">
//             <div className="flex items-start gap-4">
//                 <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
//                     <Icon className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                     <div className="flex items-center gap-2 mb-2">
//                         <span className="text-sm font-semibold text-gray-400">步骤{number}</span>
//                         <div className="h-px w-4 bg-gray-600"></div>
//                         <h3 className="text-lg font-semibold text-white">{title}</h3>
//                     </div>
//                     <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
//                 </div>
//             </div>
//         </div>
//     );
//
//     return (
//         <div className="relative min-h-screen overflow-hidden bg-black text-white">
//             <BackgroundGrid />
//
//             {/* 主要内容容器 */}
//             <div className="relative z-10 container mx-auto px-4 py-12">
//                 {/* 头部区域 */}
//                 <header className="text-center mb-16">
//                     <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/20">
//                         <Zap className="w-5 h-5 text-cyan-400" />
//                         <span className="text-cyan-300 font-medium">智能文档摘要生成器</span>
//                     </div>
//                     <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
//                         欢迎使用 DocSummAI
//                     </h1>
//                     <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
//                         上传您的文档，AI 将为您生成精准摘要，节省 90% 的阅读时间
//                     </p>
//
//                     {/* 统计数据 */}
//                     <div className="flex flex-wrap justify-center gap-6 mt-12">
//                         {[
//                             { label: '已处理文档', value: `${docCount.toLocaleString()}+`, color: 'text-cyan-400' },
//                             { label: '平均处理时间', value: uploadTime, color: 'text-emerald-400' },
//                             { label: '支持格式', value: '10+', color: 'text-purple-400' },
//                             { label: '用户满意度', value: '98.7%', color: 'text-yellow-400' }
//                         ].map((stat, index) => (
//                             <div key={index} className="text-center">
//                                 <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
//                                 <div className="text-sm text-gray-400">{stat.label}</div>
//                             </div>
//                         ))}
//                     </div>
//                 </header>
//
//                 {/* 主要功能区域 */}
//                 <main className="max-w-6xl mx-auto">
//                     <div className="grid md:grid-cols-2 gap-8 mb-12">
//                         {/* 左侧：欢迎和上传区域 */}
//                         <div className="space-y-8">
//                             {/* 上传区域 */}
//                             <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
//                                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//                                     <Upload className="w-6 h-6 text-cyan-400" />
//                                     <span>上传您的文档</span>
//                                 </h2>
//
//                                 {/* 拖拽上传区域 */}
//                                 <div
//                                     className="border-3 border-dashed border-gray-600/50 rounded-2xl p-12 text-center hover:border-cyan-500/50 hover:bg-gray-900/30 transition-all cursor-pointer"
//                                     onClick={() => fileInputRef.current?.click()}
//                                     onDragOver={(e) => {
//                                         e.preventDefault();
//                                         e.currentTarget.classList.add('border-cyan-500/50', 'bg-gray-900/30');
//                                     }}
//                                     onDragLeave={(e) => {
//                                         e.currentTarget.classList.remove('border-cyan-500/50', 'bg-gray-900/30');
//                                     }}
//                                     onDrop={(e) => {
//                                         e.preventDefault();
//                                         e.currentTarget.classList.remove('border-cyan-500/50', 'bg-gray-900/30');
//                                         if (e.dataTransfer.files[0]) {
//                                             handleFileUpload({ target: { files: e.dataTransfer.files } });
//                                         }
//                                     }}
//                                 >
//                                     <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
//                                         <Upload className="w-10 h-10 text-cyan-400" />
//                                     </div>
//
//                                     <div className="space-y-3">
//                                         <h3 className="text-xl font-semibold text-white">
//                                             {uploadedFile ? '文件已选择' : '拖放文件到此处'}
//                                         </h3>
//
//                                         {uploadedFile ? (
//                                             <div className="space-y-4">
//                                                 <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4">
//                                                     <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
//                                                     <div className="flex-1 min-w-0">
//                                                         <div className="font-medium text-white truncate">{uploadedFile.name}</div>
//                                                         <div className="text-sm text-gray-400">
//                                                             {(uploadedFile.size / 1024).toFixed(2)} KB
//                                                         </div>
//                                                     </div>
//                                                     <CheckCircle className="w-5 h-5 text-emerald-400" />
//                                                 </div>
//
//                                                 {/* 上传进度 */}
//                                                 {uploadProgress < 100 && (
//                                                     <div className="space-y-2">
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-400">上传中...</span>
//                                                             <span className="text-cyan-400">{uploadProgress}%</span>
//                                                         </div>
//                                                         <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
//                                                             <div
//                                                                 className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
//                                                                 style={{ width: `${uploadProgress}%` }}
//                                                             ></div>
//                                                         </div>
//                                                     </div>
//                                                 )}
//
//                                                 <button
//                                                     onClick={() => fileInputRef.current?.click()}
//                                                     className="w-full px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl font-medium transition-colors"
//                                                 >
//                                                     选择其他文件
//                                                 </button>
//                                             </div>
//                                         ) : (
//                                             <>
//                                                 <p className="text-gray-400">
//                                                     或 <span className="text-cyan-400 font-medium cursor-pointer">点击浏览</span> 选择文件
//                                                 </p>
//                                                 <p className="text-sm text-gray-500">
//                                                     支持 PDF, DOC, DOCX, TXT, PPT 等格式，最大 50MB
//                                                 </p>
//                                             </>
//                                         )}
//                                     </div>
//
//                                     <input
//                                         ref={fileInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleFileUpload}
//                                         accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
//                                     />
//                                 </div>
//
//                                 {/* 手动输入区域 */}
//                                 <div className="mt-8">
//                                     <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                                         <FileText className="w-5 h-5 text-blue-400" />
//                                         <span>或直接输入文本</span>
//                                     </h3>
//                                     <textarea
//                                         className="w-full h-40 bg-gray-800/30 border border-gray-600/30 rounded-xl p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
//                                         placeholder="在此粘贴您的文档内容..."
//                                         value={text}
//                                         onChange={(e) => setText(e.target.value)}
//                                     />
//                                 </div>
//                             </div>
//
//                             {/* 处理按钮 */}
//                             <button
//                                 onClick={handleProcess}
//                                 disabled={isProcessing || (!text.trim() && !uploadedFile)}
//                                 className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
//                                     isProcessing
//                                         ? 'bg-gray-800 cursor-not-allowed'
//                                         : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
//                                 } ${(!text.trim() && !uploadedFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
//                             >
//                                 {isProcessing ? (
//                                     <span className="flex items-center justify-center gap-3">
//                     <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></span>
//                     <span>AI正在处理中...</span>
//                   </span>
//                                 ) : (
//                                     <span className="flex items-center justify-center gap-3">
//                     <Zap className="w-5 h-5" />
//                     <span>生成智能摘要</span>
//                   </span>
//                                 )}
//                             </button>
//
//                             {/* 步骤说明 */}
//                             <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
//                                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
//                                     <span className="text-cyan-400">📋</span> 三步完成文档摘要
//                                 </h3>
//                                 <div className="space-y-4">
//                                     <StepCard
//                                         number={1}
//                                         title="上传文档"
//                                         description="支持多种格式，拖拽上传或直接输入文本"
//                                         icon={Upload}
//                                         color="bg-gradient-to-r from-cyan-500 to-cyan-600"
//                                     />
//                                     <StepCard
//                                         number={2}
//                                         title="AI智能分析"
//                                         description="使用先进的NLP技术提取关键信息"
//                                         icon={Zap}
//                                         color="bg-gradient-to-r from-blue-500 to-blue-600"
//                                     />
//                                     <StepCard
//                                         number={3}
//                                         title="获取摘要"
//                                         description="生成精准、简洁的文档摘要"
//                                         icon={FileText}
//                                         color="bg-gradient-to-r from-purple-500 to-purple-600"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* 右侧：摘要结果区域 */}
//                         <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
//                             <div className="flex items-center justify-between mb-8">
//                                 <div>
//                                     <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
//                                         <span className="text-emerald-400">✨</span>
//                                         <span>智能摘要结果</span>
//                                     </h2>
//                                     <p className="text-gray-400">AI生成的文档核心内容摘要</p>
//                                 </div>
//                                 <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
//                                     <Clock className="w-4 h-4 text-emerald-400" />
//                                     <span className="text-sm text-emerald-400">{uploadTime}</span>
//                                 </div>
//                             </div>
//
//                             {/* 摘要内容区域 */}
//                             <div className="min-h-[400px] bg-gradient-to-b from-gray-900/30 to-gray-900/10 border border-gray-700/30 rounded-xl p-6">
//                                 {isProcessing ? (
//                                     <div className="h-full flex flex-col items-center justify-center">
//                                         <div className="relative mb-8">
//                                             <div className="w-32 h-32 rounded-full border-4 border-gray-700 border-t-cyan-500 animate-spin"></div>
//                                             <div className="absolute inset-0 flex items-center justify-center">
//                                                 <Zap className="w-12 h-12 text-cyan-400 animate-pulse" />
//                                             </div>
//                                         </div>
//                                         <div className="text-center">
//                                             <h3 className="text-xl font-semibold text-white mb-2">AI正在分析文档</h3>
//                                             <p className="text-gray-400">正在提取关键信息并生成摘要...</p>
//                                             <div className="mt-4 flex items-center justify-center gap-2">
//                                                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
//                                                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                                                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ) : summary ? (
//                                     <div className="space-y-6">
//                                         <div className="prose prose-invert max-w-none">
//                                             <div className="text-lg leading-relaxed text-gray-200 whitespace-pre-wrap">
//                                                 {summary}
//                                             </div>
//                                         </div>
//
//                                         <div className="pt-6 border-t border-gray-700/50">
//                                             <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//                                                 <Shield className="w-5 h-5 text-cyan-400" />
//                                                 关键信息提取
//                                             </h4>
//                                             <div className="flex flex-wrap gap-3">
//                                                 {summary.split(/[.,!?;:]/).filter(word => word.trim().length > 2).slice(0, 8).map((word, i) => (
//                                                     <span
//                                                         key={i}
//                                                         className="px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg text-sm text-cyan-300 border border-gray-700/50"
//                                                     >
//                             {word.trim()}
//                           </span>
//                                                 ))}
//                                             </div>
//                                         </div>
//
//                                         <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-700/50">
//                                             <div className="text-center">
//                                                 <div className="text-2xl font-bold text-white mb-1">
//                                                     {summary.split(' ').length}
//                                                 </div>
//                                                 <div className="text-sm text-gray-400">摘要词数</div>
//                                             </div>
//                                             <div className="text-center">
//                                                 <div className="text-2xl font-bold text-white mb-1">
//                                                     {Math.round((summary.length / (text.length || 1)) * 100)}%
//                                                 </div>
//                                                 <div className="text-sm text-gray-400">内容精简率</div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="h-full flex flex-col items-center justify-center text-gray-500">
//                                         <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-gray-800/30 to-gray-900/30 flex items-center justify-center">
//                                             <FileText className="w-12 h-12 text-gray-600" />
//                                         </div>
//                                         <h3 className="text-xl font-semibold text-gray-400 mb-3">等待生成摘要</h3>
//                                         <p className="text-gray-600 text-center max-w-sm">
//                                             上传您的文档或输入文本，AI将为您分析并提取核心内容
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//
//                             {/* 操作按钮 */}
//                             {summary && (
//                                 <div className="mt-8 flex gap-3">
//                                     <button className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-medium transition-all border border-gray-700/50">
//                                         复制摘要
//                                     </button>
//                                     <button className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-xl font-medium transition-all border border-cyan-500/20 text-cyan-300">
//                                         导出为文档
//                                     </button>
//                                     <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 rounded-xl font-medium transition-all border border-purple-500/20 text-purple-300">
//                                         重新生成
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//
//                     {/* 特性展示 */}
//                     <div className="grid md:grid-cols-3 gap-6 mt-16">
//                         {[
//                             {
//                                 icon: '⚡',
//                                 title: '闪电速度',
//                                 description: '平均处理时间仅需2.4秒，无需漫长等待',
//                                 color: 'from-cyan-500/20 to-cyan-600/20'
//                             },
//                             {
//                                 icon: '🔒',
//                                 title: '隐私保护',
//                                 description: '您的文档数据在处理完成后自动删除',
//                                 color: 'from-blue-500/20 to-blue-600/20'
//                             },
//                             {
//                                 icon: '🌐',
//                                 title: '多语言支持',
//                                 description: '支持中文、英文、日文等多种语言处理',
//                                 color: 'from-purple-500/20 to-purple-600/20'
//                             }
//                         ].map((feature, index) => (
//                             <div
//                                 key={index}
//                                 className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30`}
//                             >
//                                 <div className="text-3xl mb-4">{feature.icon}</div>
//                                 <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
//                                 <p className="text-gray-300">{feature.description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </main>
//
//                 {/* 页脚 */}
//                 <footer className="mt-20 pt-8 border-t border-gray-800/50 text-center text-gray-500 text-sm">
//                     <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//                         <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
//                                 <Zap className="w-4 h-4 text-white" />
//                             </div>
//                             <span className="text-white font-medium">DocSummAI</span>
//                         </div>
//                         <p>© 2024 DocSummAI. 保留所有权利。版本 2.1.0</p>
//                         <p className="text-cyan-300">🚀 基于GPT-4技术 | 企业级安全 | 实时处理</p>
//                     </div>
//                 </footer>
//             </div>
//
//             {/* 注入动画样式 */}
//             <style jsx>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.1; }
//           25% { transform: translateY(-20px) translateX(10px) rotate(5deg); opacity: 0.2; }
//           50% { transform: translateY(-10px) translateX(-10px) rotate(-5deg); opacity: 0.15; }
//           75% { transform: translateY(10px) translateX(5px) rotate(3deg); opacity: 0.2; }
//         }
//
//         .bg-grid {
//           background-size: 50px 50px;
//           background-image:
//             linear-gradient(to right, rgba(14, 165, 233, 0.1) 1px, transparent 1px),
//             linear-gradient(to bottom, rgba(14, 165, 233, 0.1) 1px, transparent 1px);
//         }
//
//         .glow-effect {
//           box-shadow: 0 0 40px rgba(59, 130, 246, 0.3),
//                       0 0 80px rgba(59, 130, 246, 0.2),
//                       0 0 120px rgba(59, 130, 246, 0.1);
//         }
//       `}</style>
//         </div>
//     );
// }
//
// export default App;
import { useState, useEffect } from 'react';
import {
    FileText, Cpu, Layers, Brain, User,
    Upload, Zap, Shield, Globe, Settings,
    ChevronRight, CheckCircle, Lock, Sparkles,
    Code, Database, GitBranch, BookOpen,
    BarChart, Target, Languages, Palette
} from 'lucide-react';
import './App.css';

function App() {
    // 状态管理
    const [currentModule, setCurrentModule] = useState('home'); // home, parse, understand, summary, knowledge, customize
    const [activeSubModule, setActiveSubModule] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    // 模块数据
    const modules = [
        {
            id: 'parse',
            name: '多格式文档解析',
            icon: FileText,
            color: 'from-cyan-500 to-blue-500',
            description: '支持多种技术文档格式解析',
            subModules: [
                { name: 'Markdown/LaTeX解析', icon: Code },
                { name: 'Word/PDF解析', icon: FileText },
                { name: '代码文件解析', icon: Code },
                { name: '版本控制集成', icon: GitBranch },
                { name: 'API文档解析', icon: Database },
                { name: '数据库文档解析', icon: Database }
            ]
        },
        {
            id: 'understand',
            name: '智能文档理解',
            icon: Cpu,
            color: 'from-blue-500 to-purple-500',
            description: '深度理解文档结构与内容',
            subModules: [
                { name: '文档结构分析', icon: Layers },
                { name: '技术术语识别', icon: Target },
                { name: '代码-文档关联', icon: Code },
                { name: '文档质量评估', icon: BarChart },
                { name: '关键信息提取', icon: Sparkles }
            ]
        },
        {
            id: 'summary',
            name: '多粒度摘要生成',
            icon: Layers,
            color: 'from-purple-500 to-pink-500',
            description: '多层次内容摘要提取',
            subModules: [
                { name: '文档级摘要', icon: FileText },
                { name: '章节级摘要', icon: Layers },
                { name: '段落级摘要', icon: BookOpen },
                { name: '代码级摘要', icon: Code },
                { name: '对话式摘要', icon: Sparkles }
            ]
        },
        {
            id: 'knowledge',
            name: '领域知识增强',
            icon: Brain,
            color: 'from-pink-500 to-red-500',
            description: '专业知识库集成',
            subModules: [
                { name: '软件工程知识库', icon: Code },
                { name: '技术栈知识库', icon: Database },
                { name: '行业标准库', icon: Shield },
                { name: '项目上下文理解', icon: Brain }
            ]
        },
        {
            id: 'customize',
            name: '个性化摘要定制',
            icon: User,
            color: 'from-orange-500 to-yellow-500',
            description: '定制化摘要生成',
            subModules: [
                { name: '用户角色识别', icon: User },
                { name: '阅读偏好学习', icon: Brain },
                { name: '摘要风格控制', icon: Palette },
                { name: '多语言支持', icon: Languages },
                { name: '摘要格式定制', icon: Settings }
            ]
        }
    ];

    // 处理文件上传
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadedFile(file);
        // 模拟处理过程
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
        }, 1500);
    };

    // 根据当前模块渲染内容
    const renderModuleContent = () => {
        const module = modules.find(m => m.id === currentModule);

        if (currentModule === 'home') {
            return (
                <div className="space-y-12">
                    {/* 欢迎区域 */}
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            DocSummAI Pro
                        </h1>
                        <p className="text-2xl text-gray-300 mb-8">
                            专业级文档智能摘要平台
                        </p>
                        <p className="text-gray-400 max-w-3xl mx-auto">
                            融合五大核心模块，提供从文档解析到个性化摘要的全流程解决方案
                        </p>
                    </div>

                    {/* 快速开始 */}
                    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-cyan-400" />
                            <span>快速开始</span>
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-cyan-500/30 transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">上传文档</h3>
                                <p className="text-gray-400 text-sm mb-4">支持多种格式，拖拽上传</p>
                                <button
                                    onClick={() => document.getElementById('fileInput')?.click()}
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg transition-all"
                                >
                                    选择文件
                                </button>
                            </div>

                            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">智能分析</h3>
                                <p className="text-gray-400 text-sm mb-4">AI深度理解文档内容</p>
                                <button className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-all">
                                    开始分析
                                </button>
                            </div>

                            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-emerald-500/30 transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">获取摘要</h3>
                                <p className="text-gray-400 text-sm mb-4">精准提取核心内容</p>
                                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-lg transition-all">
                                    生成摘要
                                </button>
                            </div>
                        </div>

                        <input
                            id="fileInput"
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt,.md,.tex,.json,.yaml"
                        />
                    </div>

                    {/* 统计数据 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: '支持格式', value: '20+', icon: FileText, color: 'text-cyan-400' },
                            { label: '处理速度', value: '2.4s', icon: Zap, color: 'text-blue-400' },
                            { label: '识别准确率', value: '98.7%', icon: CheckCircle, color: 'text-emerald-400' },
                            { label: '知识库条目', value: '50K+', icon: Database, color: 'text-purple-400' }
                        ].map((stat, index) => (
                            <div key={index} className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                </div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 模块内容页面
        return (
            <div className="space-y-8">
                {/* 模块标题 */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${module.color} bg-opacity-20`}>
                                <module.icon className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">{module.name}</h1>
                        </div>
                        <p className="text-gray-400">{module.description}</p>
                    </div>
                    <button
                        onClick={() => setCurrentModule('home')}
                        className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        返回首页
                    </button>
                </div>

                {/* 子模块导航 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {module.subModules.map((sub, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSubModule(sub)}
                            className={`p-6 rounded-xl text-left transition-all ${
                                activeSubModule?.name === sub.name
                                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-lg'
                                    : 'bg-gray-900/40 hover:bg-gray-800/40 border border-gray-700/30'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-gray-800/50">
                                    <sub.icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-white">{sub.name}</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                点击进入{module.name}的{sub.name}功能
                            </p>
                        </button>
                    ))}
                </div>

                {/* 子模块内容区域 */}
                {activeSubModule && (
                    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900">
                                    <activeSubModule.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{activeSubModule.name}</h2>
                                    <p className="text-gray-400">{module.name}的核心功能之一</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveSubModule(null)}
                                className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                关闭
                            </button>
                        </div>

                        {/* 动态内容 */}
                        <div className="space-y-6">
                            {/* 示例：根据子模块显示不同内容 */}
                            {activeSubModule.name.includes('解析') && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white">文档解析示例</h3>
                                        <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                      <pre className="text-gray-300">
{`# 技术文档示例
## 功能说明
- 智能解析多种格式
- 提取结构化数据
- 支持代码片段分析

function processDocument(doc) {
  // AI解析逻辑
  return summary;
}`}</pre>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white">上传文件</h3>
                                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors">
                                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                            <p className="text-gray-400 mb-4">拖拽文件到此处或点击上传</p>
                                            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg">
                                                选择文件
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSubModule.name.includes('分析') && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white">智能分析结果</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400 mb-2">文档结构</div>
                                            <div className="text-lg font-semibold text-white">层次清晰</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400 mb-2">关键术语</div>
                                            <div className="text-lg font-semibold text-white">12个</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400 mb-2">质量评分</div>
                                            <div className="text-lg font-semibold text-emerald-400">92/100</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSubModule.name.includes('摘要') && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">摘要生成配置</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="block text-sm font-medium text-gray-300">摘要长度</label>
                                            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                                                <option>简洁 (50-100字)</option>
                                                <option>标准 (100-200字)</option>
                                                <option>详细 (200-300字)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-sm font-medium text-gray-300">摘要风格</label>
                                            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                                                <option>技术性</option>
                                                <option>通俗易懂</option>
                                                <option>专业报告</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 通用操作按钮 */}
                            <div className="flex gap-4 pt-6 border-t border-gray-700/50">
                                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-semibold transition-all">
                                    开始处理
                                </button>
                                <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                                    查看示例
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // 创建科技感背景元素
    const BackgroundGrid = () => {
        const techWords = [
            "AI解析", "智能摘要", "文档理解", "知识增强",
            "多格式", "自动化", "定制化", "专业级"
        ];

        return (
            <div className="fixed inset-0 z-0 overflow-hidden">
                {/* 网格背景 */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px),
                            linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>

                {/* 浮动科技词汇 */}
                {techWords.map((word, index) => {
                    const colors = ['text-cyan-400', 'text-blue-400', 'text-purple-400'];
                    const colorClass = colors[index % colors.length];
                    const left = Math.random() * 90 + 5;
                    const top = Math.random() * 90 + 5;
                    const duration = Math.random() * 20 + 20;

                    return (
                        <div
                            key={index}
                            className={`absolute opacity-10 hover:opacity-20 transition-opacity duration-300 ${colorClass} font-mono font-bold`}
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                fontSize: '14px',
                                animation: `float ${duration}s linear infinite`
                            }}
                        >
                            {word}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            <BackgroundGrid />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* 顶部导航 */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">DocSummAI</h1>
                            <p className="text-xs text-gray-400">专业文档智能平台</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentModule === 'home' ? (
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                                <Shield className="w-4 h-4" />
                                <span>企业级安全</span>
                                <Globe className="w-4 h-4 ml-4" />
                                <span>多语言支持</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setCurrentModule('home')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                返回首页
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 左侧模块导航 */}
                    <div className={`lg:w-64 ${currentModule !== 'home' ? 'hidden lg:block' : ''}`}>
                        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-cyan-400" />
                                核心模块
                            </h2>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setCurrentModule('home')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                        currentModule === 'home'
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                                            : 'hover:bg-gray-800/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5" />
                                        <span className="font-medium">欢迎主页</span>
                                    </div>
                                </button>

                                {modules.map((module) => (
                                    <button
                                        key={module.id}
                                        onClick={() => {
                                            setCurrentModule(module.id);
                                            setActiveSubModule(null);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                            currentModule === module.id
                                                ? `bg-gradient-to-r ${module.color} bg-opacity-20 border ${module.color.split(' ')[0].replace('from-', 'border-')}/30`
                                                : 'hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <module.icon className="w-5 h-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">{module.name}</div>
                                                <div className="text-xs text-gray-400 mt-1">{module.description}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* 当前状态 */}
                            <div className="mt-8 pt-6 border-t border-gray-700/50">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">处理状态</h3>
                                <div className="space-y-3">
                                    {uploadedFile && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">已上传文件</span>
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    )}
                                    {isProcessing && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">处理中...</span>
                                            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 系统特性 */}
                        <div className="mt-4 bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                            <div className="space-y-3">
                                {[
                                    { icon: Lock, text: '数据加密存储', color: 'text-cyan-400' },
                                    { icon: Zap, text: '快速处理', color: 'text-blue-400' },
                                    { icon: Globe, text: '多语言支持', color: 'text-purple-400' }
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm">
                                        <feature.icon className={`w-4 h-4 ${feature.color}`} />
                                        <span className="text-gray-300">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右侧内容区域 */}
                    <div className="flex-1">
                        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
                            {renderModuleContent()}
                        </div>

                        {/* 页脚 */}
                        <footer className="mt-8 text-center text-gray-500 text-sm">
                            <p>© 2024 DocSummAI Pro. 专业文档智能处理平台 | 版本 3.0.0</p>
                            <p className="mt-2">融合五大核心模块，提供全面的文档智能解决方案</p>
                        </footer>
                    </div>
                </div>
            </div>

            {/* 注入动画样式 */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.2; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.5); }
        }
        
        .gradient-border {
          border: 2px solid transparent;
          background: linear-gradient(black, black) padding-box,
                    linear-gradient(45deg, #06b6d4, #3b82f6) border-box;
        }
      `}</style>
        </div>
    );
}

export default App;