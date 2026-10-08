import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/Financials';
import { useWorkspace, download } from '@/lib/workspace';
import { scottFields, scottState, scottLabel } from '@/lib/scottModel';
import type { Metadata } from '@/lib/defaults';

export default function ScottAssumptions() {
  const { active, setData } = useWorkspace();
  const state = scottState(active);
  const [group,setGroup] = useState('Operating revenue');
  const groups = [...new Set(scottFields.map(f => f.group))];
  function edit(key: string, value?: number, meta?: Partial<Metadata>) {
    setData(w => ({ ...w,scenarios: w.scenarios.map(s => {
      if(s.id !== active.id) return s;
      const current = scottState(s);
      return { ...s, scott: { inputs: value === undefined ? current.inputs : { ...current.inputs,[key]:value }, metadata: { ...current.metadata,[key]: { ...current.metadata[key],...(value === undefined ? {} : { validation:true }),...meta } } } };
    }) }));
  }
  function exportCsv() {
    const escape = (value: unknown) => { const text=String(value); return `"${(/^[=+\-@\t\r]/.test(text)?"'":'')+text.replace(/"/g,'""')}"`; };
    const rows=[['Model','Scenario','Group','Input','Value','Unit','Source','Confidence','Needs validation'],...scottFields.map(f => [scottLabel,active.name,f.group,f.label,state.inputs[f.key],f.unit,state.metadata[f.key].source,state.metadata[f.key].confidence,state.metadata[f.key].validation])];
    download('scott-model-assumptions.csv',rows.map(row => row.map(escape).join(',')).join('\r\n'),'text/csv;charset=utf-8');
  }
  return <Panel className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2>Scott model assumptions</h2><p className="mt-2 text-xs text-muted-foreground">{active.name} · changes save automatically and require revalidation.</p></div><Button variant="outline" className="rounded-xl text-xs" onClick={exportCsv}>Export assumptions CSV</Button></div>
    <div className="flex flex-wrap gap-2 border-y border-border bg-secondary/50 p-3">{groups.map(g => <Button key={g} variant={g===group?'default':'ghost'} size="sm" onClick={() => setGroup(g)} className="rounded-lg text-xs">{g}</Button>)}</div>
    <div className="overflow-x-auto"><table className="data-table min-w-[850px]"><thead><tr><th>Input & value</th><th>Source</th><th>Confidence</th><th>Review</th></tr></thead><tbody>{scottFields.filter(f => f.group===group).map(f => <tr key={f.key}><td><label className="text-xs font-medium">{f.label}<div className="mt-2 flex items-center gap-2"><Input type="number" aria-label={f.label} className="h-9 w-36 rounded-lg" min={0} max={f.max} step="any" value={String(state.inputs[f.key])} onChange={e => {const n=Number(e.target.value);if(Number.isFinite(n)&&n>=0&&n<=(f.max??1e9))edit(f.key,n);}} /><span className="text-[10px] text-muted-foreground">{f.unit}</span></div></label></td><td><Input aria-label={`Source for ${f.label}`} className="min-w-60 rounded-lg text-xs" value={state.metadata[f.key].source} onChange={e=>edit(f.key,undefined,{source:e.target.value,validation:true})} /></td><td><select className="form-select" aria-label={`Confidence for ${f.label}`} value={state.metadata[f.key].confidence} onChange={e=>edit(f.key,undefined,{confidence:e.target.value as Metadata['confidence']})}>{['low','med','high'].map(c=><option key={c}>{c}</option>)}</select></td><td><label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-teal-700" checked={!state.metadata[f.key].validation} onChange={e=>edit(f.key,undefined,{validation:!e.target.checked})} />{state.metadata[f.key].validation?'Confirm input':'Validated'}</label></td></tr>)}</tbody></table></div>
  </Panel>;
}
