import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from '@/lib/workspace';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import Index from '@/pages/Index';
import HubModel from '@/pages/HubModel';
import Sites, { SiteProforma } from '@/pages/Sites';
import Partners from '@/pages/Partners';
import Assumptions from '@/pages/Assumptions';
import Compare from '@/pages/Compare';
import CascadiaMap from '@/pages/CascadiaMap';
import SourceReview from '@/pages/SourceReview';
import NotFound from '@/pages/NotFound';
export default function App() {
  return <TooltipProvider><Toaster richColors /><WorkspaceProvider><BrowserRouter><Routes><Route element={<WorkspaceLayout />}><Route path="/" element={<Sites />} /><Route path="/dashboard" element={<Index />} /><Route path="/model" element={<HubModel />} /><Route path="/sites" element={<Navigate to="/" replace />} /><Route path="/sites/:id/proforma" element={<SiteProforma />} /><Route path="/partners" element={<Partners />} /><Route path="/assumptions" element={<Assumptions />} /><Route path="/compare" element={<Compare />} /><Route path="/map" element={<CascadiaMap />} /><Route path="/sources" element={<SourceReview />} /></Route><Route path="*" element={<NotFound />} /></Routes></BrowserRouter></WorkspaceProvider></TooltipProvider>;
}
