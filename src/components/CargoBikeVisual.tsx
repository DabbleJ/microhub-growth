import { Bike, PackageCheck, Warehouse } from 'lucide-react';

export default function CargoBikeVisual() {
  return <figure className="overflow-hidden rounded-2xl border border-border bg-white">
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
      <div><p className="eyebrow">The last mile starts here</p><p className="mt-1 text-sm font-semibold">Small footprint. A different kind of delivery.</p></div>
      <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-800">Cargo-bike logistics</span>
    </div>
    <img src="/assets/cargo-bike-microhub-scenes.png" alt="Illustrative scenes of a box cargo tricycle, an enclosed electric delivery cycle, and a rider loading a cargo bicycle at a neighborhood hub" className="h-48 w-full object-cover sm:h-auto sm:aspect-[3/1]" />
    <div className="grid gap-3 border-t border-border bg-secondary/40 px-5 py-4 sm:grid-cols-3">
      {[{ icon: Bike, title: 'Commercial cargo cycles', text: 'Plan space for varied vehicle formats.' }, { icon: Warehouse, title: 'Neighborhood microhubs', text: 'Evaluate access, staging and local fit.' }, { icon: PackageCheck, title: 'Last-mile operations', text: 'Connect site decisions to delivery needs.' }].map(item => <div key={item.title} className="flex items-start gap-3"><item.icon size={19} className="mt-0.5 shrink-0 text-teal-700" /><div><p className="text-xs font-semibold">{item.title}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.text}</p></div></div>)}
    </div>
    <figcaption className="px-5 py-2 text-[10px] text-muted-foreground">AI-generated concept imagery inspired by cargo-bike examples; not candidate-site photography or a selected fleet.</figcaption>
  </figure>;
}
