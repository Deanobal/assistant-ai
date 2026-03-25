import React, { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getSearchableLeadResults } from '@/lib/smsMatching';

export default function SearchableLeadLookup({ leads, selectedLeadId, onSelect, suggestedLeadIds = [] }) {
  const [query, setQuery] = useState('');

  const orderedLeads = useMemo(() => {
    const suggestionSet = new Set(suggestedLeadIds);
    return [...leads].sort((a, b) => {
      const aSuggested = suggestionSet.has(a.id) ? 1 : 0;
      const bSuggested = suggestionSet.has(b.id) ? 1 : 0;
      return bSuggested - aSuggested;
    });
  }, [leads, suggestedLeadIds]);

  const results = useMemo(() => getSearchableLeadResults(orderedLeads, query), [orderedLeads, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search leads by name, business, email, or mobile"
          className="bg-[#0f0f17] border-white/10 text-white pl-10"
        />
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] divide-y divide-white/5 max-h-64 overflow-y-auto">
        {results.length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-400">No leads found for this search.</div>
        ) : results.map((lead) => {
          const isSelected = lead.id === selectedLeadId;
          return (
            <button
              key={lead.id}
              type="button"
              onClick={() => onSelect(lead.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-white/[0.04]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{lead.business_name || lead.full_name || 'Unnamed lead'}</p>
                  <p className="text-xs text-gray-400 truncate">{lead.full_name || 'No contact name'}{lead.email ? ` • ${lead.email}` : ''}</p>
                  <p className="text-xs text-gray-500 truncate">{lead.mobile_number || 'No mobile'}{lead.last_activity_at ? ` • active ${new Date(lead.last_activity_at).toLocaleDateString()}` : ''}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}