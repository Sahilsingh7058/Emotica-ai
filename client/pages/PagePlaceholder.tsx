import React from "react";

export default function PagePlaceholder({ title }: { title: string }) {
  return (
    <section className="min-h-[70dvh] flex items-center justify-center bg-gradient-to-b from-background/60 to-background ">
      <div className="text-center px-6 bg-neutral-200">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground/90 mb-4">
          {title}
        </h1>
        <p className="text-foreground/70 max-w-xl mx-auto">
          This page is a placeholder. Tell me what content you want here and I’ll build it next.
        </p>
      </div>
    </section>
  );
}
