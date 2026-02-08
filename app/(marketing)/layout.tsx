import React from 'react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Solo renderiza el contenido de la landing */}
      {children}
    </div>
  );
}