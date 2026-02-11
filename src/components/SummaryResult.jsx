export default function SummaryResult({ summary }) {
    if (!summary) return null;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">摘要结果</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold">文档级摘要：</h3>
                    <p>{summary.docLevel || '暂无内容'}</p>
                </div>
                <div>
                    <h3 className="font-semibold">章节级摘要：</h3>
                    <p>{summary.chapterLevel || '暂无内容'}</p>
                </div>
                <div>
                    <h3 className="font-semibold">段落级摘要：</h3>
                    <p>{summary.paragraphLevel || '暂无内容'}</p>
                </div>
            </div>
        </div>
    );
}