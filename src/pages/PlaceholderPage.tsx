import { ShieldCheck } from 'lucide-react';
import type { View } from '../types/auth';

export const PlaceholderPage = ({ view, onBack }: { view: View; onBack: () => void }) => (
  <div className="flex h-[60vh] flex-col items-center justify-center text-center p-8">
    <ShieldCheck size={48} className="text-primary/20 mb-4" />
    <h2 className="font-headline text-2xl font-bold text-primary">Module Under Construction</h2>
    <p className="text-on-surface-variant mt-2">The {view} management interface is being finalized for enterprise deployment.</p>
    <button onClick={onBack} className="mt-6 text-primary font-bold hover:underline">Return to Dashboard</button>
  </div>
);
