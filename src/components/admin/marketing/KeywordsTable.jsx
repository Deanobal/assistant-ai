export default function KeywordsTable({ keywords }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Keyword</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Impressions</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Clicks</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Avg Position</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw, idx) => {
              const ctr = kw.impressions > 0 ? ((kw.clicks / kw.impressions) * 100).toFixed(1) : 0;
              return (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.04]">
                  <td className="px-4 py-3 text-white">{kw.keyword}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{kw.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{kw.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{kw.avgPosition.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-cyan-400 font-medium">{ctr}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}