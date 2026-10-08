import ModelSelector from '@/components/ModelSelector';
import ScottFinancials from '@/components/ScottFinancials';
import { scottState, scottFields } from '@/lib/scottModel';
import { Link } from 'react-router-dom';
import { Calculator, SlidersHorizontal, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel, Kpis } from '@/components/Financials';
import { useWorkspace } from '@/lib/workspace';
import { fields } from '@/lib/defaults';

export default function SourceReview() {
  const { active } = useWorkspace();
  const isScott = active.model === 'scott';
  const selectedFields = isScott ? scottFields : fields;
  const meta = isScott ? scottState(active).metadata : active.metadata;
  const pending = selectedFields.filter(field => field.validation || meta[field.key].validation).length;
  return <div className="space-y-6">
    <div><div className="eyebrow">Model & assumptions</div><h1 className="mt-2">The model behind your projections.</h1><p className="mt-2 text-sm text-muted-foreground">Choose the calculation model, then review the assumptions for your scenario.</p></div>
    <Panel className="p-6"><div className="grid gap-6 md:grid-cols-[1.2fr_1fr]"><div><div className="flex items-center gap-2 text-teal-800"><Calculator size={20} /><h2>Selected model</h2></div><div className="mt-5"><ModelSelector /></div><p className="mt-3 text-xs text-muted-foreground">Scott’s reconstruction uses annual CSV cost lines and separate S+U targets; it is not a formula-exact workbook replica.</p></div>
    <div className="rounded-2xl bg-teal-50 p-5"><p className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">Active scenario</p><h2 className="mt-2">{active.name}</h2><p className="mt-3 text-xs text-muted-foreground">{pending} of {selectedFields.length} inputs need validation.</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Review values, edit assumptions, and mark eligible inputs as validated. Changes save to this scenario and update its projections.</p><Button asChild className="mt-4 gap-2 rounded-xl text-xs"><Link to="/assumptions"><SlidersHorizontal size={14} />Review & edit assumptions</Link></Button></div></div></Panel>
    {isScott ? <ScottFinancials scenario={active} /> : <Kpis inputs={active.inputs} />}
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" className="rounded-xl text-xs" asChild><Link to="/model">Open detailed projections</Link></Button><Link to="/project-notes" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-teal-800"><FileText size={14} />Project scope, source register & notes</Link></div>
  </div>;
}
