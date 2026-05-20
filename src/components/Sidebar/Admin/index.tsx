"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarLinkGroup from "../SidebarLinkGroup";
import { signOut } from "next-auth/react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

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
      {/* <!-- SIDEBAR HEADER --> */}
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
                <Link onClick={() => setSidebarOpen(false)} href="/users" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("calendar") && "bg-graydark dark:bg-meta-4"}`}>
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
                <Link onClick={() => setSidebarOpen(false)} href="/admin" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("calendar") && "bg-graydark dark:bg-meta-4"}`}>
                <svg className="fill-current" width="18" height="18" viewBox="0 0 767.000000 787.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,787.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3760 7846 c-52 -12 -3013 -1262 -3131 -1321 -241 -122 -437 -377 -495 -645 -32 -146 -27 -532 11 -880 30 -270 108 -694 195 -1055 199 -827 566 -1586 1132 -2348 445 -598 1054 -1102 1829 -1515 160 -85 136 -82 559 -82 423 0 400 -3 560 82 536 287 1011 629 1374 993 240 240 426 468 638 780 414 611 690 1182 871 1805 113 388 231 969 272 1340 38 348 43 734 11 880 -59 271 -254 523 -502 648 -134 68 -3073 1306 -3129 1318 -73 16 -123 16 -195 0z m1300 -1261 c641 -273 1281 -547 1422 -607 352 -150 378 -175 378 -364 0 -553 -164 -1439 -381 -2046 -212 -597 -635 -1341 -976 -1720 -108 -120 -339 -350 -443 -442 -266 -234 -579 -448 -970 -662 l-145 -79 -85 0 -85 0 -135 74 c-528 289 -872 543 -1226 903 -186 189 -236 245 -347 391 -309 402 -645 1027 -826 1535 -189 530 -332 1229 -371 1806 -21 327 -14 376 61 447 45 43 97 67 626 293 318 136 961 411 1428 611 607 260 859 363 880 361 17 -2 554 -227 1195 -501z"/>
</g>
                    </svg>
                  Admin 
                </Link>
              </li>
              <li>
                <Link onClick={() => setSidebarOpen(false)} href="/admin/funnel" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/admin/funnel") && "bg-graydark dark:bg-meta-4"}`}>
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
                  Team Funnel
                </Link>
              </li>
              <li>
                <Link onClick={() => setSidebarOpen(false)} href="/admin/support" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/admin/support") && "bg-graydark dark:bg-meta-4"}`}>
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
                  Team Support
                </Link>
              </li>

              <li>
                <Link onClick={() => setSidebarOpen(false)} href="/admin/tasks" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/admin/tasks") && "bg-graydark dark:bg-meta-4"}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 875.000000 726.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,726.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M2377 7030 c-49 -13 -112 -45 -164 -85 -22 -17 -234 -246 -469 -508 l-429 -476 -190 188 c-161 159 -201 193 -260 222 -64 31 -77 34 -160 34 -82 0 -97 -3 -157 -33 -114 -56 -184 -148 -210 -277 -13 -67 -1 -138 38 -222 23 -49 79 -111 378 -409 379 -380 395 -393 519 -414 104 -19 221 17 309 93 71 62 1159 1282 1188 1332 41 72 64 165 55 230 -8 64 -51 156 -98 211 -75 85 -244 140 -350 114z"/>
