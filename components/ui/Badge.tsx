import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "gray" | "blue";
  className?: string;
}

export default function Badge({
  children,
  variant = "gray",
  className,
}: BadgeProps) {
  const variants = {
    green: "bg-green-50 text-green-700 border border-green-100",
    red: "bg-red-50 text-red-600 border border-red-100",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
