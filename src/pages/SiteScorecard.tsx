import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Panel } from '@/components/Financials';
import { useWorkspace } from '@/lib/workspace';
import { criteria } from '@/lib/sourceReferences';
import { answerComplete, criterionPrompts, scorecardDimensions, scorecardSummary, type ScorecardAnswer } from '@/lib/siteScorecard';

export default function SiteScorecard() {
  const { data, setData } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const site = data.sites.find(s => s.id === params.get('site')) ?? data.sites[0];
  const [step, setStep] = useState(0);
  if (!site) return <Panel className="p-6"><h1>Start with a candidate site.</h1><p className="my-4 text-sm text-muted-foreground">Add an address and site details before starting the assessment.</p><Button asChild className="rounded-xl"><Link to="/">Add a site</Link></Button></Panel>;
  const summary = scorecardSummary(site.scorecard);
  const dimension = scorecardDimensions[step];
  const sectionCriteria = criteria.filter(c => c.dimension === dimension);
  const sectionCompleted = sectionCriteria.filter(c => answerComplete(site.scorecard?.answers[c.code])).length;
  function update(code: string, patch: Partial<ScorecardAnswer>) {
    setData(w => ({ ...w, sites: w.sites.map(s => s.id === site.id ? { ...s, scorecard: { answers: { ...s.scorecard?.answers, [code]: { evidence: '', ...s.scorecard?.answers[code], ...patch } } } } : s) }));
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow">From candidate to considered decision</div><h1 className="mt-2">Site Scorecard</h1><p className="mt-2 text-sm text-muted-foreground">Six sections. {criteria.length} criteria. A clearer picture of your next hub.</p></div><Button asChild variant="outline" className="action-button"><Link to="/">Edit site details <ArrowRight size={14} /></Link></Button></div>
    <Panel className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-5"><div className="min-w-0 flex-1"><label htmlFor="scorecard-site" className="text-xs font-semibold">Candidate site</label><select id="scorecard-site" className="form-select mt-2 block w-full sm:max-w-lg" value={site.id} onChange={e => { setParams({ site: e.target.value }); setStep(0); }}>{data.sites.map(s => <option key={s.id} value={s.id}>{s.name} · {s.city}</option>)}</select><p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={14} className="shrink-0" />{site.address || 'Address not entered'}</p><p className="mt-2 text-xs text-muted-foreground">{site.sf ? `${site.sf.toLocaleString()} SF` : 'Area unknown'} · ${site.rent.toFixed(2)}/SF/year base-rent entry · verify quote and NNN/CAM</p></div><div className="rounded-2xl bg-teal-900 px-5 py-4 text-white"><ClipboardCheck size={22} className="mb-2" /><div className="text-3xl font-semibold">{summary.score === null ? '—' : summary.score.toFixed(1)}<span className="ml-1 text-sm text-teal-100">/100</span></div><p className="mt-1 text-xs text-teal-100">Evidence-backed weighted score</p><p className="mt-2 text-xs font-semibold">{summary.classification}</p></div></div>
      <div className="mt-6 flex items-center justify-between gap-3 text-xs"><span className="font-semibold">Overall completion · {summary.completed} of {criteria.length} entries</span><span>{Math.round(summary.progress)}%</span></div><Progress value={summary.progress} aria-label="Overall scorecard completion" className="mt-2 h-2.5 rounded-full bg-secondary" /><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Each entry needs a rating and an evidence note or source. Scored weight: {summary.weight}/100. Unfinished entries are excluded, not scored as zero. Answers save locally as you type and are included in workspace JSON exports.</p>
    </Panel>
    <div className="grid items-start gap-5 lg:grid-cols-[250px_1fr]">
      <nav aria-label="Scorecard sections" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">{scorecardDimensions.map((name, index) => {
        const entries = criteria.filter(c => c.dimension === name);
        const count = entries.filter(c => answerComplete(site.scorecard?.answers[c.code])).length;
        return <button key={name} aria-current={step === index ? 'step' : undefined} onClick={() => setStep(index)} className={`rounded-2xl border p-4 text-left transition-colors ${step === index ? 'border-teal-700 bg-teal-50' : 'border-border bg-white hover:bg-secondary'}`}><div className="flex items-center gap-2 text-xs font-semibold"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${count === entries.length ? 'bg-teal-700 text-white' : 'bg-secondary text-teal-900'}`}>{count === entries.length ? <Check size={13} /> : index + 1}</span>{name}</div><div className="mt-3 flex justify-between text-[11px] text-muted-foreground"><span>{count}/{entries.length} complete</span><span>{Math.round(count / entries.length * 100)}%</span></div><Progress value={count / entries.length * 100} aria-label={`${name} completion`} className="mt-2 h-1.5 bg-secondary" /></button>;
      })}</nav>
      <div className="space-y-4"><div><div className="eyebrow">Section {step + 1} of 6</div><h2 className="mt-2">{dimension}</h2><p className="mt-2 text-xs text-muted-foreground">{sectionCompleted} of {sectionCriteria.length} complete. Working scale: 0 = poor fit / unmet, 1 = partial fit, 2 = strong fit / met. Support the rating with evidence; these are planning judgments, not verified approvals.</p></div>
        {sectionCriteria.map(c => {
          const answer = site.scorecard?.answers[c.code];
          const complete = answerComplete(answer);
          const progress = (answer?.rating !== undefined ? 50 : 0) + (answer?.evidence.trim() ? 50 : 0);
          return <Panel key={c.code} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">{c.code} · {c.weight}% weight</span><h3 className="mt-1 text-base font-semibold">{c.label.replace(' (auto)', '')}</h3></div><span className={complete ? 'status-green' : 'status-amber'}>{complete ? 'Complete' : 'Needs input'}</span></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{criterionPrompts[c.code]}</p>{c.label.includes('(auto)') && <p className="mt-2 text-xs text-teal-800">Manual rating in this version: record your calculation and assumptions below. No automatic suitability decision is made.</p>}
            <fieldset className="mt-4"><legend className="text-xs font-semibold">Rating</legend><div className="mt-2 flex flex-wrap gap-2">{([0, 1, 2] as const).map(rating => <Button key={rating} type="button" variant="outline" aria-pressed={answer?.rating === rating} onClick={() => update(c.code, { rating })} className={`h-auto rounded-xl px-4 py-2 text-xs ${answer?.rating === rating ? 'border-teal-700 bg-teal-700 text-white hover:bg-teal-800 hover:text-white' : 'border-border'}`}>{rating} · {['Poor fit', 'Partial fit', 'Strong fit'][rating]}</Button>)}{answer?.rating !== undefined && <Button variant="ghost" className="rounded-xl text-xs" onClick={() => update(c.code, { rating: undefined })}>Clear rating</Button>}</div></fieldset>
            <label htmlFor={`evidence-${c.code}`} className="mt-4 block text-xs font-semibold">Evidence note or source <span className="font-normal text-muted-foreground">· required</span></label><Textarea id={`evidence-${c.code}`} className="mt-2 min-h-[90px] rounded-xl border-border bg-background text-sm" maxLength={10000} placeholder="What supports this rating? Include observations, a listing/source link, contact and date where available." value={answer?.evidence ?? ''} onChange={e => update(c.code, { evidence: e.target.value })} />
            <div className="mt-4 flex justify-between text-[11px] text-muted-foreground"><span>{answer?.rating !== undefined ? 'Rating saved' : 'Rating missing'} · {answer?.evidence.trim() ? 'Evidence saved' : 'Evidence missing'}</span><span>{progress}%</span></div><Progress value={progress} aria-label={`${c.label} completion`} className="mt-2 h-1.5 bg-secondary" />
          </Panel>;
        })}
        <div className="flex justify-between gap-3"><Button variant="outline" className="action-button" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={14} />Previous</Button>{step < 5 ? <Button className="rounded-xl text-xs" onClick={() => setStep(step + 1)}>Next section <ArrowRight size={14} className="ml-2" /></Button> : <Button variant="outline" className="action-button" onClick={() => { const incomplete = scorecardDimensions.findIndex(name => criteria.some(c => c.dimension === name && !answerComplete(site.scorecard?.answers[c.code]))); setStep(incomplete < 0 ? 0 : incomplete); }}>Review {summary.completed === criteria.length ? 'assessment' : 'unfinished entries'}</Button>}</div>
        <Panel className="border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">{summary.completed === criteria.length ? 'All entries are complete. ' : ''}Completion is not site approval. Confirm zoning, lease costs, loading, power, layout and route safety before committing. This assessment does not overwrite historical scores or change linked financial-model assumptions. No property-data APIs are connected.</Panel>
      </div>
    </div>
  </div>;
}
