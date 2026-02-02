// components/ui/scroll-area.tsx
"use client";

import React from "react";

export const ScrollArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
      {children}
    </div>
  );
};
