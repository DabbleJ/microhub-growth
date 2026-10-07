import { useEffect, useState, type ReactNode } from 'react';
import { LockKeyhole, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AccessGate({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const check = async () => {
      try {
        const response = await fetch('/api/access', { cache: 'no-store', credentials: 'same-origin' });
        if (!response.ok) throw new Error();
        const status = await response.json();
        setAuthenticated(status.authenticated === true);
        setConfigured(status.configured === true);
      } catch { setAuthenticated(false); setError('Unable to verify access. Please reload and try again.'); }
      finally { setChecking(false); }
    };
    void check();
    const interval = window.setInterval(check, 60000);
    const onFocus = () => { void check(); };
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, []);
  async function login() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/access', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!response.ok) {
        setError(response.status === 401 ? 'Incorrect password. Please try again.' : response.status === 429 ? 'Too many attempts. Please wait a minute.' : response.status === 503 ? 'Access is locked until the server password is configured.' : 'Unable to sign in. Please try again.');
        return;
      }
      const result = await response.json();
      if (result.authenticated !== true) throw new Error();
      setPassword(''); setAuthenticated(true);
    } catch { setError('Unable to sign in. Check your connection and try again.'); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try {
      const response = await fetch('/api/access', { method: 'DELETE', credentials: 'same-origin' });
      if (!response.ok) throw new Error();
      setAuthenticated(false); setPassword(''); setError('');
    } catch { window.alert('Unable to sign out. Please try again.'); }
    finally { setBusy(false); }
  }
  if (authenticated) return <>{children}<Button variant="outline" disabled={busy} onClick={logout} className="no-print fixed bottom-20 right-5 z-50 gap-2 rounded-xl bg-white shadow-sm"><LogOut size={14} />Sign out</Button></>;
  return <main className="flex min-h-screen items-center justify-center bg-background p-5">
    <section className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-lg">
      <div className="bg-teal-900 px-12 py-8"><img src="https://b-linepdx.com/wp-content/uploads/Approved-B-Line-Urban-Delivery-white-logo-with-strapline.png" alt="B-Line Urban Delivery" className="mx-auto h-auto w-56" /></div>
      <div className="p-7 sm:p-9"><LockKeyhole className="mb-4 text-teal-700" size={26} /><p className="eyebrow">Internal workspace</p><h1 className="mt-2 text-2xl">Microhub Planner</h1><p className="mt-3 text-sm text-muted-foreground">Enter the shared password to access the planner.</p>
        {checking ? <p role="status" className="mt-6 text-sm text-muted-foreground">Checking access…</p> : !configured ? <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Access is locked. The administrator must configure the private server secret <code>NITRO_PLANNER_PASSWORD</code> in the hosting environment.</p> : <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); void login(); }}><label htmlFor="access-password" className="block text-xs font-semibold">Shared password<Input id="access-password" type="password" autoComplete="current-password" required maxLength={1024} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 h-11 rounded-xl" /></label><Button type="submit" disabled={busy || !password} className="h-11 w-full rounded-xl font-semibold">{busy ? 'Verifying…' : 'Unlock planner'}</Button></form>}
        {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}<p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">Access expires after 8 hours. Signing out does not delete locally saved workspace data.</p>
      </div>
    </section>
  </main>;
}
