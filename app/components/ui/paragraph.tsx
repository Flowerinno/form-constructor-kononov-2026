import * as React from "react";
import { cn } from "~/lib/utils";

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-base leading-relaxed",
        "text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  )
);

Paragraph.displayName = "Paragraph";

export { Paragraph };
