"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  noPadding?: boolean;
}

export default function Card({
  children,
  className = "",
  title,
  icon,
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 px-5 pt-5 pb-2">
          {icon && (
            <span className="text-accent">{icon}</span>
          )}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
      <div className={noPadding ? "" : "px-5 pb-5"}>{children}</div>
    </div>
  );
}
