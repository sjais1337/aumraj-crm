'use client'

import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import UserSidebar from "@/components/Sidebar/User";
import Header from "@/components/Header";
import Auth from "@/context/Auth";
import { DataProvider } from '@/context/DataContext';
import axios from "axios";
import Loader from "@/components/Loader/Loader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/api/settings');

      setData(res.data);
    };

    fetchData();
  }, []);

  if (!data) {
    return <Loader></Loader>
  }

  return (
    <Auth>
      <div className="flex h-screen overflow-hidden">
          <UserSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="relative no-scrollbar flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <main>
              <div className="mx-auto  max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <DataProvider value={data}>
                  {children}
                </DataProvider>
              </div>
              </main>
          </div>
      </div>
    </Auth>
    
  );
}
