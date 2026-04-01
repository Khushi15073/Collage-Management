import { TrendingUp, TrendingDown } from 'lucide-react';
import type  { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  loading?: boolean;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon?: LucideIcon;
  iconBgColor?: string;
  className?: string;
}

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function StatCard({
  title,
  value,
  loading = false,
  change,
  changeType,
  className,
}: StatCardProps) {
  return (
    <div
      className={cx(
        "flex w-[220px] min-h-[92px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center transition-shadow hover:shadow-lg",
        className
      )}
    >
      <div className="mb-2">
        <div className="text-center">
          {loading ? (
            <>
              <div className="mx-auto mb-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-200" />
            </>
          ) : (
            <>
              <p className="mb-1 text-sm text-gray-600">{title}</p>
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            </>
          )}
        </div>
      </div>
      {!loading && change && changeType && (
        <div className="flex items-center gap-1">
          {changeType === 'increase' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}
