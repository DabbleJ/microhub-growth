import { describe, expect, it } from 'vitest';
import { criteria, occupancyCeilings, referenceScore, sourceGates, sourceSiteRecord, sourceSites } from './sourceReferences';
describe('Supplied October 7 source references', () => {
  it('reproduces the scorecard points, coverage and rounded normalized scores', () => {
    expect(criteria.reduce((v, c) => v + c.weight, 0)).toBe(100);
    for (const [id, points, possible, score] of [['sodo', 42.5, 61, 70], ['stadium', 23, 36, 64], ['capitol', 24.5, 39, 63], ['georgetown', 25.5, 38, 67]] as const) {
      const s = sourceSites.find(s => s.id === id)!;
      const result = referenceScore(s);
      expect(result.points).toBe(points);
      expect(result.possible).toBe(possible);
      expect(Math.round(result.score!)).toBe(score);
    }
  });
  it('excludes blank ratings and withholds verdicts until sufficient coverage', () => {
    expect(referenceScore(sourceSites.find(s => s.id === 'stadium')!).classification).toBe('Incomplete (36% scored)');
    expect(referenceScore(sourceSites.find(s => s.id === 'olympia')!).score).toBeNull();
    expect(referenceScore(sourceSites.find(s => s.id === 'sodo')!).classification).toBe('Promising (gates pending)');
  });
  it('reproduces the 1-Hub occupancy ceilings and pre/post-share profit', () => {
    const e = occupancyCeilings();
    expect(e.contribution).toBe(101750);
    expect(Math.round(e.breakEvenMonthly)).toBe(8479);
    expect(Math.round(e.targetMonthly)).toBe(5563);
    expect(e.beforeShare).toBe(11750);
    expect(e.afterShare).toBe(9400);
  });
  it('retains exact monthly rent without premature annual-unit rounding', () => {
    const stanford = sourceSites.find(s => s.id === 'stanford')!;
    expect(stanford.annualRent).toBeCloseTo(9.02654867);
    expect(sourceGates(stanford).occupancy).toBe(8500);
    expect(sourceGates(stanford).size).toBe('FAIL');
    expect(sourceGates(stanford).baseRent).toBe('FAIL (base only)');
  });
  it('retains unknown rent and keeps source copies distinct from existing records', () => {
    const national = sourceSites.find(s => s.id === 'national')!;
    expect(national.annualRent).toBeNull();
    expect(sourceGates(national).baseRent).toBe('PENDING');
    const copy = sourceSiteRecord(national);
    expect(copy.id).toBe('source-20261007-national');
    expect(copy.notes).toContain('NOT a free lease');
    expect(copy.notes).toContain('ARCHINNOVO Site Analysis — LACI Model');
  });
});
