"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarLinkGroup from "../SidebarLinkGroup";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const UserSidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const { data: session, status } = useSession()

  const [ isGroupHead, setIsGroupHead ] = useState(false);


  let storedSidebarExpanded = "true";

  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const temp = async () => {
      const res = await axios.get('/api/group/permissions');

      if(res.status == 500){
        return toast.error('Something went wrong! Please report to development.')
      }

      if(res.status == 201){
        return;
      }  

      setIsGroupHead(true);
    }

    temp();
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link onClick={() => setSidebarOpen(false)} href="/">
          <Image width={176} height={32} src={"/images/logo/logo-dark.svg"} alt="Logo"priority/>
        </Link>

        <button ref={trigger} onClick={() => setSidebarOpen(!sidebarOpen)} aria-controls="sidebar" aria-expanded={sidebarOpen} className="block lg:hidden">
          <svg className="fill-current" width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"fill=""/>
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 lg:py-5 lg:px-6">
        <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <Link onClick={() => setSidebarOpen(false)} href="/users" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 937.000000 821.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,821.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M4597 8176 c-32 -13 -66 -31 -75 -39 -10 -7 -591 -520 -1292 -1138 -701 -619 -1656 -1461 -2122 -1872 -467 -411 -859 -764 -872 -785 -54 -83 -59 -169 -15 -256 60 -121 208 -168 333 -106 27 14 173 136 337 282 159 142 291 258 294 258 2 0 6 -726 8 -1612 l3 -1613 22 -95 c31 -138 57 -213 112 -321 124 -246 293 -415 540 -540 109 -55 185 -81 325 -112 l100 -22 2395 0 2395 0 100 22 c141 31 216 57 326 113 246 124 415 293 540 540 54 107 80 182 111 320 l22 95 3 1613 c2 886 6 1612 9 1612 3 0 135 -116 294 -258 163 -146 310 -268 337 -282 125 -63 271 -16 332 106 46 91 37 189 -25 270 -26 34 -640 578 -3164 2804 -854 752 -1128 989 -1170 1008 -77 36 -132 38 -203 8z m259 -699 c88 -78 762 -675 1497 -1326 l1337 -1185 -2 -1820 -3 -1821 -28 -85 c-89 -266 -248 -424 -512 -507 l-90 -28 -2365 0 -2365 0 -90 28 c-266 83 -433 254 -517 527 l-23 75 -3 1816 -2 1815 1382 1225 c760 673 1434 1270 1498 1326 63 57 117 103 120 103 3 0 77 -64 166 -143z"/>
