import type { Metadata } from 'next';

import PricingView from '@/components/marketing/PricingView';
import SiteFooter from '@/components/marketing/SiteFooter';
import SiteNav from '@/components/marketing/SiteNav';

export const metadata: Metadata = {
  title: 'Pricing — PortAI',
  description: 'Free paper-trading plan, Pro, Campus and API pricing for PortAI, the AI investment committee you can audit.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteNav />
      <main>
        <PricingView />
      </main>
      <SiteFooter />
    </div>
  );
}
