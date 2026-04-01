import type { ComponentPropsWithoutRef } from "react";

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type DivProps = ComponentPropsWithoutRef<"div">;
type NativeTableProps = ComponentPropsWithoutRef<"table">;
type HeadProps = ComponentPropsWithoutRef<"thead">;
type BodyProps = ComponentPropsWithoutRef<"tbody">;
type RowProps = ComponentPropsWithoutRef<"tr">;
type HeaderProps = ComponentPropsWithoutRef<"th">;
type CellProps = ComponentPropsWithoutRef<"td">;

export function TableContainer({ className, ...props }: DivProps) {
  return <div className={cx("overflow-x-auto", className)} {...props} />;
}

export function Table({ className, ...props }: NativeTableProps) {
  return <table className={cx("w-full text-sm", className)} {...props} />;
}

export function TableHead({ className, ...props }: HeadProps) {
  return <thead className={className} {...props} />;
}

export function TableBody({ className, ...props }: BodyProps) {
  return <tbody className={cx("table-zebra", className)} {...props} />;
}

export function TableRow({ className, ...props }: RowProps) {
  return <tr className={cx("transition-colors", className)} {...props} />;
}

export function TableHeader({ className, ...props }: HeaderProps) {
  return (
    <th
      className={cx(
        "px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: CellProps) {
  return <td className={cx("px-6 py-4", className)} {...props} />;
}
