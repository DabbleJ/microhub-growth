import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWorkspace } from '@/lib/workspace';
import type { Site } from '@/lib/defaults';
import { toast } from 'sonner';

export default function AddScorecardSite({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (id: string) => void }) {
  const { setData } = useWorkspace();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Seattle');
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="w-[calc(100%_-_2rem)] rounded-2xl border-border p-6 sm:max-w-md"><DialogHeader className="text-left"><DialogTitle className="text-xl">Add a candidate site</DialogTitle><DialogDescription className="pt-1">Start with the basics. You can add area, rent and other details later.</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={event => {
      event.preventDefault();
      if (!name.trim() || !city.trim()) return;
      const site: Site = { id: crypto.randomUUID(), name: name.trim(), address: address.trim(), city: city.trim(), sf: 0, rent: 24, score: 0, neighborhood: '', partner: '', status: 'Site search', notes: 'Area unknown. Rent is an unverified $24/SF/year planning placeholder, excluding NNN/CAM — replace with a property quote.' };
      setData(w => ({ ...w, sites: [...w.sites, site] }));
      onCreated(site.id);
      onOpenChange(false);
      setName(''); setAddress(''); setCity('Seattle');
      toast.success('Site added and saved locally');
    }}>
      <label className="block text-xs font-semibold" htmlFor="new-scorecard-site-name">Site name <Input id="new-scorecard-site-name" className="mt-2 rounded-xl" required maxLength={120} placeholder="e.g. Georgetown warehouse" value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="block text-xs font-semibold" htmlFor="new-scorecard-site-address">Address <span className="font-normal text-muted-foreground">· optional</span><Input id="new-scorecard-site-address" className="mt-2 rounded-xl" maxLength={500} placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} /></label>
      <label className="block text-xs font-semibold" htmlFor="new-scorecard-site-city">City <Input id="new-scorecard-site-city" className="mt-2 rounded-xl" required maxLength={120} value={city} onChange={e => setCity(e.target.value)} /></label>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" className="rounded-xl" disabled={!name.trim() || !city.trim()}>Add site</Button></div>
    </form>
  </DialogContent></Dialog>;
}