<path d="M4605 5694 c-104 -10 -269 -56 -360 -102 -181 -90 -365 -281 -450 -467 -70 -155 -98 -276 -98 -425 0 -265 107 -515 305 -712 145 -144 284 -218 508 -269 71 -16 289 -16 360 0 287 66 477 192 644 430 80 113 147 297 166 454 51 430 -241 893 -653 1033 -39 14 -99 31 -132 38 -64 15 -225 26 -290 20z m267 -522 c145 -52 256 -172 297 -322 51 -185 6 -381 -116 -504 -94 -95 -188 -135 -333 -143 -194 -11 -346 62 -452 215 -56 81 -72 143 -72 282 0 103 4 135 22 182 52 143 168 251 312 295 96 30 252 27 342 -5z"/>
<path d="M3975 3193 c-128 -9 -315 -63 -435 -123 -136 -69 -298 -212 -393 -348 -66 -94 -96 -151 -135 -262 -50 -142 -65 -237 -66 -415 -1 -149 1 -163 23 -208 43 -86 116 -129 221 -129 106 0 180 43 220 129 19 40 24 75 31 203 8 161 17 213 46 277 61 134 202 275 337 336 97 45 140 47 866 47 726 0 769 -2 866 -47 134 -61 276 -202 337 -336 29 -64 38 -116 47 -277 5 -101 14 -168 24 -191 39 -92 119 -142 226 -141 105 0 178 43 221 129 22 45 24 59 23 208 -1 218 -39 386 -124 555 -69 136 -212 298 -348 393 -123 87 -239 137 -412 179 -82 20 -114 21 -805 23 -396 1 -742 0 -770 -2z"/>
</g>
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link onClick={() => setSidebarOpen(false)}  href="/users/activity" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/users/activity") && "bg-graydark dark:bg-meta-4"}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 715.000000 806.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,806.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M1790 8050 c-85 -18 -136 -56 -171 -127 -24 -48 -24 -50 -27 -454 l-3 -407 -312 -5 c-331 -6 -378 -11 -519 -62 -149 -54 -255 -122 -370 -237 -149 -151 -237 -319 -279 -533 -21 -104 -21 -5226 0 -5330 42 -216 133 -388 283 -537 151 -149 319 -237 533 -279 104 -21 5226 -21 5330 0 214 42 382 130 533 279 150 149 241 321 283 537 21 104 21 5226 0 5330 -42 214 -130 382 -279 533 -115 115 -221 183 -370 237 -141 51 -188 56 -519 62 l-312 5 -3 407 c-3 355 -6 411 -20 442 -44 94 -121 142 -228 141 -105 0 -178 -43 -221 -129 -24 -48 -24 -50 -27 -455 l-3 -408 -1499 0 -1499 0 -3 408 c-3 405 -3 407 -27 455 -25 51 -66 90 -115 111 -43 18 -114 25 -156 16z m4435 -1505 c116 -30 200 -87 274 -185 78 -105 85 -142 89 -492 l3 -308 -3001 0 -3001 0 3 308 c3 286 5 311 26 372 37 108 136 221 237 270 106 51 -46 49 2730 49 2295 1 2587 -1 2640 -14z m363 -3547 l-3 -2063 -22 -57 c-56 -148 -174 -256 -323 -297 -74 -21 -78 -21 -2650 -21 -2572 0 -2576 0 -2650 21 -149 41 -267 149 -323 297 l-22 57 -3 2063 -2 2062 3000 0 3000 0 -2 -2062z"/>
</g>
                  </svg>
                  Submit Activity
                </Link>
              </li>
              <SidebarLinkGroup activeCondition={ pathname === "/funnel" || pathname.includes("funnel")}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <div
                        className={`cursor-pointer group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === "/funnel" ||
                            pathname.includes("funnel")) &&
                          "bg-graydark dark:bg-meta-4"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 660.000000 575.000000"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                         <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,575.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M512 5699 c-146 -19 -309 -144 -383 -294 -33 -67 -34 -73 -34 -190 0 -137 9 -176 62 -262 21 -34 559 -691 1196 -1459 l1157 -1398 0 -537 c0 -360 4 -556 11 -591 14 -65 49 -136 90 -182 36 -42 784 -622 855 -664 133 -78 274 -87 407 -24 74 35 155 106 191 166 57 97 56 87 56 996 l0 836 1158 1398 c636 768 1174 1425 1195 1459 42 69 55 106 66 192 21 155 -31 295 -152 413 -88 85 -168 127 -272 142 -85 12 -5508 12 -5603 -1z m5599 -429 c62 -61 138 40 -1165 -1543 -655 -795 -1197 -1458 -1205 -1474 -14 -25 -17 -135 -21 -908 l-5 -880 -22 0 c-13 0 -167 114 -402 299 l-381 299 -1 571 c0 417 -3 580 -12 603 -7 18 -547 682 -1202 1477 -655 795 -1194 1456 -1199 1470 -12 32 9 83 43 101 22 12 421 14 2784 15 l2759 0 29 -30z"/>
</g>
                        </svg>
                        Funnel
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </div>
                      {/* <!-- Dropdown Menu Start --> */}
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/funnel/add"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/funnel/add" &&
                                "text-white"
                              }`}
                            >
                              Add
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/funnel/report"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/funnel/report" &&
                                "text-white"
                              } `}
                            >
                              Report
                            </Link>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/users/support" || pathname.includes("support")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <div
                        className={`cursor-pointer group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === "/users/support" ||
                            pathname.includes("support")) &&
                          "bg-graydark dark:bg-meta-4"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 840.000000 805.000000"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,805.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3740 8030 c-826 -100 -1491 -380 -2108 -887 l-102 -84 -111 101 c-133 120 -173 144 -249 144 -134 1 -268 -148 -245 -273 11 -60 41 -105 145 -220 l102 -111 -70 -83 c-205 -244 -385 -520 -527 -812 -202 -415 -321 -840 -381 -1365 -22 -195 -22 -565 0 -760 98 -857 377 -1530 893 -2157 l84 -103 -101 -111 c-120 -132 -144 -173 -144 -249 -1 -134 148 -268 273 -245 60 11 106 41 221 146 l111 101 87 -74 c459 -389 974 -653 1559 -798 664 -164 1322 -164 1986 0 585 145 1100 409 1559 798 l87 74 111 -101 c115 -105 161 -135 221 -146 125 -23 274 111 273 245 0 76 -24 117 -144 250 l-101 111 89 107 c407 492 659 999 797 1607 131 577 143 1099 40 1660 -129 700 -407 1292 -853 1817 l-74 87 101 112 c105 115 135 160 146 220 23 125 -111 274 -245 273 -76 0 -116 -24 -249 -144 l-111 -101 -102 84 c-261 214 -502 370 -793 512 -412 201 -849 323 -1357 380 -192 21 -624 19 -818 -5z m800 -496 c600 -68 1152 -270 1615 -592 98 -68 305 -231 305 -240 0 -4 -319 -326 -709 -716 l-708 -708 -57 36 c-397 254 -886 309 -1329 149 -86 -30 -225 -99 -303 -149 l-57 -36 -708 708 c-390 390 -709 712 -709 716 0 3 51 46 113 95 578 459 1227 702 2017 757 99 7 392 -4 530 -20z m-2297 -1892 l709 -709 -35 -54 c-230 -360 -297 -790 -188 -1214 33 -128 108 -297 187 -421 l36 -57 -708 -708 c-390 -390 -712 -709 -716 -709 -9 0 -172 207 -240 305 -393 565 -611 1275 -611 1985 0 710 218 1420 611 1985 68 98 231 305 240 305 4 0 326 -319 715 -708z m4664 596 c107 -135 181 -241 256 -365 324 -535 500 -1174 500 -1813 0 -710 -218 -1420 -611 -1985 -68 -98 -231 -305 -240 -305 -4 0 -326 319 -715 708 l-709 709 35 54 c78 123 156 297 188 424 80 312 67 616 -38 908 -31 87 -114 255 -156 316 l-30 43 709 709 c390 390 712 709 716 709 3 0 46 -51 95 -112z m-2610 -1189 c140 -19 310 -85 433 -169 80 -55 204 -174 254 -244 123 -172 180 -357 180 -576 0 -283 -99 -519 -296 -706 -171 -162 -370 -258 -595 -285 -390 -48 -817 186 -995 546 -74 148 -102 272 -102 445 0 285 100 523 301 710 95 89 171 141 277 190 186 87 355 115 543 89z m-954 -2238 c59 -40 229 -124 314 -154 333 -120 693 -120 1026 0 87 31 255 114 316 156 l43 30 709 -709 c390 -390 709 -712 709 -716 0 -9 -207 -172 -305 -240 -565 -393 -1275 -611 -1985 -611 -710 0 -1420 218 -1985 611 -97 68 -305 231 -305 240 0 7 1412 1422 1418 1422 2 0 22 -13 45 -29z"/>
