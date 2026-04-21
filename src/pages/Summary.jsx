import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Upload, FileText, Loader2, CheckCircle, Download, XCircle, Sparkles } from 'lucide-react';
import { API_BASE } from '../utils/api';

const fallbackCapabilities = { groups: [ { id: 'high_frequency', title: '高频刚需', description: '直接放最前面，优先满足最常用场景', items: [ { id: 'word_to_pdf', label: 'Word → PDF', description: '最常用的正式导出能力', featured: true, target_options: [{ value: 'pdf', label: 'PDF' }], source_formats: ['doc', 'docx'] }, { id: 'pdf_to_editable', label: 'PDF → 可编辑格式', description: '上传 PDF 后再选择输出格式', featured: false, target_options: [{ value: 'txt', label: 'TXT' }, { value: 'md', label: 'Markdown' }], source_formats: ['pdf'] } ] }, { id: 'secondary', title: '次常用场景', description: '内容二次编辑与发布导出', items: [ { id: 'word_to_markup', label: 'Word → Markdown / HTML', description: '适合提取正文内容做二次编辑与发布', featured: false, target_options: [{ value: 'md', label: 'Markdown' }, { value: 'html', label: 'HTML' }], source_formats: ['doc', 'docx'] }, { id: 'markdown_exports', label: 'Markdown → HTML / PDF / Word', description: '适合内容发布、正式导出与回写 Word', featured: false, target_options: [{ value: 'html', label: 'HTML' }, { value: 'pdf', label: 'PDF' }, { value: 'docx', label: 'Word' }], source_formats: ['md'] } ] } ] };

