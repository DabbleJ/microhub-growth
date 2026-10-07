import { Link } from 'react-router-dom';
import { FileCheck2, ArrowUpRight } from 'lucide-react';
import { useWorkspace } from '@/lib/workspace';
import { sourceLabel } from '@/lib/sourceReferences';
export default function SourceNotice() {
  const { active } = useWorkspace();
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3"><div className="flex items-start gap-2"><FileCheck2 size={16} className="mt-0.5 shrink-0 text-amber-800" /><div><p className="text-[11px] font-semibold text-amber-950">{sourceLabel} · live scenarios not yet workbook-reconciled</p><p className="mt-1 text-[10px] text-amber-900">Current equipment purchase / launch input: {String(active.inputs.startDate)}. Source assumes equipment by Jun 2027 and launch Jul 2027. Annual-model results differ from source EBITDA and net funding.</p></div></div><Link to="/sources" className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800">Review evidence & differences <ArrowUpRight size={13} /></Link></div>;
}
