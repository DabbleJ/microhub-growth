import { Link } from 'react-router-dom';
import { Calculator, SlidersHorizontal, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel, Kpis } from '@/components/Financials';
import { useWorkspace } from '@/lib/workspace';
import { fields } from '@/lib/defaults';
import { liveEngineLabel } from '@/lib/modelSources';

export default function SourceReview() {
  const { active } = useWorkspace();
  const pending = fields.filter(field => field.validation || active.metadata[field.key].validation).length;
  return <div className="space-y-6">
    <div><div className="eyebrow">Model & assumptions</div><h1 className="mt-2">The model behind your projections.</h1><p className="mt-2 text-sm text-muted-foreground">Choose the calculation model, then review the assumptions for your scenario.</p></div>
    <Panel className="p-6"><div className="grid gap-6 md:grid-cols-[1.2fr_1fr]"><div><div className="flex items-center gap-2 text-teal-800"><Calculator size={20} /><h2>Selected model</h2></div><label htmlFor="calculation-model" className="mt-5 block text-xs font-semibold">Model used for numbers and projections</label><select id="calculation-model" value="annual" className="form-select mt-2 w-full" onChange={() => {}}><option value="annual">{liveEngineLabel}</option><option value="scott" disabled>Scott’s Model · Expansion Model-2026-v1 — workbook required</option><option value="laci" disabled>LACI Model · ARCHINNOVO Site Analysis — workbook required</option></select><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Scott’s and LACI’s editable models will become selectable after their workbooks are supplied and implemented. Your current calculations are unchanged.</p></div>
    <div className="rounded-2xl bg-teal-50 p-5"><p className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">Active scenario</p><h2 className="mt-2">{active.name}</h2><p className="mt-3 text-xs text-muted-foreground">{pending} of {fields.length} inputs need validation.</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Review values, edit assumptions, and mark eligible inputs as validated. Changes save to this scenario and update its projections.</p><Button asChild className="mt-4 gap-2 rounded-xl text-xs"><Link to="/assumptions"><SlidersHorizontal size={14} />Review & edit assumptions</Link></Button></div></div></Panel>
    <Kpis inputs={active.inputs} />
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" className="rounded-xl text-xs" asChild><Link to="/model">Open detailed projections</Link></Button><Link to="/project-notes" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-teal-800"><FileText size={14} />Project scope, source register & notes</Link></div>
  </div>;
}
