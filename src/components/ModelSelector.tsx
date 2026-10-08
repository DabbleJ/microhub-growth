import { useWorkspace } from '@/lib/workspace';
import { scottState, scottLabel } from '@/lib/scottModel';
export default function ModelSelector() {
  const { active,setData }=useWorkspace();
  return <label className="block text-xs font-semibold">Model used for projections<select aria-label="Model used for projections" value={active.model??'annual'} className="form-select mt-2 w-full" onChange={e=>{const model=e.target.value as 'annual'|'scott';setData(w=>({...w,scenarios:w.scenarios.map(s=>s.id===active.id?{...s,model,...(model==='scott'?{scott:scottState(s)}:{})}:s)}));}}><option value="annual">App annual planning engine</option><option value="scott">{scottLabel}</option><option value="laci" disabled>LACI · ARCHINNOVO — editable model unavailable</option></select><span className="mt-2 block text-[11px] font-normal text-muted-foreground">Each model retains its own inputs. Switching does not overwrite either set. Scott starts with the CSV baseline, not the app’s site assumptions.</span></label>;
}
