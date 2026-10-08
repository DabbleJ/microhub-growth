import { Link } from 'react-router-dom';
import { Calculator, ArrowUpRight } from 'lucide-react';
import { liveEngineLabel } from '@/lib/modelSources';
export default function SourceNotice() {
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3"><p className="inline-flex items-center gap-2 text-[11px] font-medium text-teal-900"><Calculator size={16} />Projection model: <span className="font-semibold">{liveEngineLabel}</span></p><Link to="/sources" className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800">Model & assumptions <ArrowUpRight size={13} /></Link></div>;
}