<path d="M3600 6394 c-66 -18 -148 -70 -184 -117 -49 -63 -78 -154 -78 -237 0 -128 57 -240 155 -305 106 -70 -64 -66 2363 -63 l2189 3 65 31 c108 51 141 88 193 214 12 30 18 70 18 120 0 50 -6 90 -18 120 -52 126 -85 163 -193 214 l-65 31 -2195 2 c-1907 2 -2202 0 -2250 -13z"/>
<path d="M2377 4530 c-49 -13 -112 -45 -164 -85 -22 -17 -234 -246 -469 -508 l-429 -476 -190 188 c-161 159 -201 193 -260 222 -64 31 -77 34 -160 34 -82 0 -97 -3 -157 -33 -114 -56 -184 -148 -210 -277 -13 -67 -1 -138 38 -222 23 -49 79 -111 378 -409 379 -380 395 -393 519 -414 104 -19 221 17 309 93 71 62 1159 1282 1188 1332 41 72 64 165 55 230 -8 64 -51 156 -98 211 -75 85 -244 140 -350 114z"/>
<path d="M3600 3894 c-66 -18 -148 -70 -184 -117 -49 -63 -78 -154 -78 -237 0 -128 57 -240 155 -305 106 -70 -64 -66 2363 -63 l2189 3 65 31 c108 51 141 88 193 214 12 30 18 70 18 120 0 50 -6 90 -18 120 -52 126 -85 163 -193 214 l-65 31 -2195 2 c-1907 2 -2202 0 -2250 -13z"/>
<path d="M1215 1528 c-178 -34 -331 -187 -371 -371 -71 -330 159 -619 490 -617 251 2 453 175 488 420 40 271 -119 511 -375 566 -71 15 -159 16 -232 2z"/>
<path d="M3100 1394 c-66 -18 -148 -70 -184 -117 -49 -63 -78 -154 -78 -237 0 -128 57 -240 155 -305 106 -70 -91 -65 2613 -63 l2439 3 65 31 c108 51 141 88 193 214 12 30 18 70 18 120 0 50 -6 90 -18 120 -52 126 -85 163 -193 214 l-65 31 -2445 2 c-2127 2 -2452 0 -2500 -13z"/>
</g>
                  </svg>
                  Assign Tasks
                </Link>
              </li>
              
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/admin/reports" || pathname.includes("reports")
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
                              href="/admin/reports/activity"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/reports/activity" &&
                                "text-white"
                              }`}
                            >
                              Activity
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/admin/reports/scores"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/reports/scores" &&
                                "text-white"
                              } `}
                            >
                              Scores
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/admin/reports/conveyance"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/report/conveyance" &&
                                "text-white"
                              } `}
                            >
                              Conveyance
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/admin/reports/tasks"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/reports/tasks" &&
                                "text-white"
                              } `}
                            >
                              Tasks
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
                <Link onClick={() => setSidebarOpen(false)} href="/admin/customers" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/admin/customers") && "bg-graydark dark:bg-meta-4"}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 728.000000 812.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,812.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3280 8079 c-680 -31 -1326 -141 -1816 -310 -702 -241 -1130 -546 -1282 -911 -66 -159 -63 12 -60 -2808 3 -2458 4 -2557 22 -2620 121 -423 550 -754 1320 -1019 513 -177 1135 -280 1886 -312 816 -35 1779 89 2423 311 764 263 1196 593 1318 1005 l24 80 0 2595 0 2595 -24 80 c-91 310 -348 564 -801 791 -616 308 -1388 480 -2360 524 -250 11 -390 11 -650 -1z m705 -499 c734 -39 1307 -151 1810 -352 455 -183 700 -351 801 -549 l24 -48 0 -569 0 -569 -52 -35 c-295 -195 -822 -373 -1450 -492 -882 -167 -2114 -167 -2996 0 -628 119 -1155 297 -1449 492 l-53 35 0 571 0 571 30 54 c16 29 44 72 62 95 36 47 161 153 234 199 181 112 501 256 759 340 610 199 1495 299 2280 257z m-3200 -2750 c475 -208 1228 -382 1946 -449 346 -32 906 -47 1264 -32 1066 43 1873 206 2528 510 48 23 90 41 92 41 3 0 5 -317 5 -704 l0 -703 -52 -35 c-295 -195 -822 -373 -1450 -492 -882 -167 -2114 -167 -2996 0 -401 75 -793 182 -1057 286 -118 47 -283 132 -377 195 l-68 46 0 704 c0 560 3 704 13 700 6 -3 75 -33 152 -67z m0 -2000 c475 -208 1228 -382 1946 -449 346 -32 906 -47 1264 -32 1066 43 1873 206 2528 510 48 23 90 41 92 41 3 0 5 -304 5 -675 0 -769 9 -690 -92 -827 -183 -249 -738 -511 -1379 -653 -542 -120 -1290 -177 -1894 -145 -1035 56 -1784 249 -2310 595 -148 98 -244 196 -301 307 l-24 47 0 677 c0 537 3 675 13 671 6 -3 75 -33 152 -67z"/>
