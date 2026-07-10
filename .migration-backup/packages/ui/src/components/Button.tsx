import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", className = "", ...props }, ref) => {
    const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variantStyle =
      variant === "primary"
        ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500";

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variantStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
