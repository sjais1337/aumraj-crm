'use client'

import { Metadata } from "next";
import { useEffect, useState } from "react";
import CardDataStats from "@/components/CardDataStats"
import axios from "axios";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Pie from "@/components/Charts/Donut";
import ChartOne from "@/components/Charts/ChartOne";
import { formatCurrency } from "@/libs/consts";
import Bar from "@/components/Charts/Bar";
import Button from "@/components/FormElements/Button";
import Input from "@/components/FormElements/Inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "@/components/Loader/Loader";
import OutsideClickHandler from "@/context/OutsideClickHandler";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"

 
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toINR = n => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR',  maximumFractionDigits: 0 });

  interface achievers{
    name: string;
    score: number;
    userId: string;
  }


  const getColorShade = (value) => {
    let r, g, b;
    if (value <= 150) {
      const ratio = value / 150;
      r = 255;
      g = Math.ceil(255 * (1 - ratio));
      b = Math.ceil(255 * (1 - ratio));
  }  else if (value <= 200) {
        const ratio = (value - 151) / 49;
        r = 255;
        g = 255;
        b = Math.ceil(127 * (1 - ratio));
    } else if (value <= 250) {
        const ratio = (value - 201) / 49;
        r = Math.ceil(127 * (1 - ratio));
        g = 255;
        b = Math.ceil(127 * (1 - ratio));
    } else {
        r = 128;
        g = 0;
        b = 128;
    }
    return `rgba(${r},${g},${b})`; 
  };
  

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/auth/validate-session');

      if (response.ok) {
      } else {
        await signOut();
        router.push('/'); 
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, router]);


  const [ data, setData ] = useState(null); 
  
  const [ billingTarget, setBillingTarget ] = useState('');
  const [ billingAchieved, setBillingAchieved ] = useState('');
  const [ billingPercent, setBillingPercent ] = useState('');
  const [ yearlyIncentive, setYearlyIncentive ] = useState('');  
  const [ tasks, setTasks ] = useState([]);
  const [ dataUser, setDataUser] = useState([]);
  const [ dataTeam, setDataTeam] = useState([]);
  const [ labels, setLabels] = useState([]);
  const [ highest, setHighest ] = useState<achievers>({name: '', score: 0, userId: ''});
  const [ lowest, setLowest ] = useState<achievers>({name: '', score: 0, userId: ''});
  const [ last, setLast ] = useState<achievers>({name: '', score: 0, userId: ''});
  const [ userFyScore, setUserFyScore ] = useState(0);
  const [ teamFyScore, setTeamFyScore ] = useState(0);
  const [ notifications, setNotifications ] = useState([]);
  const [ topCompanies, setTopCompanies ] = useState([]);
  const [ topPOs, setTopPOs ] = useState([]);
  const [ submitRemark, setSubmitRemark ] = useState(false);
  const [ amcWarnings, setAmcWarnings ] = useState([]);
  const [ amcSummary, setAmcSummary ] = useState([]);
  const [ funnelSummary, setFunnelSummary ] = useState([]);
  const [ amcTotal, setAmcTotal ] = useState({"B2B":0, "ATPL": 0, "B2B_ATPL":0});
  const [ funnelTotal, setFunnelTotal ] = useState(0);
  const [ statusSummary, setStatusSummary ] = useState([]);
  const [ statusTotal, setStatusTotal ] = useState({"SUPPORT":0, "DELIVERY": 0, "PAYMENT":0});
  const [ propData, setPropData  ] = useState(null);

  useEffect(() => {
    const fetchData = async() => {
      const response_dash = await fetch('/api/user/dash');
      const response_tasks = await fetch('/api/user/tasks');
      const response_performance = await fetch('/api/user/performance');
      const response_summaries = await fetch('/api/user/summaries');
      const response_notifications = await fetch('/api/user/notifications');

      const data_summaries = await response_summaries.json();
      const data_dash = await response_dash.json();
      const task = await response_tasks.json();
      const data_performance = await response_performance.json();
      const notifications = await response_notifications.json();
      
      setPropData(notifications);

      const { billingPercentage, billingTarget, billingAchieved, salary, workMonths } = data_dash;

      let rawDataTeam = Object.values(data_performance.team).map((i:any) => i.score);
      let rawDataUser = Object.values(data_performance.user).map((i:any) => i.score);

      let userFyScoreTemp = rawDataUser.reduce((a, b) => a + b, 0)/ rawDataUser.length;

      let factor = 0;

      if(userFyScoreTemp >= 250){
        factor = 0.25
      }else if(userFyScoreTemp >= 200){
        factor = 0.15
      }else if(userFyScoreTemp >= 150){
        factor = 0.06
      }else{
        factor = 0;
      }

      let incentive = Math.floor(salary*workMonths*factor*(billingAchieved/billingTarget));

      setTasks(task);      
      setBillingAchieved(formatCurrency(billingAchieved));
      setBillingTarget(formatCurrency(billingTarget));
      setYearlyIncentive(formatCurrency(incentive));
      setBillingPercent(billingPercentage);
      setNotifications(notifications.notifications);
      setDataUser(rawDataUser)
      setDataTeam(rawDataTeam);
      setLabels(Object.values(data_performance.user).map((i:any) => i.month))        
      setUserFyScore(Math.floor(userFyScoreTemp))
      setTeamFyScore(Math.floor(rawDataTeam.reduce((a, b) => a + b, 0)/ rawDataTeam.length ))
      setHighest(data_performance.highest);
      setLast(data_performance.last);
      setLowest(data_performance.lowest);
      setTopCompanies(data_performance.topCompanies);
      setTopPOs(data_performance.topPOs);        
      setAmcSummary(data_summaries.amc);
      setFunnelSummary(data_summaries.funnel);
      setAmcWarnings(data_summaries.amcWarnings);
      setAmcTotal(data_summaries.amc.reduce(
        (totals, item) => {
            totals.B2B += item.B2B || 0;
            totals.ATPL += item.ATPL || 0;
            totals.B2B_ATPL += item.B2B_ATPL || 0;
            return totals;
        },
        { B2B: 0, ATPL: 0, B2B_ATPL: 0 }
      ));
      setFunnelTotal(data_summaries.funnel.reduce((total, item) => total + (item.count || 0), 0));
      setStatusSummary(data_summaries.support);
      setStatusTotal(data_summaries.support.reduce(
        (totals, item) => {
            totals.SUPPORT += item.SUPPORT || 0;
            totals.DELIVERY += item.DELIVERY || 0;
            totals.PAYMENT += item.PAYMENT || 0;
            return totals;
        },
        { SUPPORT: 0, DELIVERY: 0, PAYMENT: 0 }
      ));
    }
    
    fetchData();
  }, [])

  const handleSubmitRemark = () => {
    setSubmitRemark(!submitRemark);
  }

  const {
      register,
      handleSubmit,
      reset,
      formState: {
          errors
      }
  } = useForm<FieldValues>({
      defaultValues: {}
  })

  const readMessage = async (data) => {
    try{
      const id = data.currentTarget.id;

      const response = await axios.post('/api/user/tasks/markRead', {
        id: id
      })

      if(response.status == 200){
        return toast.success('Marked notification as read!')
      }

    }catch(err){
      console.log(err);
      return toast.error('An unexpected error ocurred! Please report this to development.')
    
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try{
        if(data.remark.length < 10){
          return toast.error('Please elaborate your remarks.')
        }

        const response = await axios.post('/api/user/tasks/remark', {
          remark: data.remark,
          id: tasks[0].id
        })

        if(response.status == 200){
          setTasks([]);
          setSubmitRemark(false);
          return toast.success('Remarks added successfully!');
        }

    }catch(err){
        return toast.error('An unexpected error occurred!');
    }
  }

  interface ResultsType {
    name: string;
    type: string;
    companyName: string;
    personName: string;
    date: string;
    status?: string;
  }
  const [ results, setResults ] = useState<ResultsType[]>([]);
  const [ query, setQuery ] = useState('');

  const handleOutsideClick = () => {
    setResults([]);
  }

  useEffect(() => {
    const fetchActivity = async () => {
      if(query.length < 3) {
        setResults([]);
        return;
      }

      const response = await fetch(`/api/user/search/activity?query=${query}&select=5`);
      const data = await response.json();


      setResults(data);
    }

    fetchActivity();
  }, [query]);

  const fetchFullActivity = async () => {
    if(query.length < 3) {
      setResults([]);
      return;
    }

    const response = await fetch(`/api/user/search/activity?query=${query}&select=0`);
    const data = await response.json();


    setResults(data);
  }

  if(!propData){
    return <Loader></Loader>
  }

  return (
    <>
     <div className="bottom-0 flex border border-stroke bg-white px-6 py-5 dark:border-strokedark shadow-default dark:bg-boxdark mb-6">
        <div className="relative w-full">
          <OutsideClickHandler onOutsideClick={handleOutsideClick}>
              <input 
                type="text" 
                placeholder="Type customer name" 
                className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 font-medium text-black placeholder-body outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                }}
              ></input>
              {
                results.length > 0 && (
                  <ul className="absolute text-black dark:text-white bg-white z-100 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary shadow-lg max-h-60 overflow-y-auto"  style={{'zIndex':'21'}}>
                    { 
                      results.map((result, x) => {
                        if(result.type == 'funnel'){
                          let { name, status, companyName, personName, date } = result;
                          let color = 'black';

                          if(status == 'Won'){
                            color = 'green-700';
                          }else if(status == 'Lost'){
                            color = 'rose-700'
                          }else if(status == 'Cold'){
                            color = 'primary'
                          }else if(status == 'Dropped' || status == 'Lost'){
                            color = 'black'
                          }else if(status == 'Mild'){
                            color = 'warning'
                          }

                          return <li key={x+0.1} className="relative border-l-4 border-primary  relative z-20 w-full appearance-none bg-white px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                          <div className={'absolute -left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-' + color + ' white border-2 border-primary rounded-full'}></div>
                          <span className="font-medium">{name}</span> got PO from {personName} from <span className="font-bold">{companyName}</span> <span className={'font-medium text-' + color}>({status})</span> on <span className="font-medium">{new Date(date).toLocaleDateString("en-us", {day: "numeric", month: "short", year: "numeric"})}</span>.
                        </li>
                        }else{
                          let {name, type, companyName, personName, date } = result;
                         
                         return <li key={x+0.1} className="relative border-l-4 border-primary relative z-20 w-full appearance-none bg-white px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                          <div className="absolute -left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full"></div>
                          <span className="font-medium">{name}</span> contacted {personName} from <span className="font-bold">{companyName}</span> over {type} on {<span className="font-medium">{new Date(date).toLocaleDateString("en-us", {day: "numeric", month: "short", year: "numeric"})}</span>}.
                        </li>
                        }
                      })
                    }
                  </ul>
                )
              }
          </OutsideClickHandler>
        </div>
        
        <button onClick={fetchFullActivity} className="flex ml-2.5 h-13 w-full max-w-13 items-center justify-center rounded-md bg-primary text-white hover:bg-opacity-90">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" stroke="white"  clipRule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill="white"></path>
            <path fillRule="evenodd" stroke="white" clipRule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill="white"></path>
          </svg>
        </button>
    </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-6.5">
      
     

      <div className="col-span-1 md:col-span-3 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {billingTarget}
            </h4>
            <span className="text-sm font-medium">Billing Target</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg className="fill-primary dark:fill-white" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" fill="none" ><path d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-3 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {billingAchieved}
            </h4>
            <span className="text-sm font-medium">Billing Done</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg className="fill-primary dark:fill-white" xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 448 512" fill="none" ><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-3 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {billingPercent}%
            </h4>
            <span className="text-sm font-medium">Billing % Achieved</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg className="fill-primary dark:fill-white" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 384 512" fill="none" ><path d="M374.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-320 320c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l320-320zM128 128A64 64 0 1 0 0 128a64 64 0 1 0 128 0zM384 384a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z"/></svg>          
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-3 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {yearlyIncentive}
            </h4>
            <span className="text-sm font-medium">Yearly Incentive           <div className="hidden bg-green-500 bg-red-500"></div></span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg className="fill-primary dark:fill-white" width="20" height="20" viewBox="0 0 320 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M160 0c17.7 0 32 14.3 32 32l0 35.7c1.6 .2 3.1 .4 4.7 .7c.4 .1 .7 .1 1.1 .2l48 8.8c17.4 3.2 28.9 19.9 25.7 37.2s-19.9 28.9-37.2 25.7l-47.5-8.7c-31.3-4.6-58.9-1.5-78.3 6.2s-27.2 18.3-29 28.1c-2 10.7-.5 16.7 1.2 20.4c1.8 3.9 5.5 8.3 12.8 13.2c16.3 10.7 41.3 17.7 73.7 26.3l2.9 .8c28.6 7.6 63.6 16.8 89.6 33.8c14.2 9.3 27.6 21.9 35.9 39.5c8.5 17.9 10.3 37.9 6.4 59.2c-6.9 38-33.1 63.4-65.6 76.7c-13.7 5.6-28.6 9.2-44.4 11l0 33.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.9c-.4-.1-.9-.1-1.3-.2l-.2 0s0 0 0 0c-24.4-3.8-64.5-14.3-91.5-26.3c-16.1-7.2-23.4-26.1-16.2-42.2s26.1-23.4 42.2-16.2c20.9 9.3 55.3 18.5 75.2 21.6c31.9 4.7 58.2 2 76-5.3c16.9-6.9 24.6-16.9 26.8-28.9c1.9-10.6 .4-16.7-1.3-20.4c-1.9-4-5.6-8.4-13-13.3c-16.4-10.7-41.5-17.7-74-26.3l-2.8-.7s0 0 0 0C119.4 279.3 84.4 270 58.4 253c-14.2-9.3-27.5-22-35.8-39.6c-8.4-17.9-10.1-37.9-6.1-59.2C23.7 116 52.3 91.2 84.8 78.3c13.3-5.3 27.9-8.9 43.2-11L128 32c0-17.7 14.3-32 32-32z"/>
            </svg>
          </div>
        </div>
      </div>
     
      {
        tasks.length != 0 && 
          <div className="col-span-1 md:col-span-12 px-5 font-bold rounded-lg py-3 text-white bg-rose-700 flex items-center justify-between text-lg">
            <div className="flex">
              <div className="relative h-8 w-8 rounded-full mr-3">
                <img src="images/alert.webp" alt="User" />
              </div>
              Task Assigned: {tasks[0].message}
            </div>
            <div className="bg-warning text-black py-1 px-2 rounded-md cursor-pointer" onClick={handleSubmitRemark}>
              {submitRemark ? "Close" : "Done?"}
            </div>
          </div>
      }
      

      {
        submitRemark && <div className="col-span-1 md:col-span-12 px-5 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark pb-5 pt-3">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:w-5/6">
                  <Input  register={register} id='remark' label='Remark' type='text' errors={errors} showLabel={false} />
              </div>
              <div className="w-full sm:w-1/6 flex flex-col justify-end translate-y-1">
                  <Button fullWidth>Submit</Button>
              </div>
          </form>
        </div>
      }
      
      <div className="col-span-1 md:col-span-8 flex flex-col border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-h-100 overflow-auto">
        <div className="flex-1 border border-stroke dark:border-strokedark border-t-0 border-l-0 border-r-0 dark:bg-boxdark px-7.5 pt-6 md:px-7.5 md:pt-6">
          <h4 className="mb-6 text-xl font-bold text-black dark:text-white ">
            AMC Data
          </h4>
        </div>
        <div className="mx-10">
          {
            amcWarnings.map((i,x) => {
              return  <div key={x+0.6}>
                <div className="flex items-center justify-between py-4">
                  <div className="flex flex-grow items-center gap-4.5">
                    <div>
                      <h4 className="mb-2 font-medium text-black dark:text-white">{i.name} your AMC for <span className={i.days == 0 ? "text-danger" : "text-primary"}>{i.customerName}</span> with <span>{i.oem}</span> {i.days == 0 ? "has expired!" : "is expiring in " + i.days + " days!"}</h4>
                      <div className="flex">
                        {i.days == 0 ? <></> : 
                          <span className="flex items-center gap-1.5 mr-4">
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.57495 2.99999V1.57499H9.92495C10.225 1.57499 10.5 1.32499 10.5 0.999988C10.5 0.674988 10.25 0.424988 9.92495 0.424988H6.09995C5.79995 0.424988 5.52495 0.674988 5.52495 0.999988C5.52495 1.32499 5.77495 1.57499 6.09995 1.57499H7.44995V2.99999C4.22495 3.29999 1.69995 5.99999 1.69995 9.27499C1.69995 12.75 4.52495 15.575 7.99995 15.575C11.475 15.575 14.3 12.75 14.3 9.27499C14.3 5.99999 11.775 3.29999 8.57495 2.99999ZM7.99995 14.45C5.14995 14.45 2.82495 12.125 2.82495 9.27499C2.82495 6.42499 5.14995 4.09999 7.99995 4.09999C10.85 4.09999 13.175 6.42499 13.175 9.27499C13.175 12.125 10.85 14.45 7.99995 14.45Z" fill=""></path><path d="M11.1749 8.69996H8.5749V6.09996C8.5749 5.79996 8.3249 5.52496 7.9999 5.52496C7.6999 5.52496 7.4249 5.77496 7.4249 6.09996V8.72496H6.7249C6.4249 8.72496 6.1499 8.97496 6.1499 9.29996C6.1499 9.62496 6.3999 9.87496 6.7249 9.87496H7.4249V10.575C7.4249 10.875 7.6749 11.15 7.9999 11.15C8.2999 11.15 8.5749 10.9 8.5749 10.575V9.87496H11.1999C11.4999 9.87496 11.7749 9.62496 11.7749 9.29996C11.7749 8.97496 11.4999 8.69996 11.1749 8.69996Z" fill=""></path></svg>
                            <span className="text-xs font-medium">{i.days} days</span>
                          </span>
                        }
                        <span className="flex items-center gap-1.5">
                          <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2.65002H12.7V2.10002C12.7 1.80002 12.45 1.52502 12.125 1.52502C11.8 1.52502 11.55 1.77502 11.55 2.10002V2.65002H4.42505V2.10002C4.42505 1.80002 4.17505 1.52502 3.85005 1.52502C3.52505 1.52502 3.27505 1.77502 3.27505 2.10002V2.65002H2.00005C1.15005 2.65002 0.425049 3.35002 0.425049 4.22502V12.925C0.425049 13.775 1.12505 14.5 2.00005 14.5H14C14.85 14.5 15.575 13.8 15.575 12.925V4.20002C15.575 3.35002 14.85 2.65002 14 2.65002ZM1.57505 7.30002H3.70005V9.77503H1.57505V7.30002ZM4.82505 7.30002H7.45005V9.77503H4.82505V7.30002ZM7.45005 10.9V13.35H4.82505V10.9H7.45005ZM8.57505 10.9H11.2V13.35H8.57505V10.9ZM8.57505 9.77503V7.30002H11.2V9.77503H8.57505ZM12.3 7.30002H14.425V9.77503H12.3V7.30002ZM2.00005 3.77502H3.30005V4.30002C3.30005 4.60002 3.55005 4.87502 3.87505 4.87502C4.20005 4.87502 4.45005 4.62502 4.45005 4.30002V3.77502H11.6V4.30002C11.6 4.60002 11.85 4.87502 12.175 4.87502C12.5 4.87502 12.75 4.62502 12.75 4.30002V3.77502H14C14.25 3.77502 14.45 3.97502 14.45 4.22502V6.17502H1.57505V4.22502C1.57505 3.97502 1.75005 3.77502 2.00005 3.77502ZM1.57505 12.9V10.875H3.70005V13.325H2.00005C1.75005 13.35 1.57505 13.15 1.57505 12.9ZM14 13.35H12.3V10.9H14.425V12.925C14.45 13.15 14.25 13.35 14 13.35Z" fill=""></path></svg>
                          <span className="text-xs font-medium">{new Date(i.date).toLocaleDateString("en-us", {day: "numeric", month: "short", year: "numeric"})}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={i.days == 0 ? "hidden lg:block rounded ml-2.5 px-2.5 py-1.5 text-sm font-medium text-danger bg-red/[0.2]" : "hidden lg:block rounded ml-2.5 px-2.5 py-1.5 text-sm font-medium text-primary bg-primary/[0.15]"}>{i.days == 0 ? "Expired" : "Expiring"}</span>
                </div>
              </div>
            })
          }
        </div>
      </div>

      <div className="col-span-1 md:col-span-4 flex flex-col border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-h-100 overflow-auto">
        <div className="flex-1 dark:border-strokedark dark:bg-boxdark border border-t-0 border-l-0 border-r-0 border-stroke px-7.5 pt-6 md:px-7.5 md:pt-6">
          <h4 className="mb-6 text-xl font-bold text-black dark:text-white ">
            Notifications
          </h4>
        </div>
        <div className="my-4 h-full">
          {
            notifications.map((i,x) => {
              switch(i.type){
                case "birthday": 
                  return <div key={x+0.2} className="flex items-center gap-5 px-4 py-3 bg-blue-700/[0.2] border-b-4 border-indigo-500"><div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-indigo-500">
                  <img src={`images/pfp/${i.userId}.png`} alt="User" /></div><div className="flex flex-1 items-center justify-between"><div><h5 className="text-base dark:text-white"><span className="text-indigo-600 text-sm">🎉 Wishing a very</span> <div className="font-semibold text-lg text-indigo-500">
                  Happy Birthday to {i.name} <span className="text-xl">🎂✨</span></div></h5></div></div></div>
                case "anniversary":
                  return <div key={x+0.2} className="flex items-center gap-5 px-4 py-3 bg-rose-700/[0.2] border-b-4 border-rose-500"><div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-rose-500">
                  <img src={`images/pfp/${i.userId}.png`} alt="User" /> </div><div className="flex flex-1 items-center justify-between"><div><h5 className="text-base dark:text-white"><span className="text-rose-600 text-sm">💖 Celebrating</span><div className="font-semibold text-lg text-rose-500">
                  {i.name}&apos;s Marriage Anniversary! <span className="text-xl">💍✨</span></div></h5></div></div></div>
                case "join":
                  return <div key={x+0.2} className="flex items-center gap-5 px-4 py-3 bg-green-700/[0.2] border-b-4 border-green-500"><div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-green-500">
                  <img src={`images/pfp/${i.userid}.png`} alt="User" /></div><div className="flex flex-1 items-center justify-between"><div><h5 className="text-base dark:text-white"><span className="text-green-600 text-sm">🌟 Celebrating</span><div className="font-semibold text-lg text-green-500">
                  {i.name}&apos;s Work Anniversary! <span className="text-xl">🎉👔</span></div></h5></div></div></div>
                case "support_closed":
                  return <div key={x+0.2} className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"><div className="relative h-14 w-14 rounded-full overflow-hidden"><img src="images/thumbsup.png" className="p-2" alt="User" /></div><div className="flex flex-1 items-center justify-between"><div><h5 className="font-medium text-black dark:text-white">
                  {i.name}</h5><p><span className="text-sm font-medium text-black dark:text-white">
                  Good Job for closing case of {i.companyName}.</span></p></div></div></div>
                case "funnel_added":
                  return <div key={x+0.2} className="flex items-center gap-5 px-4 py-3 bg-warning/[0.2] border-b-4 border-warning"><div className="relative h-14 w-14 rounded-full overflow-hidden"><img src="images/trophy.png" className="p-1" alt="User" /></div><div className="flex flex-1 items-center justify-between"><div><h5 className="font-medium text-black dark:text-white">
                  Congratulations <span className="text-warning">{i.name}</span></h5><p><span className="text-sm font-medium text-black dark:text-white">
                  for PO from {i.companyName}.</span></p></div></div></div>
                case "support_added":
                  return <div key={x+0.2} className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"><div className="relative h-11 w-11 mx-1.5 rounded-full overflow-hidden"><img src="images/alert.webp" alt="User" /></div><div className="flex flex-1 items-center justify-between"><div><h5 className="font-medium text-black dark:text-white">
                  {i.name}</h5><p><span className="text-sm font-medium text-black dark:text-white">
                  Action needed for {i.companyName}.</span></p></div></div></div>
                case "message":
                  return <div key={x+0.2} className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"><div className="relative h-14 w-14 rounded-full overflow-hidden">
                  <img src={"images/pfp/" + i.userId + ".png"} alt="User" /></div><div className="flex flex-1 items-center justify-between"><div><h5 className="font-medium text-black dark:text-white">
                  {i.checkedBy}</h5><p><span className="text-sm font-medium text-black dark:text-white">
                  {i.message}.</span><span className="text-sm cursor-pointer" id={i.activityId} onClick={(e) => { readMessage(e); }}> Read?</span></p></div></div></div>
              }
            })
          }
        </div>
      </div>
            
      <div className="col-span-1 md:col-span-4 flex flex-col border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex-1">
            <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
              Top Customers
            </h4>
          </div>  
          <div className="">
            {
              topCompanies.map((i,x) => {
                return <div key={x+0.1}>
                  <div className="flex justify-between pt-2">
                    <span className="font-medium text-black dark:text-white">{x+1}. {i.companyName}</span>
                    <span className="text-primary font-semibold">{toINR(i.topLine)}</span>
                  </div>
                  <span className="text-s">{i.staffName}</span>
                </div> 
              })
            }
          </div>
      </div>

      <div className="col-span-1 md:col-span-4 flex flex-col border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex-1">
            <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
              Top POs
            </h4>
          </div> 
          <div className="">
            {
              topPOs.map((i,x) => {
                return <div key={x+0.3}>
                  <div className="flex justify-between pt-2">
                    <span className="font-medium text-black  dark:text-white">{x+1}. {i.companyName}</span>
                    <span className="text-primary font-semibold">{toINR(i.topLine)}</span>
                  </div>
                  <span className="text-s">{i.staffName}</span>
                </div> 
              })
            }
          </div>
      </div>  

      <div className="col-span-1 md:col-span-4 flex flex-col border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex-1">
          <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
            Top/Bottom
          </h4>
          <div className="flex flex-col">
        <div className="flex items-center gap-4 p-3 rounded-lg bg-green-200 text-green-900">
          {
            highest.score != 0 &&<span className="w-14 h-14 rounded-full overflow-hidden">
            <img
          src={`images/pfp/${highest.userId}.png`}
          alt="Top Scorer Last Month Avatar"
          className="w-full"
        />
          </span> 
          }
          
          <div>
            <p className="text-sm font-semibold">Top Scorer (This Month)</p>
            <h2 className="text-lg font-bold">{highest.name}</h2>
            <p className="text-sm">Score: <span className="font-semibold">{highest.score}</span></p>
          </div>
          <div className="ml-auto">
            🏆
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-100 text-blue-800 mt-3">
          
          {
              last.score != 0 &&
              <span className="w-14 h-14 rounded-full overflow-hidden">
                <img
              src={`images/pfp/${last.userId}.png`}
              alt="Top Scorer Last Month Avatar"
              className="w-full"
            />
              </span> 
          }

          <div>
            <p className="text-sm font-semibold">Top Scorer (Last Month)</p>
            <h2 className="text-lg font-bold">{last.name}</h2>
            <p className="text-sm">Score: <span className="font-semibold">{last.score}</span></p>
          </div>
          <div className="ml-auto">
            🥇
          </div>
        </div>

        <h2 className="text-lg font-bold p-3 text-danger bg-rose-100 rounded-lg mt-3">{lowest.name} is Behind!</h2>
      </div>

        </div>
      </div>
      
      <div className="col-span-1 md:col-span-8 flex flex-col border border-stroke bg-white  shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex-1 px-7.5 pt-6 md:px-7.5 md:pt-6">
          <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
            Team Performance 
          </h4>
        </div>
        <div className="px-4">
          <ChartOne labels={labels} dataTeam ={dataTeam} dataUser={dataUser}></ChartOne>
        </div>
      </div>
      
      <Bar data={[userFyScore,teamFyScore]} labels={['Your', 'Team']} colors={[getColorShade(userFyScore), getColorShade(teamFyScore)]} title="FY Performance" home={true}></Bar> 
      
      <div className="col-span-1 md:col-span-8 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
          AMC Data (Total: {amcTotal.ATPL + amcTotal.B2B + amcTotal.B2B_ATPL})
        </h4>

        <table className="table-auto w-full text-black dark:text-white">
    <thead>
      <tr>
        <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">Name</th>
        <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">B2B</th>
        <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">ATPL</th>
        <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">B2B + ATPL</th>
      </tr>
    </thead>
    <tbody className="">
      {
        amcSummary.map((i,x) => {
          
          return <tr key={x+0.4}>
                  <td className="px-3 sm:px-6 py-4 font-medium text-sm sm:text-base">{i.name}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base">{i['B2B']}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base">{i['ATPL']}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base">{i['B2B_ATPL']}</td>
                </tr>
        })
      }
    </tbody>
    <tfoot className="bg-gray-100">
      <tr>
        <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">Total</td>
        <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">{amcTotal.B2B}</td>
        <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">{amcTotal.ATPL}</td>
        <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">{amcTotal.B2B_ATPL}</td>
      </tr>
    </tfoot>
  </table>
      </div>
      <div className="col-span-1 md:col-span-4 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
            Funnel Added (this Month)
          </h4>

        <table className="table-auto w-full text-black dark:text-white">
    <thead>
      <tr>
        <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">Name</th>
        <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">Cases</th>
      </tr>
    </thead>
    <tbody className="">
      {funnelSummary.map((i,x) => {
        return <tr key={x+0.5}>
        <td className="px-3 sm:px-6 py-4 font-medium text-sm sm:text-base">{i.name}</td>
        <td className="px-3 sm:px-6 py-4 text-sm sm:text-base">{i.count}</td>
      </tr>
      })}
    </tbody>
    <tfoot className="bg-gray-100">
      <tr>
        <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">Total</td>
        <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">{funnelTotal}</td>
      </tr>
    </tfoot>
  </table>
      </div>

      <div className="col-span-1 md:col-span-12 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
          Support Summary (Total:{statusTotal.SUPPORT + statusTotal.DELIVERY + statusTotal.PAYMENT})
        </h4>
          <table className="table-auto w-full text-black dark:text-white">
            <thead>
            <tr>
                <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">Name</th>
                <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">Planning</th>
                <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">Progress</th>
                <th className="text-left px-3 sm:px-6 py-3 font-semibold text-sm sm:text-base">Issues</th>
              </tr>
            </thead>
            <tbody className="">
              {
                statusSummary.map((i,x) => {
                  return <tr key={x+0.4}>
                    <td className="px-3 sm:px-6 py-4 font-medium text-sm sm:text-base">{i.name}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm sm:text-base">{i['SUPPORT']}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm sm:text-base">{i['DELIVERY']}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm sm:text-base">{i['PAYMENT']}</td>
                  </tr>
                })
              }
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">Total</td>
                <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">{statusTotal.SUPPORT}</td>
                <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">{statusTotal.DELIVERY}</td>
                <td className="px-3 sm:px-6 py-4 font-bold text-sm sm:text-base">{statusTotal.PAYMENT}</td>
              </tr>
            </tfoot>
            
          </table>
        </div>

      <div className="hidden">

        <div className="ag-theme-quartz">
          <AgGridReact columnDefs={[{field:'hello'}]} rowData={[{'hello': 'hi'}]}></AgGridReact>
        </div>
      </div>
    </div>
    </>
  );
}
