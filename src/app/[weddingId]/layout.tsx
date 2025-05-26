import React from 'react';

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wedding-template">
      {children}
    </div>
  );
} 