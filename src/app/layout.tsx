"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useState } from "react";
import AuthContext from "@/context/AuthContext";
import ToasterContext from "@/context/ToasterContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          
          <AuthContext>
            <ToasterContext/>
            {children}
          </AuthContext>
        </div>
      </body>
    </html>
  );
}