</g>
                  </svg>
                  Customer Database
                </Link>
              </li>

              <SidebarLinkGroup
                activeCondition={
                  pathname === "/admin/staffs" || pathname.includes("reports")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <div
                        className={`cursor-pointer group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === "/admin/salary" ||
                            pathname.includes("/admin/salary")) &&
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
                    viewBox="0 0 847.000000 727.000000"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,727.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M1490 7090 c-325 -33 -607 -167 -841 -400 -201 -199 -314 -412 -382 -718 l-22 -97 0 -2275 0 -2275 22 -97 c68 -307 181 -518 383 -719 205 -204 412 -314 716 -382 l99 -22 2775 0 2775 0 97 22 c310 69 519 181 722 387 205 209 311 407 379 712 l22 99 0 1525 0 1525 -22 99 c-68 304 -178 511 -382 716 -201 202 -412 315 -719 383 l-97 22 -2475 0 c-2378 0 -2477 -1 -2535 -18 -195 -60 -301 -264 -241 -463 33 -110 115 -195 229 -239 51 -20 83 -20 2522 -25 1890 -4 2480 -9 2512 -18 168 -48 341 -200 416 -366 48 -104 47 -85 47 -1616 0 -1531 1 -1512 -47 -1616 -61 -135 -202 -276 -337 -337 -107 -49 10 -47 -2866 -47 -2876 0 -2759 -2 -2866 47 -135 61 -276 202 -337 337 -49 106 -47 28 -47 2366 0 2338 -2 2260 47 2366 61 135 202 276 336 337 94 43 -9 41 3092 47 2940 5 2971 5 3022 25 114 44 196 129 229 239 59 194 -37 387 -229 461 -52 20 -77 20 -2987 21 -1614 1 -2969 -2 -3010 -6z"/>
<path d="M6125 3338 c-178 -34 -331 -187 -371 -371 -71 -330 159 -619 490 -617 251 2 453 175 488 420 40 271 -119 511 -375 566 -71 15 -159 16 -232 2z"/>
</g>
                  </svg>
                        Salary
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
                              href="/admin/salary/report"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/salary/report" &&
                                "text-white"
                              }`}
                            >
                              Report
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/admin/salary/add"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/salary/add" &&
                                "text-white"
                              } `}
                            >
                              Add 
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>


              <SidebarLinkGroup
                activeCondition={
                  pathname === "/admin/staffs" || pathname.includes("/admin/staffs")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <div
                        className={`cursor-pointer group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === "/admin/staffs" ||
                            pathname.includes("/admin/staffs")) &&
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
                    viewBox="0 0 1060.000000 841.000000"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,841.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3770 8294 c-19 -2 -78 -9 -130 -15 -830 -94 -1540 -757 -1700 -1587 -101 -523 0 -1050 285 -1482 332 -503 846 -821 1445 -895 962 -118 1885 499 2155 1440 99 346 95 771 -10 1123 -157 524 -548 983 -1038 1217 -202 97 -376 151 -578 180 -105 15 -365 27 -429 19z m345 -509 c320 -45 598 -188 841 -430 222 -222 357 -474 421 -790 27 -135 24 -415 -5 -551 -67 -311 -196 -548 -417 -769 -226 -226 -473 -360 -780 -422 -126 -25 -424 -25 -550 0 -308 62 -553 195 -780 422 -221 221 -350 458 -417 769 -29 136 -32 416 -5 551 64 316 199 568 421 790 203 203 424 331 688 401 164 43 402 55 583 29z"/>
