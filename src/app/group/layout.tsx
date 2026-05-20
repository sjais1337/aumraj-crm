"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import GroupSidebar from "@/components/Sidebar/Group";
import Header from "@/components/Header";
import Auth from "@/context/Auth";
import Loader from "@/components/Loader/Loader";
import axios from "axios";
import { DataProvider } from "@/context/DataContext";
import { NextResponse } from "next/server";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState(null);
  const [ permissions, setPermissions ] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/api/group/permissions');
      const settings = await axios.get('/api/settings');

      console.log(res);

      if(res.status == 500){
        return toast.error('Something went wrong! Please report to development.')
      }

      if(res.status == 201){
        return router.push('/users/permissions');
      }      

      setPermissions({
        funnel: res.data.funnel,
        reports: res.data.reports,
        scores: res.data.scores
      })

      setData({ 
        settings: settings,
        groupData: res.data 
      });
    };  

    fetchData();
  }, []);

  if (!data) {
    return <Loader></Loader>
  }
  return (
    <Auth>
      <div className="flex h-screen overflow-hidden">
        <GroupSidebar groupPermissions={permissions} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
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
