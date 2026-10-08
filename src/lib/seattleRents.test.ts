import { describe, expect, it } from 'vitest';
import { applySeattleRents, seattleRent } from './seattleRents';
import { initialWorkspace, makeScenario } from './defaults';
import { scottState } from './scottModel';

describe('Seattle neighborhood rent assumptions', () => {
  it('sets the requested annual base rates and leaves other cities alone', () => {
    const w = applySeattleRents(initialWorkspace());
    expect(['sodo','georgetown','stadium','capitol'].map(id => w.sites.find(s => s.id === id)?.rent)).toEqual([15,15,18,24]);
    expect(w.sites.find(s => s.id === 'national')?.rent).toBe(30);
    expect(seattleRent({city:'Los Angeles',name:'SODO',neighborhood:''})).toBeUndefined();
  });
  it('updates linked annual and Scott inputs once without clobbering later edits', () => {
    const w = initialWorkspace(), scenario = makeScenario('SODO scenario');
    scenario.siteId = 'sodo'; scenario.model = 'scott'; scenario.scott = scottState(scenario);
    w.scenarios.push(scenario);
    const updated = applySeattleRents(w), s = updated.scenarios.find(s => s.id === scenario.id)!;
    expect(s.inputs.rent).toBe(15); expect(s.scott?.inputs.rentAnnual).toBe(45000);
    expect(s.scott?.metadata.rentAnnual.validation).toBe(true);
    s.inputs.rent = 17;
    expect(applySeattleRents(updated)).toBe(updated);
    expect(s.inputs.rent).toBe(17);
  });
});
