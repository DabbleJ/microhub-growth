import type { Site, Workspace } from './defaults';

export function seattleRent(site: Pick<Site, 'city' | 'name' | 'neighborhood'>): number | undefined {
  if (site.city !== 'Seattle') return undefined;
  const text = `${site.name} ${site.neighborhood}`.toLowerCase();
  if (text.includes('sodo') || text.includes('georgetown')) return 15;
  if (text.includes('stadium')) return 18;
  if (text.includes('capitol hill') || text.includes('capital hill')) return 24;
  return undefined;
}

export function applySeattleRents(workspace: Workspace): Workspace {
  if (workspace.seattleRentUpdate === 1) return workspace;
  const rates = new Map<string, number>();
  const sites = workspace.sites.map(site => {
    const rent = seattleRent(site);
    if (rent === undefined) return site;
    rates.set(site.id, rent);
    return { ...site, rent, notes: `${site.notes}\nCurrent planning override: $${rent}/SF/year annual base rent, provided by user; excludes unverified NNN/CAM. Dated source figures above remain historical.` };
  });
  const scenarios = workspace.scenarios.map(scenario => {
    const rent = scenario.siteId ? rates.get(scenario.siteId) : seattleRent({ city: scenario.city, name: scenario.name, neighborhood: '' });
    if (rent === undefined) return scenario;
    const source = `User-provided Seattle neighborhood assumption: $${rent}/SF/year base rent; excludes unverified NNN/CAM`;
    const scott = scenario.scott ? { inputs: { ...scenario.scott.inputs, rentAnnual: rent * Number(scenario.scott.inputs.sf) }, metadata: { ...scenario.scott.metadata, rentAnnual: { source: `${source} × Scott module area (${scenario.scott.inputs.sf} SF)`, confidence: 'low' as const, validation: true } } } : undefined;
    return { ...scenario, inputs: { ...scenario.inputs, rent }, metadata: { ...scenario.metadata, rent: { source, confidence: 'low' as const, validation: true } }, ...(scott ? { scott } : {}) };
  });
  return { ...workspace, sites, scenarios, seattleRentUpdate: 1 };
}
