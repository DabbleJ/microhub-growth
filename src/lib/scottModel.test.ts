import { describe,expect,it } from 'vitest';
import { calculateScott,scottDefaults } from './scottModel';
import { initialWorkspace } from './defaults';
import { parseWorkspace } from './workspace';
import { scottState } from './scottModel';
describe('Scott CSV reconstruction',()=>{
  it('reconciles annual line items and funding',()=>{
    const m=calculateScott(scottDefaults);
    expect(m.revenue).toBe(500000);expect(m.opex).toBe(248250);expect(m.beforeShare).toBe(11750);expect(m.sharing).toBe(2350);expect(m.afterShare).toBe(9400);expect(m.uses).toBe(500000);expect(m.fundingGap).toBe(0);
    expect(m.breakEvenMonthly).toBeCloseTo(8479.16667);expect(m.targetMonthly).toBe(5562.5);
  });
  it('keeps S+U targets independent of operating expenses',()=>{
    const m=calculateScott({...scottDefaults,rentAnnual:200000});
    expect(m.beforeShare).toBe(-98250);expect(m.sharing).toBe(0);expect(m.targets.map(t=>t.profit)).toEqual([35000,38500,42350]);
  });
  it('recalculates edits and funding gaps',()=>{
    const m=calculateScott({...scottDefaults,rentAnnual:45000,grant:0});expect(m.beforeShare).toBe(56750);expect(m.afterShare).toBe(45400);expect(m.fundingGap).toBe(500000);
  });
  it('preserves old workspaces and round-trips Scott selections',()=>{
    const w=initialWorkspace();expect(parseWorkspace(JSON.stringify(w)).scenarios[0].model).toBeUndefined();
    w.scenarios[0].model='scott';w.scenarios[0].scott=scottState(w.scenarios[0]);
    expect(parseWorkspace(JSON.stringify(w)).scenarios[0].scott?.inputs.rentAnnual).toBe(90000);
    w.scenarios[0].scott.inputs.share=101;expect(()=>parseWorkspace(JSON.stringify(w))).toThrow();
  });
});