</g>
                        </svg>
                        Support
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </div>
                      {/* <!-- Dropdown Menu Start --> */}
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/support/add"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/support/add" &&
                                "text-white"
                              }`}
                            >
                              Add
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/support/report"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/support/report" &&
                                "text-white"
                              } `}
                            >
                              Report
                            </Link>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/users/reports" || pathname.includes("reports")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <div
                        className={`cursor-pointer group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === "/reports" ||
                            pathname.includes("reports")) &&
                          "bg-graydark dark:bg-meta-4"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                    className="fill-current"
                    width="18"
                    height="19"
                    viewBox="0 0 830.000000 733.000000"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,733.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M370 7150 c-85 -18 -136 -56 -171 -127 l-24 -48 0 -2855 0 -2855 22 -100 c31 -141 57 -216 113 -326 124 -246 293 -415 540 -540 109 -55 185 -81 325 -112 l100 -22 3355 0 c3147 0 3357 1 3391 17 94 44 142 121 142 228 0 107 -48 184 -142 228 -34 16 -249 17 -3376 22 l-3340 5 -90 28 c-259 81 -420 240 -509 501 l-31 91 -5 2845 -5 2845 -24 48 c-25 51 -66 90 -115 111 -43 18 -114 25 -156 16z"/>
<path d="M2370 5650 c-125 -27 -193 -111 -193 -240 0 -107 48 -184 142 -228 34 -16 158 -17 1851 -17 l1815 0 48 24 c86 43 129 116 129 221 0 105 -43 178 -129 221 l-48 24 -1790 1 c-984 1 -1806 -2 -1825 -6z"/>
<path d="M2370 4150 c-125 -27 -193 -111 -193 -240 0 -107 48 -184 142 -228 33 -16 130 -17 1351 -17 1449 0 1342 -5 1418 60 100 84 100 286 0 370 -76 64 27 60 -1393 61 -710 1 -1306 -1 -1325 -6z"/>
<path d="M2370 2650 c-125 -27 -193 -111 -193 -240 0 -107 48 -184 142 -228 34 -16 186 -17 2351 -17 l2315 0 48 24 c86 43 129 116 129 221 0 105 -43 178 -129 221 l-48 24 -2290 1 c-1259 1 -2306 -2 -2325 -6z"/>
</g>
                  </svg>
                        Reports
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </div>

                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/reports/activity"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/reports/activity" &&
                                "text-white"
                              }`}
                            >
                              Activity
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/reports/scores"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/reports/scores" &&
                                "text-white"
                              } `}
                            >
                              Scores
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/reports/conveyance"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/report/conveyance" &&
                                "text-white"
                              } `}
                            >
                              Conveyance
                            </Link>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/users/sla" || pathname.includes("sla")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <div
                        className={`cursor-pointer group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === "/users/sla" ||
                            pathname.includes("sla")) &&
                          "bg-graydark dark:bg-meta-4"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 766.000000 755.000000"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,755.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M975 7511 c-82 -21 -126 -59 -452 -385 -287 -286 -336 -339 -357 -388 -47 -107 -44 -202 11 -311 20 -40 1085 -1435 1202 -1575 47 -55 121 -98 195 -111 38 -7 238 -11 540 -11 l481 0 742 -742 742 -742 -39 -70 c-89 -163 -128 -306 -137 -501 -5 -110 -2 -161 11 -232 38 -205 123 -383 267 -558 31 -38 430 -442 886 -896 889 -886 869 -868 1002 -899 68 -16 164 -16 232 0 129 30 139 38 680 579 540 540 550 552 585 685 31 114 10 255 -53 361 -27 45 -238 262 -852 878 -449 450 -850 847 -891 881 -94 79 -173 129 -275 176 -169 78 -280 103 -470 103 -201 0 -379 -45 -551 -140 l-66 -36 -744 744 -744 744 0 505 c0 542 -2 560 -52 633 -13 18 -41 49 -63 69 -106 94 -1542 1190 -1591 1214 -44 21 -73 28 -133 30 -42 2 -89 0 -106 -5z m904 -1111 l580 -445 0 -378 1 -377 -382 2 -382 3 -530 688 -529 689 218 218 218 218 113 -86 c62 -48 374 -287 693 -532z m3279 -3126 c42 -9 115 -34 162 -57 l85 -41 855 -853 855 -853 -465 -465 -465 -465 -851 852 -851 853 -46 95 c-53 109 -69 179 -69 295 0 116 17 186 70 294 130 266 422 406 720 345z"/>
<path d="M4925 7500 c-172 -27 -245 -44 -381 -88 -378 -126 -705 -330 -974 -609 -104 -107 -263 -308 -258 -325 2 -4 84 -71 183 -147 l180 -140 20 23 c11 12 49 59 84 104 76 99 250 271 346 344 263 200 531 314 856 363 121 19 403 21 524 5 44 -6 102 -14 128 -17 26 -3 46 -10 45 -15 -2 -5 -166 -172 -364 -371 -423 -425 -454 -465 -516 -675 -21 -72 -23 -94 -23 -342 0 -243 2 -271 22 -342 30 -102 63 -169 123 -249 99 -131 264 -245 410 -280 78 -20 593 -20 670 0 68 17 202 78 267 122 26 18 215 198 419 401 330 328 372 367 377 346 25 -98 39 -286 34 -458 -11 -376 -86 -623 -288 -952 -103 -167 -285 -363 -451 -486 l-97 -71 117 -114 c64 -62 143 -137 174 -166 l57 -53 79 60 c177 135 365 337 500 537 347 516 467 1123 346 1750 -41 212 -142 485 -214 583 -26 35 -110 82 -147 82 -12 0 -48 -10 -80 -21 -55 -20 -89 -53 -578 -539 -341 -340 -534 -525 -562 -539 -39 -20 -58 -21 -276 -21 -254 0 -297 7 -350 56 -15 13 -37 44 -50 67 -21 40 -22 52 -22 282 0 178 4 250 14 280 11 32 120 147 537 565 561 563 563 566 564 666 0 55 -25 103 -78 149 -60 53 -358 165 -542 204 -260 56 -584 68 -825 31z"/>
<path d="M1464 3038 c-1165 -1167 -1142 -1142 -1233 -1339 -191 -415 -92 -961 234 -1284 95 -94 206 -173 307 -219 332 -150 684 -158 986 -20 167 76 218 120 752 645 278 274 637 630 799 793 l295 295 -36 83 c-53 122 -76 196 -101 324 l-22 114 -880 -879 -880 -878 -95 -46 c-115 -55 -184 -71 -315 -71 -128 1 -200 16 -302 66 -332 161 -457 562 -286 918 l45 95 1074 1075 1074 1075 -168 168 -167 167 -1081 -1082z"/>
<path d="M1370 1580 c-125 -24 -201 -127 -187 -252 15 -123 103 -201 227 -201 124 0 212 78 227 201 18 154 -116 281 -267 252z"/>
</g>
                  </svg>
                        AMC
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </div>
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/sla/entry"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/sla/entry" &&
                                "text-white"
                              }`}
                            >
                              Entry
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/users/sla/report"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/users/sla/report" &&
                                "text-white"
                              } `}
                            >
                              Report
                            </Link>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              <li>
                <Link onClick={() => setSidebarOpen(false)} href="/users/salary" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/users/salary") && "bg-graydark dark:bg-meta-4"}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 613.000000 816.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,816.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M1015 8074 c-273 -33 -463 -121 -637 -296 -149 -151 -237 -319 -279 -533 -21 -104 -21 -6226 0 -6330 42 -216 133 -388 283 -537 151 -149 319 -237 533 -279 104 -21 4226 -21 4330 0 214 42 382 130 533 279 150 149 241 321 283 537 20 100 21 4667 1 4762 -16 78 -54 171 -99 242 -23 37 -370 391 -1021 1042 l-987 986 -95 47 c-174 86 -52 79 -1515 82 -715 1 -1313 0 -1330 -2z m2068 -1416 c4 -1040 -1 -981 82 -1153 100 -208 234 -318 485 -398 63 -20 88 -21 998 -24 l932 -4 0 -2037 c0 -2200 3 -2088 -50 -2197 -51 -104 -164 -202 -275 -238 l-70 -22 -2105 0 -2105 0 -70 22 c-111 36 -224 134 -275 238 -53 110 -50 -96 -48 3255 l3 3095 22 65 c38 108 137 221 238 270 103 50 78 49 1192 49 l1042 1 4 -922z m568 872 c57 -38 1889 -1875 1912 -1918 l18 -33 -908 3 c-896 3 -909 3 -953 24 -25 11 -59 37 -77 57 -65 74 -63 49 -63 1019 0 723 2 878 13 878 8 0 33 -13 58 -30z"/>
<path d="M1280 7070 c-126 -27 -193 -111 -193 -240 0 -107 48 -184 142 -228 33 -15 88 -17 601 -17 618 0 594 -2 668 60 100 84 100 286 0 370 -73 62 -53 60 -643 61 -297 1 -556 -1 -575 -6z"/>
<path d="M1280 6070 c-126 -27 -193 -111 -193 -240 0 -107 48 -184 142 -228 33 -15 88 -17 601 -17 618 0 594 -2 668 60 100 84 100 286 0 370 -73 62 -53 60 -643 61 -297 1 -556 -1 -575 -6z"/>
<path d="M3020 4503 c-72 -18 -118 -56 -155 -128 -28 -54 -30 -68 -33 -185 l-4 -127 -56 -12 c-86 -19 -186 -57 -299 -113 -213 -105 -332 -265 -378 -509 -14 -76 -14 -93 -1 -156 57 -268 165 -390 464 -520 174 -75 328 -123 491 -153 91 -16 324 -96 404 -137 37 -20 82 -52 98 -72 28 -33 30 -41 27 -94 -5 -69 -30 -100 -114 -141 -107 -53 -195 -70 -354 -69 -168 0 -275 20 -554 103 -235 70 -311 66 -393 -17 -68 -71 -90 -170 -58 -265 40 -116 174 -178 570 -263 66 -14 127 -28 136 -31 14 -4 17 -26 20 -148 4 -136 6 -146 34 -202 24 -47 41 -65 83 -90 91 -55 173 -55 264 0 42 25 59 43 83 90 28 55 30 67 33 197 l4 137 67 13 c36 7 102 25 146 41 229 84 379 202 453 358 75 160 92 303 53 457 -41 164 -144 310 -272 389 -101 61 -389 168 -549 204 -30 7 -64 18 -75 24 -11 7 -47 18 -80 25 -96 21 -282 79 -349 110 -35 16 -82 45 -105 66 -35 32 -41 43 -41 78 0 37 6 47 53 92 61 57 132 85 281 111 140 25 326 9 604 -50 137 -30 226 -14 296 52 53 51 76 104 76 180 0 101 -42 172 -125 211 -51 24 -241 72 -358 91 l-77 13 0 106 c0 185 -40 278 -137 318 -68 29 -110 33 -173 16z"/>
</g>
                  </svg>
                  
                  Salary Slip
                </Link>
              </li>

              {session.user.admin && (
                  <li>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("calendar") && "bg-graydark dark:bg-meta-4"}`}>
                    <svg className="fill-current" width="18" height="18" viewBox="0 0 767.000000 787.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,787.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3760 7846 c-52 -12 -3013 -1262 -3131 -1321 -241 -122 -437 -377 -495 -645 -32 -146 -27 -532 11 -880 30 -270 108 -694 195 -1055 199 -827 566 -1586 1132 -2348 445 -598 1054 -1102 1829 -1515 160 -85 136 -82 559 -82 423 0 400 -3 560 82 536 287 1011 629 1374 993 240 240 426 468 638 780 414 611 690 1182 871 1805 113 388 231 969 272 1340 38 348 43 734 11 880 -59 271 -254 523 -502 648 -134 68 -3073 1306 -3129 1318 -73 16 -123 16 -195 0z m1300 -1261 c641 -273 1281 -547 1422 -607 352 -150 378 -175 378 -364 0 -553 -164 -1439 -381 -2046 -212 -597 -635 -1341 -976 -1720 -108 -120 -339 -350 -443 -442 -266 -234 -579 -448 -970 -662 l-145 -79 -85 0 -85 0 -135 74 c-528 289 -872 543 -1226 903 -186 189 -236 245 -347 391 -309 402 -645 1027 -826 1535 -189 530 -332 1229 -371 1806 -21 327 -14 376 61 447 45 43 97 67 626 293 318 136 961 411 1428 611 607 260 859 363 880 361 17 -2 554 -227 1195 -501z"/>
