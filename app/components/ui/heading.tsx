import type { JSX } from "react";
import * as React from "react";
import { cn } from "~/lib/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({
  level = 2,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    // @ts-expect-error TODO: Complaining but works
    <Tag
      className={cn(
        "font-semibold tracking-tight",
        {
          "text-3xl": level === 1,
          "text-2xl": level === 2,
          "text-xl": level === 3,
          "text-lg": level === 4,
          "text-base": level === 5,
          "text-sm": level === 6,
        },
        "text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}