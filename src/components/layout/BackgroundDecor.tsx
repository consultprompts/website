import React from 'react';

export default function BackgroundDecor() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-secondary/5 rounded-full blur-[120px]" />
    </div>
  );
}
