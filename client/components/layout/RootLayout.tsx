import React from "react";
import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";

export default function RootLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground bg-neutral-500">
      <SiteHeader />
      <main className=""> 
        <Outlet />
      </main>
    </div>
  );
}