</g>
                    </svg>
                    Admin
                  </Link>
                </li>
                )
              }

              {isGroupHead && (
                  <li>
                  <Link onClick={() => setSidebarOpen(false)} href="/group" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("calendar") && "bg-graydark dark:bg-meta-4"}`}>
                    <svg className="fill-current" width="18" height="18" viewBox="0 0 767.000000 787.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,787.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3760 7846 c-52 -12 -3013 -1262 -3131 -1321 -241 -122 -437 -377 -495 -645 -32 -146 -27 -532 11 -880 30 -270 108 -694 195 -1055 199 -827 566 -1586 1132 -2348 445 -598 1054 -1102 1829 -1515 160 -85 136 -82 559 -82 423 0 400 -3 560 82 536 287 1011 629 1374 993 240 240 426 468 638 780 414 611 690 1182 871 1805 113 388 231 969 272 1340 38 348 43 734 11 880 -59 271 -254 523 -502 648 -134 68 -3073 1306 -3129 1318 -73 16 -123 16 -195 0z m1300 -1261 c641 -273 1281 -547 1422 -607 352 -150 378 -175 378 -364 0 -553 -164 -1439 -381 -2046 -212 -597 -635 -1341 -976 -1720 -108 -120 -339 -350 -443 -442 -266 -234 -579 -448 -970 -662 l-145 -79 -85 0 -85 0 -135 74 c-528 289 -872 543 -1226 903 -186 189 -236 245 -347 391 -309 402 -645 1027 -826 1535 -189 530 -332 1229 -371 1806 -21 327 -14 376 61 447 45 43 97 67 626 293 318 136 961 411 1428 611 607 260 859 363 880 361 17 -2 554 -227 1195 -501z"/>
</g>
                    </svg>
                    Group Dashboard
                  </Link>
                </li>
                )
              }
              
              <li>
                <button onClick={() => signOut({ callbackUrl: 'http://localhost:3000/' })} className={`bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600 flex justify-center rounded w-full p-3 font-medium text-gray hover:bg-opacity-90"}`}>
                  Logout
                </button>
              </li>
              
              
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default UserSidebar;
