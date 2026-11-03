'use client';

import { usePortfolios } from '@/lib/hooks';
import { dateTime } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import { Empty, ErrorState, Skeleton } from '@/components/ui';
import PortfolioCard from '@/components/portfolios/PortfolioCard';

export default function PortfoliosPage() {
  const q = usePortfolios();
  const list = q.data?.portfolios ?? [];

  return (
    <div>
      <PageHeader
        title="Model Portfolios"
        subtitle={
          q.data
            ? `What each legend's committee would hold today · as of ${dateTime(q.data.as_of)}`
            : "What each legend's committee would hold today."
        }
      />
      <div className="p-6">
        {q.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : list.length === 0 ? (
          <Empty>No model portfolios available.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} />
            ))}
          </div>
        )}
        <p className="mt-4 text-2xs text-muted">
          Weights come from one pipeline run over the fund universe: each portfolio averages its personas&apos; votes, holds
          tickers with a positive average, caps each at 25% and keeps the rest in cash. Paper portfolios, not financial advice.
        </p>
      </div>
    </div>
  );
}