<path d="M7424 5070 c-107 -22 -205 -104 -241 -201 -12 -30 -26 -92 -32 -139 -20 -153 -86 -249 -211 -308 -46 -22 -69 -26 -140 -26 -75 0 -94 4 -166 36 -154 67 -245 73 -346 22 -97 -49 -128 -93 -357 -508 -117 -213 -220 -408 -228 -434 -9 -30 -13 -73 -10 -118 5 -92 41 -159 121 -228 153 -131 189 -183 205 -301 20 -142 -19 -255 -121 -350 -35 -31 -84 -77 -109 -100 -91 -85 -121 -206 -81 -332 17 -55 377 -698 453 -808 73 -109 155 -158 264 -158 78 -1 110 8 239 65 81 37 94 40 160 36 86 -4 164 -39 227 -101 57 -57 88 -127 99 -231 22 -189 93 -286 240 -330 80 -24 940 -24 1020 0 147 44 218 141 240 330 11 104 42 174 99 231 63 62 141 97 227 101 66 4 79 1 160 -36 128 -57 161 -66 239 -66 58 0 81 5 128 28 107 52 134 89 361 499 114 208 217 405 227 438 45 145 8 266 -111 363 -84 69 -141 131 -166 182 -33 68 -46 162 -33 242 18 117 54 168 205 298 80 69 116 136 121 228 3 45 -1 88 -10 118 -8 26 -111 221 -228 434 -229 415 -260 459 -357 508 -101 51 -195 45 -347 -22 -71 -32 -90 -36 -165 -37 -72 0 -94 4 -140 26 -125 60 -191 156 -211 309 -22 168 -81 261 -202 316 l-62 29 -460 2 c-253 1 -479 -2 -501 -7z m761 -557 c40 -149 153 -327 261 -414 103 -83 209 -139 331 -175 118 -35 305 -38 428 -6 61 16 83 18 91 9 16 -18 274 -446 274 -455 0 -5 -12 -19 -26 -33 -47 -42 -138 -172 -176 -249 -66 -134 -83 -213 -83 -390 0 -134 3 -165 23 -228 36 -113 106 -241 188 -341 l75 -91 -137 -235 c-75 -130 -139 -237 -143 -239 -3 -2 -47 7 -96 21 -73 20 -113 25 -215 25 -150 1 -245 -21 -357 -82 -216 -116 -357 -285 -432 -515 l-26 -80 -265 0 -265 0 -26 80 c-94 291 -307 504 -576 577 -117 31 -306 29 -428 -5 -69 -20 -93 -23 -101 -14 -19 20 -254 455 -254 470 0 8 9 22 21 33 72 65 190 276 225 404 29 102 27 349 -4 455 -38 133 -118 276 -214 380 -26 29 -48 55 -48 59 0 8 260 438 274 453 8 9 30 7 91 -9 113 -29 308 -29 420 1 306 81 529 307 605 614 l12 47 268 0 267 0 18 -67z"/>
<path d="M7730 3660 c-183 -38 -324 -115 -451 -247 -271 -280 -326 -676 -142 -1025 71 -136 226 -285 368 -356 521 -259 1142 45 1250 613 72 374 -121 767 -462 939 -178 89 -374 116 -563 76z m265 -502 c184 -46 308 -240 270 -422 -35 -166 -135 -266 -301 -301 -53 -11 -75 -11 -128 0 -167 35 -266 134 -301 301 -31 150 51 321 187 390 94 48 173 57 273 32z"/>
<path d="M2995 3539 c-141 -11 -369 -49 -523 -88 -456 -114 -906 -369 -1247 -706 -224 -223 -393 -459 -535 -750 -165 -338 -251 -675 -281 -1093 -17 -247 10 -339 136 -461 79 -77 146 -114 235 -131 62 -12 6054 -14 6048 -2 -1 4 -20 41 -40 82 -41 84 -63 163 -73 262 l-6 67 -57 -25 c-228 -101 -472 -80 -701 61 l-73 45 -2490 0 -2490 0 7 98 c46 658 341 1232 840 1635 339 273 673 417 1150 494 85 14 229 17 950 20 1001 5 1113 -1 1384 -76 55 -16 97 -23 94 -17 -4 6 -24 35 -45 64 -76 109 -128 279 -128 418 0 74 15 65 -160 91 -100 14 -234 17 -1000 19 -487 1 -934 -2 -995 -7z"/>
</g>
                  </svg>
                        Staffs Management
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
                              href="/admin/staffs/manage"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/staffs/manage" &&
                                "text-white"
                              }`}
                            >
                              Manage
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/admin/staffs/add"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/staffs/add" &&
                                "text-white"
                              } `}
                            >
                              Add 
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

