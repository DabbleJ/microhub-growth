import { Link } from 'react-router-dom';
import { FileCheck2, ArrowUpRight } from 'lucide-react';
import { useWorkspace } from '@/lib/workspace';
import { sourceLabel } from '@/lib/sourceReferences';
import { liveEngineLabel } from '@/lib/modelSources';
export default function SourceNotice() {
  const { active } = useWorkspace();
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3"><div className="flex items-start gap-2"><FileCheck2 size={16} className="mt-0.5 shrink-0 text-amber-800" /><div><p className="text-[11px] font-semibold text-amber-950">Calculations: {liveEngineLabel} · scenario: {active.name}</p><p className="mt-1 text-[10px] leading-relaxed text-amber-900">Not Scott’s Expansion Model-2026-v1 or the LACI ARCHINNOVO model. Inputs come from app defaults, explicit site copies and local edits—not a live spreadsheet feed.</p><p className="mt-1 text-[10px] leading-relaxed text-amber-900">{sourceLabel}. Current purchase / launch input: {String(active.inputs.startDate)}. Seattle holistic PDF assumes equipment by Jun 2027 and launch Jul 2027; source EBITDA and net funding are not reconciled to app outputs.</p></div></div><Link to="/sources" className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800">Models, sources & differences <ArrowUpRight size={13} /></Link></div>;
}
