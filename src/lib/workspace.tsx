import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';
import { fields, initialWorkspace, statuses, type Workspace, type Scenario, type InputValue } from './defaults';
import { toast } from 'sonner';
const inputShape: Record<string, z.ZodTypeAny> = {};
fields.forEach(f => {
  inputShape[f.key] = typeof f.value === 'number' ? z.number().finite().min(0).max(f.max ?? 1e9) : typeof f.value === 'boolean' ? z.boolean() : f.options ? z.string().refine(v => f.options!.includes(v)) : f.unit === 'date' ? z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v))) : z.string().max(2000);
});
const metadata = z.object({ source: z.string(), confidence: z.enum(['low', 'med', 'high']), validation: z.boolean() });
const schema = z.object({
  version: z.literal(1), activeId: z.string(),
  scenarios: z.array(z.object({ id: z.string(), name: z.string().min(1), city: z.string(), siteId: z.string().optional(), inputs: z.object(inputShape), metadata: z.record(metadata) })).min(1).max(500),
  sites: z.array(z.object({ id: z.string(), name: z.string(), city: z.string(), address: z.string(), sf: z.number().finite().min(0), score: z.number().finite().min(0), neighborhood: z.string(), rent: z.number().finite().min(0), partner: z.string(), status: z.string(), notes: z.string() })),
  partners: z.array(z.object({ id: z.string(), org: z.string(), contact: z.string(), role: z.string(), city: z.string(), type: z.string(), status: z.enum(statuses), lastTouch: z.string(), nextStep: z.string(), notes: z.string() })),
}).superRefine((w, ctx) => {
  if (!w.scenarios.some(s => s.id === w.activeId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Active scenario is missing' });
  for (const collection of [w.scenarios, w.sites, w.partners]) if (new Set(collection.map(x => x.id)).size !== collection.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate record IDs' });
  for (const s of w.scenarios) if (fields.some(f => !s.metadata[f.key])) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Assumption metadata missing' });
});
export function parseWorkspace(text: string): Workspace { return schema.parse(JSON.parse(text)) as Workspace; }
const KEY = 'b-line-microhub-v1';
function load() {
  try { const saved = localStorage.getItem(KEY); return saved ? parseWorkspace(saved) : initialWorkspace(); }
  catch { return initialWorkspace(); }
}
const Context = createContext<{ data: Workspace; setData: React.Dispatch<React.SetStateAction<Workspace>>; active: Scenario; updateInput: (key: string, value: InputValue) => void } | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Workspace>(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { toast.error('Browser storage is full or unavailable. Export JSON to keep your work.'); } }, [data]);
  const active = data.scenarios.find(s => s.id === data.activeId)!;
  const updateInput = (key: string, value: InputValue) => setData(w => ({ ...w, scenarios: w.scenarios.map(s => s.id === w.activeId ? { ...s, inputs: { ...s.inputs, [key]: value } } : s) }));
  return <Context.Provider value={{ data, setData, active, updateInput }}>{children}</Context.Provider>;
}
export function useWorkspace() { const ctx = useContext(Context); if (!ctx) throw new Error('Workspace provider missing'); return ctx; }
export function download(name: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