<SidebarLinkGroup
                activeCondition={
                  pathname === "/admin/group" || pathname.includes("group")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <div
                        className={`cursor-pointer group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === "/admin/group/add" ||
                            pathname.includes("/admin/salary")) &&
                          "bg-graydark dark:bg-meta-4"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                         <svg className="fill-current" width="18" height="18" viewBox="0 0 767.000000 810.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,810.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3740 8089 c-466 -41 -896 -243 -1230 -578 -179 -180 -290 -336 -396 -556 -134 -278 -187 -522 -187 -855 0 -334 53 -576 188 -856 214 -448 604 -817 1052 -995 253 -101 476 -143 753 -143 277 0 500 42 753 143 448 178 838 547 1052 995 135 280 188 522 188 856 0 333 -53 577 -187 855 -106 220 -217 376 -396 556 -284 285 -614 463 -1008 544 -198 41 -382 51 -582 34z m385 -504 c355 -54 647 -208 893 -471 512 -546 537 -1373 61 -1960 -545 -671 -1545 -741 -2173 -152 -262 244 -423 550 -471 888 -80 576 174 1133 670 1467 282 190 680 279 1020 228z"/>
<path d="M3095 3344 c-477 -33 -903 -154 -1260 -357 -784 -445 -1289 -1213 -1388 -2112 -45 -404 -28 -493 123 -640 74 -70 143 -109 230 -125 77 -15 6166 -14 6245 1 84 15 150 52 226 126 78 75 123 153 139 242 19 105 -4 387 -51 631 -123 635 -475 1223 -969 1617 -418 332 -857 517 -1415 595 -141 20 -198 21 -990 23 -462 1 -862 1 -890 -1z m1867 -522 c421 -71 741 -205 1057 -443 109 -82 305 -273 392 -382 309 -386 466 -793 504 -1310 l7 -87 -3002 0 -3002 0 7 88 c46 620 279 1123 708 1526 176 165 319 269 517 374 248 132 572 224 885 252 50 4 475 7 945 6 823 -2 860 -3 982 -24z"/>
</g>
                  </svg>
                        Group Management
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
                              href="/admin/groups/manage"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/salary/report" &&
                                "text-white"
                              }`}
                            >
                              Manage
                            </Link>
                          </li>
                          <li>
                            <Link onClick={() => setSidebarOpen(false)}
                              href="/admin/groups/add"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === "/admin/salary/add" &&
                                "text-white"
                              } `}
                            >
                              Add 
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              
		<li>
                <Link onClick={() => setSidebarOpen(false)} href="/admin/settings" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/admin/settings") && "bg-graydark dark:bg-meta-4"}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 825.000000 825.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,825.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M3865 8149 c-55 -4 -156 -15 -225 -24 -112 -15 -132 -21 -200 -58 -101 -57 -185 -143 -232 -237 -25 -50 -78 -213 -157 -483 -100 -344 -123 -413 -147 -438 -15 -16 -73 -52 -128 -81 -56 -28 -148 -81 -206 -116 -150 -94 -188 -112 -232 -112 -21 0 -210 43 -421 96 -520 131 -587 134 -785 37 -82 -40 -99 -53 -151 -117 -74 -90 -177 -241 -225 -328 -21 -38 -42 -68 -48 -68 -13 0 -184 -353 -258 -535 -57 -139 -61 -154 -55 -205 14 -131 51 -231 123 -336 22 -33 171 -193 330 -356 318 -326 321 -330 302 -428 -12 -58 -12 -273 0 -370 16 -135 24 -122 -303 -468 -159 -169 -303 -325 -319 -347 -78 -106 -118 -226 -118 -354 0 -73 5 -94 46 -199 56 -141 239 -522 251 -522 5 0 40 -51 77 -112 70 -119 151 -232 231 -325 89 -103 254 -160 439 -150 84 4 164 20 486 102 296 74 396 96 432 92 36 -3 68 -18 145 -68 54 -35 156 -94 228 -131 71 -37 142 -81 158 -97 25 -24 45 -85 148 -437 73 -250 133 -437 155 -482 43 -88 137 -192 219 -242 52 -30 73 -36 194 -52 392 -50 650 -50 1042 0 121 16 142 22 194 52 82 50 176 154 219 242 22 45 82 232 155 482 103 352 123 413 148 437 16 16 87 60 158 97 72 37 174 96 228 131 77 50 109 65 145 68 36 4 136 -18 432 -92 528 -134 589 -136 808 -28 82 40 99 53 152 117 71 87 172 236 224 329 21 37 42 67 47 67 17 0 185 352 276 578 42 106 45 117 38 176 -9 84 -53 210 -98 277 -20 30 -173 200 -342 377 -179 191 -308 335 -312 350 -8 33 -8 51 2 227 4 86 3 175 -3 231 -18 153 -30 134 290 462 311 319 353 369 403 474 33 70 65 197 65 255 0 60 -291 713 -318 713 -5 0 -39 51 -76 113 -36 61 -106 164 -154 227 -78 101 -96 120 -160 156 -115 66 -168 79 -312 78 -124 0 -128 -1 -507 -97 -211 -53 -400 -97 -421 -97 -44 0 -82 18 -232 112 -58 35 -150 88 -206 116 -55 29 -113 65 -128 81 -24 25 -47 94 -147 438 -79 269 -132 433 -157 483 -46 93 -131 179 -233 236 -66 38 -87 44 -194 58 -267 35 -545 44 -780 25z m581 -504 c155 -15 160 -16 184 -44 20 -23 47 -112 129 -413 68 -253 114 -405 136 -448 82 -162 185 -258 396 -365 72 -37 183 -98 247 -137 137 -83 219 -114 335 -127 129 -15 208 -2 624 103 210 53 389 93 397 90 17 -6 82 -92 163 -214 122 -183 332 -568 333 -608 0 -8 -49 -64 -108 -125 -272 -279 -520 -550 -551 -601 -18 -31 -45 -87 -60 -124 l-26 -67 -3 -376 c-3 -312 -1 -387 12 -442 17 -72 57 -158 103 -222 28 -37 572 -618 600 -640 24 -19 16 -60 -35 -174 -120 -265 -371 -673 -428 -695 -8 -3 -198 39 -422 93 -224 54 -431 101 -460 104 -72 8 -193 -7 -276 -34 -37 -12 -125 -56 -195 -96 -69 -40 -180 -101 -246 -135 -156 -79 -220 -123 -288 -198 -95 -105 -125 -180 -246 -619 -87 -313 -114 -398 -133 -417 -19 -20 -41 -27 -113 -36 -116 -14 -633 -14 -750 0 -78 10 -93 15 -115 39 -20 22 -47 106 -128 403 -112 409 -145 492 -232 602 -69 86 -149 145 -290 218 -66 33 -176 94 -245 135 -149 88 -236 121 -349 134 -128 15 -208 2 -623 -103 -210 -53 -389 -93 -398 -90 -27 11 -140 171 -252 359 -110 183 -243 436 -243 462 0 7 49 64 108 126 305 315 510 539 550 601 86 132 120 285 100 446 -6 52 -8 135 -3 215 14 239 4 327 -55 452 -47 101 -73 132 -384 462 -221 234 -296 320 -296 338 0 31 92 234 171 377 103 187 273 438 305 450 8 3 198 -39 422 -93 224 -54 433 -101 466 -104 78 -8 213 8 289 34 69 24 134 58 252 135 44 28 127 75 185 104 140 70 207 117 273 191 95 107 125 181 244 612 83 300 114 395 133 418 24 28 30 30 165 43 191 19 440 19 631 1z"/>
<path d="M3925 5514 c-312 -58 -574 -198 -781 -417 -179 -189 -284 -393 -346 -669 -33 -147 -33 -378 0 -530 73 -339 221 -586 482 -800 134 -110 262 -179 439 -238 281 -94 561 -94 842 0 203 67 359 160 517 306 209 192 339 429 404 732 33 152 33 383 0 530 -64 287 -172 491 -362 683 -200 203 -420 326 -700 391 -116 27 -382 34 -495 12z m408 -505 c43 -10 116 -36 161 -58 328 -153 516 -440 517 -786 1 -281 -117 -522 -334 -686 -347 -262 -758 -255 -1098 19 -303 244 -398 675 -229 1030 51 107 86 157 166 237 79 79 160 135 269 186 183 86 356 104 548 58z"/>
</g>
                  </svg>
                  Settings
                </Link>
              </li>

              <li>
                <Link onClick={() => setSidebarOpen(false)} href="/admin/amc/report" className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${ pathname.includes("/admin/amc/report") && "bg-graydark dark:bg-meta-4"}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 640.000000 820.000000" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(0.000000,820.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M1155 8144 c-273 -33 -463 -121 -637 -296 -149 -151 -237 -319 -279 -533 -21 -104 -21 -6226 0 -6330 42 -216 133 -388 283 -537 151 -149 319 -237 533 -279 104 -21 4226 -21 4330 0 214 42 382 130 533 279 150 149 241 321 283 537 21 103 21 4668 1 4765 -8 36 -37 112 -64 170 l-51 105 -996 996 -996 996 -95 47 c-174 86 -52 79 -1515 82 -715 1 -1313 0 -1330 -2z m2068 -1426 c3 -911 4 -935 24 -998 36 -113 63 -173 111 -244 98 -148 216 -230 432 -299 64 -21 82 -21 998 -25 l932 -3 0 -2037 c0 -2200 3 -2088 -50 -2197 -51 -104 -164 -202 -275 -238 l-70 -22 -2105 0 -2105 0 -70 22 c-111 36 -224 134 -275 238 -53 110 -50 -96 -48 3255 l3 3095 22 65 c38 108 137 221 238 270 103 50 78 49 1192 49 l1042 1 4 -932z m568 882 c57 -38 1889 -1875 1912 -1918 l18 -33 -908 3 c-850 3 -911 4 -948 21 -51 23 -91 61 -118 112 l-22 40 -3 903 c-2 752 0 902 11 902 7 0 33 -13 58 -30z"/>
<path d="M1919 4141 c-225 -45 -268 -355 -64 -460 l50 -26 1315 0 c1449 0 1342 -5 1418 60 100 84 100 286 0 370 -76 64 27 60 -1393 61 -709 1 -1306 -1 -1326 -5z"/>
<path d="M1919 3141 c-225 -45 -268 -355 -64 -460 l50 -26 1315 0 c1449 0 1342 -5 1418 60 100 84 100 286 0 370 -76 64 27 60 -1393 61 -709 1 -1306 -1 -1326 -5z"/>
<path d="M1919 2141 c-225 -45 -268 -355 -64 -460 l50 -26 1315 0 c1449 0 1342 -5 1418 60 100 84 100 286 0 370 -76 64 27 60 -1393 61 -709 1 -1306 -1 -1326 -5z"/>
</g>
                  </svg>
                  AMC Report
                </Link>
              </li>

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

export default AdminSidebar;
