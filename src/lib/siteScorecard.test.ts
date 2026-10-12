import { describe, expect, it } from 'vitest';
import { answerComplete, scorecardSummary, type SiteScorecard } from './siteScorecard';
import { criteria } from './sourceReferences';
import { initialWorkspace } from './defaults';
import { parseWorkspace } from './workspace';

describe('guided site scorecard', () => {
  it('requires both a rating and nonblank evidence, including for a zero rating', () => {
    expect(answerComplete({ rating: 2, evidence: '  ' })).toBe(false);
    expect(answerComplete({ evidence: 'Listing' })).toBe(false);
    expect(answerComplete({ rating: 0, evidence: 'No loading access observed' })).toBe(true);
  });
  it('excludes incomplete entries and normalizes only evidence-backed weight', () => {
    const result = scorecardSummary({ answers: { '1a': { rating: 2, evidence: 'Lease quote' }, '1b': { rating: 0, evidence: 'Landlord declined concessions' }, '2a': { rating: 2, evidence: '' } } });
    expect(result.completed).toBe(2);
    expect(result.weight).toBe(18);
    expect(result.score).toBeCloseTo(100 * 12 / 18);
    expect(result.classification).toBe('Incomplete assessment');
    expect(scorecardSummary().score).toBeNull();
  });
  it('reports full completion without treating it as gate approval', () => {
    const card: SiteScorecard = { answers: Object.fromEntries(criteria.map(c => [c.code, { rating: 2, evidence: 'Reviewed with source' }])) };
    expect(scorecardSummary(card)).toEqual({ completed: criteria.length, progress: 100, weight: 100, score: 100, classification: 'Go (gates pending)' });
  });
  it('round-trips drafts and leaves historical scores and older workspaces intact', () => {
    const w = initialWorkspace();
    expect(parseWorkspace(JSON.stringify(w)).sites[0].scorecard).toBeUndefined();
    w.sites[0].scorecard = { answers: { '1a': { rating: 0, evidence: 'Quote' }, '1b': { evidence: 'Draft' } } };
    const imported = parseWorkspace(JSON.stringify(w));
    expect(imported.sites[0].scorecard).toEqual(w.sites[0].scorecard);
    expect(imported.sites[0].score).toBe(w.sites[0].score);
    w.sites[0].scorecard.answers['1a'].rating = 3 as 0;
    expect(() => parseWorkspace(JSON.stringify(w))).toThrow();
  });
});
