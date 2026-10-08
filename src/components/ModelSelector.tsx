import { useWorkspace } from '@/lib/workspace';
import { scottState, scottLabel } from '@/lib/scottModel';
import { seattleRent } from '@/lib/seattleRents';
export default function ModelSelector() {
  const { active,setData }=useWorkspace();
  return <label className="block text-xs font-semibold">Model used for projections<select aria-label="Model used for projections" value={active.model??'annual'} className="form-select mt-2 w-full" onChange={e=>{
    const model=e.target.value as 'annual'|'scott';
    setData(w=>({...w,scenarios:w.scenarios.map(s=>{
      if(s.id!==active.id)return s;
      if(model==='annual')return {...s,model};
      const scott=scottState(s);
      const site=w.sites.find(site=>site.id===s.siteId);
      const rate=seattleRent(site??{city:s.city,name:s.name,neighborhood:''});
      if(!s.scott&&rate!==undefined){
        scott.inputs.rentAnnual=rate*Number(scott.inputs.sf);
        scott.metadata.rentAnnual={source:`User-provided Seattle base rent: $${rate}/SF/year × Scott module area (${scott.inputs.sf} SF); NNN/CAM unverified`,confidence:'low',validation:true};
      }
      return {...s,model,scott};
    })}));
  }}><option value="annual">App annual planning engine</option><option value="scott">{scottLabel}</option><option value="laci" disabled>LACI · ARCHINNOVO — editable model unavailable</option></select><span className="mt-2 block text-[11px] font-normal text-muted-foreground">Each model retains its own inputs. Scott starts with the CSV baseline, with Seattle neighborhood base-rent overrides applied at its module area. Switching back preserves your edits.</span></label>;
}
