import StatCard from "./StatCard";

type StatsStripItem = {
  title: string;
  value: string;
  loading?: boolean;
  className?: string;
};

type StatsStripProps = {
  items: StatsStripItem[];
  outerClassName?: string;
  innerClassName?: string;
};

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function StatsStrip({
  items,
  outerClassName,
  innerClassName,
}: StatsStripProps) {
  return (
    <div className={cx("-mx-6 shrink-0 overflow-x-auto px-6 pb-2", outerClassName)}>
      <div className={cx("flex min-w-max gap-4", innerClassName)}>
        {items.map((item) => (
          <StatCard
            key={`${item.title}-${item.value}`}
            title={item.title}
            value={item.value}
            loading={item.loading}
            className={item.className}
          />
        ))}
      </div>
    </div>
  );
}