const Summary = () => {
  const [capabilities, setCapabilities] = useState(fallbackCapabilities);
  const [activeActionId, setActiveActionId] = useState('word_to_pdf');
  const [selectedTarget, setSelectedTarget] = useState('pdf');
  const [conversionFile, setConversionFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('token_type') || 'Bearer';
        const res = await fetch(`${API_BASE}/api/convert/capabilities`, { credentials: 'include', headers: token ? { Authorization: `${tokenType} ${token}` } : {} });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.capabilities?.groups?.length) setCapabilities(data.capabilities);
      } catch (error) {
        console.error('加载转换能力失败:', error);
      }
    };
    loadCapabilities();
  }, []);

  const allActions = useMemo(() => capabilities.groups.flatMap((group) => group.items || []), [capabilities]);
  const currentAction = useMemo(() => allActions.find((item) => item.id === activeActionId) || allActions[0], [allActions, activeActionId]);

  useEffect(() => {
    if (!currentAction) return;
    const allowed = currentAction.target_options?.map((item) => item.value) || [];
    if (!allowed.includes(selectedTarget)) setSelectedTarget(allowed[0] || 'pdf');
  }, [currentAction, selectedTarget]);

  const currentAccept = useMemo(() => {
    if (!currentAction) return '*';
    if (currentAction.source_formats.includes('pdf')) return '.pdf';
    if (currentAction.source_formats.includes('md')) return '.md';
    if (currentAction.source_formats.includes('doc') || currentAction.source_formats.includes('docx')) return '.doc,.docx';
    return '*';
  }, [currentAction]);

  const currentSourceLabel = useMemo(() => {
    if (!currentAction) return '文档';
    if (currentAction.id === 'word_to_pdf' || currentAction.id === 'word_to_markup') return 'Word';
    if (currentAction.id === 'pdf_to_editable') return 'PDF';
    if (currentAction.id === 'markdown_exports') return 'Markdown';
    return '文档';
  }, [currentAction]);

  const currentTargetLabel = useMemo(() => currentAction?.target_options?.find((item) => item.value === selectedTarget)?.label || selectedTarget.toUpperCase(), [currentAction, selectedTarget]);

  const handleActionSelect = (action) => { setActiveActionId(action.id); setConversionFile(null); setConversionMessage(''); setDownloadUrl(''); setSelectedTarget(action.target_options?.[0]?.value || 'pdf'); };
  const handleFileChange = (e) => { const file = e.target.files?.[0]; if (!file) return; setConversionFile(file); setConversionMessage(''); setDownloadUrl(''); };

  const handleConversion = async () => {
    if (!conversionFile) { setConversionMessage('请先上传文件'); return; }
    setIsConverting(true); setConversionMessage('正在转换...'); setDownloadUrl('');
    try {
      const formData = new FormData();
      formData.append('file', conversionFile);
      formData.append('target_format', selectedTarget);
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('token_type') || 'Bearer';
      const res = await fetch(`${API_BASE}/api/convert/upload`, { method: 'POST', body: formData, credentials: 'include', headers: token ? { Authorization: `${tokenType} ${token}` } : {} });
      const text = await res.text();
      if (!text) { setConversionMessage(`转换失败：服务器无响应 (${res.status})`); return; }
      let data; try { data = JSON.parse(text); } catch { setConversionMessage(`转换失败：响应格式错误 (${res.status})`); return; }
      if (res.status === 401) { setConversionMessage('转换失败：未登录，请先登录'); return; }
      if (res.ok && data.success) { setConversionMessage('转换成功！'); setDownloadUrl(data.download_url?.startsWith('http') ? data.download_url : `${API_BASE}${data.download_url}`); }
      else { setConversionMessage(data.detail || data.error || '转换失败，请检查文件格式或服务器状态'); }
    } catch (err) {
      setConversionMessage(`转换失败：${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => { if (downloadUrl) window.open(downloadUrl, '_blank'); };

  const renderActionCard = (action, featured = false) => {
    const isActive = action.id === activeActionId;
    const base = featured ? (isActive ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/10' : 'border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 hover:border-purple-400') : (isActive ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-600');
    return <button key={action.id} onClick={() => handleActionSelect(action)} className={`text-left rounded-2xl border-2 p-5 transition-all ${base}`}><div className="flex items-start justify-between gap-3"><div><div className={`font-semibold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{action.label}</div><p className="text-sm mt-2 text-gray-600 dark:text-gray-400">{action.description}</p></div>{featured && <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />}</div><div className="mt-4 flex flex-wrap gap-2">{action.target_options?.map((option) => <span key={option.value} className="px-2.5 py-1 rounded-full text-xs bg-white/70 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{option.label}</span>)}</div></button>;
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8"><h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">格式转换工具</h1><p className="text-gray-500 dark:text-gray-400 mt-2">按高频与次常用场景组织，减少按钮堆叠，提升转换效率</p></div>
      <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-8 border-2 border-primary-500 shadow-sm space-y-8">
        {capabilities.groups.map((group) => <section key={group.id} className="space-y-4"><div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.title}</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</p></div><div className="grid gap-4 md:grid-cols-2">{group.items.map((action) => renderActionCard(action, group.id === 'high_frequency' && action.featured))}</div></section>)}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-950/30 p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap"><div><h3 className="text-xl font-semibold text-gray-900 dark:text-white">当前转换</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentSourceLabel} <ArrowRight className="inline w-4 h-4 mx-1" /> {currentTargetLabel}</p></div>{currentAction?.target_options?.length > 1 && <div className="min-w-[220px]"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择输出格式</label><select value={selectedTarget} onChange={(e) => { setSelectedTarget(e.target.value); setConversionMessage(''); setDownloadUrl(''); }} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{currentAction.target_options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>}</div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 bg-white/70 dark:bg-transparent"><Upload className="w-12 h-12 text-purple-500 mb-4" /><h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">上传要转换的文件</h3><p className="text-gray-500 dark:text-gray-400 text-sm mb-6">支持的源文件：{currentAccept.replaceAll('.', '').toUpperCase().replaceAll(',', ' / ')}</p><input id="conversionFile" type="file" className="hidden" onChange={handleFileChange} accept={currentAccept} /><button onClick={() => document.getElementById('conversionFile')?.click()} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition text-white font-medium">选择文件</button></div>
          {conversionFile && <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap"><div className="flex items-center gap-3 min-w-0"><FileText className="w-5 h-5 text-purple-500 shrink-0" /><div className="min-w-0"><div className="font-medium text-gray-800 dark:text-gray-200 truncate">{conversionFile.name}</div><div className="text-xs text-gray-500 dark:text-gray-400">{(conversionFile.size / 1024).toFixed(1)} KB</div></div></div><button onClick={handleConversion} disabled={isConverting} className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition text-white text-sm font-medium disabled:opacity-50">{isConverting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />转换中...</span> : '开始转换'}</button></div>}
          {conversionMessage && <div className={`p-4 rounded-lg text-center ${conversionMessage.includes('成功') ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>{conversionMessage.includes('成功') ? <CheckCircle className="w-5 h-5 inline mr-2" /> : <XCircle className="w-5 h-5 inline mr-2" />}{conversionMessage}</div>}
          {downloadUrl && <div className="flex justify-center"><button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-white font-medium transition"><Download className="w-5 h-5" />下载转换文件</button></div>}
        </div>
        <div className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"><p className="font-medium mb-2 text-gray-700 dark:text-gray-300">当前支持说明：</p><ul className="space-y-1"><li>• 第一行优先提供高频刚需：Word → PDF、PDF → 可编辑格式</li><li>• PDF → 可编辑格式当前稳定支持导出为 TXT / Markdown</li><li>• 第二行保留次常用场景：Word → Markdown / HTML、Markdown → HTML / PDF / Word</li><li>• 不稳定组合不再单独暴露，避免用户误点</li></ul></div>
      </div>
    </div>
  );
};

export default Summary;
