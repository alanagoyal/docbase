import { cn } from "@/lib/utils";
import React from "react";

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0",
          className
        )}
        style={{
          clip: "rect(0 0 0 0)",
          clipPath: "inset(50%)",
          margin: "-1px",
        }}
        {...props}
      />
    );
  }
);
VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };