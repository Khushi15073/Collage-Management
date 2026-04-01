import { Search } from "lucide-react";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  className,
  inputClassName,
}: SearchFieldProps) {
  return (
    <div className={cx("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cx(
          "w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300",
          inputClassName
        )}
      />
    </div>
  );
}
