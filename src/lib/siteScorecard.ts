import { criteria } from './sourceReferences';

export type ScorecardAnswer = { rating?: 0 | 1 | 2; evidence: string };
export type SiteScorecard = { answers: Record<string, ScorecardAnswer> };
export const scorecardDimensions = [...new Set(criteria.map(c => c.dimension))];
export function answerComplete(answer?: ScorecardAnswer) {
  return answer?.rating !== undefined && !!answer.evidence.trim();
}
export function scorecardSummary(card?: SiteScorecard) {
  let completed = 0, weight = 0, points = 0;
  for (const criterion of criteria) {
    const answer = card?.answers[criterion.code];
    if (answerComplete(answer)) {
      completed++;
      weight += criterion.weight;
      points += criterion.weight * answer!.rating! / 2;
    }
  }
  const score = weight ? points / weight * 100 : null;
  const classification = weight < 60 ? 'Incomplete assessment' : score! >= 75 ? 'Go (gates pending)' : score! >= 60 ? 'Promising (gates pending)' : score! >= 45 ? 'Watch (gates pending)' : 'Deprioritize (gates pending)';
  return { completed, progress: completed / criteria.length * 100, weight, score, classification };
}
export const criterionPrompts: Record<string, string> = {
  '1a': 'Record quoted base rent, NNN/CAM and other occupancy costs. Compare all-in occupancy with your chosen model’s ceiling; identify the model and assumptions used.',
  '1b': 'Document lease term, concessions, shared-space options, expansion rights and the landlord’s willingness to negotiate.',
  '2a': 'Describe delivery demand within the service area, customer density and travel time from the hub to delivery routes.',
  '2b': 'Identify prospective anchor customers and distinguish signed commitments from conversations or leads.',
  '2c': 'Describe customer diversification, seasonality and realistic promotional revenue opportunities.',
  '3a': 'Check parcel zoning and permitted activities with the local authority, including storage, delivery operations and any public-facing uses.',
  '3b': 'Record usable area and layout, compare with the 1,000–5,000 SF module target, and document circulation, storage and workspace fit.',
  '3c': 'Describe loading doors, curb access, loading restrictions, staging space and conflicts with other users.',
  '3d': 'Document electrical service, charging capacity, outlet locations and any upgrade requirements.',
  '3e': 'Compare expected delivery throughput with vehicle storage, staging, staff space and building constraints.',
  '3f': 'Confirm whether essential operations can occur on one level; document stairs, lifts and access limitations.',
  '3g': 'Describe refrigeration needs, existing equipment, temperature control and food-handling requirements.',
  '4a': 'Describe connections to bike and low-speed streets serving the intended customer area; record gaps or detours.',
  '4b': 'Document terrain, intersections, traffic exposure and route observations, including a field ride when possible.',
  '4c': 'Check feeder-van approach routes, truck restrictions, access geometry and delivery windows.',
  '5a': 'Identify relevant city plans, freight initiatives or low-pollution policies and explain the site’s alignment.',
  '5b': 'Name a public or partner champion and document their role and level of commitment.',
  '5c': 'Identify funding programs and verify location, use, applicant and timing eligibility; do not assume an award.',
  '6a': 'Describe community benefits, co-location opportunities and stakeholder feedback or concerns.',
  '6b': 'Explain how this hub supports a broader network and whether its operating arrangement can be replicated.',
};
