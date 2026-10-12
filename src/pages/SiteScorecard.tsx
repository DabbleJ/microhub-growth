import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Panel } from '@/components/Financials';
import SiteScorecardModal from '@/components/SiteScorecardModal';
import AddScorecardSite from '@/components/AddScorecardSite';
import { useWorkspace } from '@/lib/workspace';
import { criteria } from '@/lib/sourceReferences';
import { scorecardSummary } from '@/lib/siteScorecard';

export default function SiteScorecard() {
  const { data } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);
  const addSiteDialog = <AddScorecardSite open={adding} onOpenChange={setAdding} onCreated={id => setParams({ site: id })} />;
  const site = data.sites.find(s => s.id === params.get('site')) ?? data.sites[0];
  if (!site) return <Panel className="p-6"><h1>Start with a candidate site.</h1><p className="my-4 text-sm text-muted-foreground">Add a site before starting the assessment.</p><Button className="rounded-xl" onClick={() => setAdding(true)}>Add site</Button>{addSiteDialog}</Panel>;
  const summary = scorecardSummary(site.scorecard);
  return <div className="mx-auto max-w-2xl space-y-6 py-3 sm:py-8">
    {addSiteDialog}
    <div><div className="eyebrow">One question at a time</div><h1 className="mt-2">Site Scorecard</h1><p className="mt-2 text-sm text-muted-foreground">Assess a candidate site at your own pace. Your progress stays saved.</p></div>
    <Panel className="space-y-6 p-5 sm:p-7">
      <div><label htmlFor="scorecard-site" className="text-xs font-semibold">Candidate site</label><select id="scorecard-site" className="form-select mt-2 block w-full" value={site.id} onChange={e => { if (e.target.value === '__add_site__') setAdding(true); else setParams({ site: e.target.value }); }}>{data.sites.map(s => <option key={s.id} value={s.id}>{s.name} · {s.city}</option>)}<option value="__add_site__">+ Add Site</option></select><p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={14} className="shrink-0" />{site.address || 'Address not entered'}</p></div>
      <div><div className="mb-2 flex justify-between text-xs"><span className="font-semibold">{summary.completed} of {criteria.length} questions complete</span><span>{Math.round(summary.progress)}%</span></div><Progress value={summary.progress} aria-label="Overall scorecard completion" className="h-2 rounded-full bg-secondary" /></div>
      {summary.score !== null && <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-secondary px-4 py-3"><span className="text-xs text-muted-foreground">Weighted score · {summary.weight}% assessed</span><span className="text-lg font-semibold text-teal-900">{summary.score.toFixed(1)}<span className="text-xs font-normal"> /100</span></span></div>}
      <div className="flex flex-wrap items-center justify-between gap-4"><SiteScorecardModal key={site.id} siteId={site.id} /><Link to="/" className="text-xs font-medium text-teal-800 underline underline-offset-4">Edit site details</Link></div>
      <p className="text-xs leading-relaxed text-muted-foreground">Each question needs a rating and supporting evidence. Drafts save automatically in this browser. You can close and finish later without losing your answers.</p>
    </Panel>
    <p className="text-[11px] leading-relaxed text-muted-foreground">A completed scorecard is not site approval. Unfinished questions are excluded from the score; historical scores and financial assumptions are unchanged.</p>
  </div>;
}
