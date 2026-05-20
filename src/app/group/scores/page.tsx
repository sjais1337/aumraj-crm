'use client'

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState, useRef } from "react";
import { 
    defaultColDef, 
    formatDate
} from '@/libs/consts';
import { ColDef } from "ag-grid-community";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/FormElements/Button";
import Input from "@/components/FormElements/Inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";


const AdminDash = () => {

    const { data: session, status } = useSession();
    const router = useRouter();

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

    const tee = useData();

    useEffect(() => {
        if(!tee.groupData.scores){
            return router.push('/users/permissions'); 
        }
    }, [tee, router])

    const [ employees, setEmployees ] = useState({});
    const [ selectedEmployee, setSelectedEmployee ] = useState(null);
    const [ dates, setDates ] = useState([]);
    const [ activity, setActivity ] = useState([]);
    const [ groupedData, setGroupedData ] = useState({});
    const [ disabled, setDisabled ] = useState(true);
    const [ selectedDate, setSelectedDate ] = useState('');

    const fetchUsers = async () => { 
        fetch('/api/group/mark/employees')
        .then(response => response.json())
        .then(data => {
            let userReference = {};
            data.forEach(i => {
                userReference[i.name] = i.id;
            })
            setEmployees(userReference);
        })
    }

    function groupByDate(array) {
        if(array.length > 0){
            return array.reduce((acc, obj) => {
                const date = formatDate(obj.date);
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(obj);
                return acc;
            }, {});
        }else{
            return {};
        }
        
    }

    const fetchDates = async (userId) => {
        const res = await axios.get('/api/group/mark/dates?user=' + userId)

        if(res.status == 401){
            return toast.error('User not authenticated.')
        }
        if(res.status == 500){
            return toast.error('An internal server error occurred! Please report this to development.')
        }

        const data = groupByDate(res.data);
        const dates = Object.keys(data);

        setDates(dates);
        setGroupedData(data);

        if(dates.length > 0){
            const firstDate = dates[0]
            setDisabled(false);
            setActivity(data[firstDate]);
            setSelectedDate(firstDate);
        }
    }

    const handleEmployeeChange = (event: any) => {
        setSelectedEmployee(employees[event.target.value]);
        setActivity([]);
        setGroupedData({});
        setDisabled(true);
        fetchDates(employees[event.target.value]);
    }

    const [ columnDefs, setColumnDefs ] = useState<ColDef[]>([
        {
            field: 'activity',
            minWidth: 350,
            editable: true,
        },
        {
            field: 'companyName',
            headerName: 'Company Name',
            maxWidth: 200,
        },
        {
            field: 'personName',
            headerName: 'Contact Person',
            maxWidth: 200,
        }
    ])


    const handleDateChange = (event: any) => {
        const value = event.target.value;
        
        if(value == ''){
            setActivity([]);
            setDisabled(true);
            setSelectedDate('');
            return;
        }

        setActivity(groupedData[event.target.value])
        setDisabled(false);
        setSelectedDate(value);
    }

    useEffect(() => {
        fetchUsers();
    }, [])


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

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        try{
            const { score, message } = data;

            const postData = {
                score: parseInt(score),
                message: message == '' ? null : message,
                activityIds: activity.map(i => i.activityId)
            }

            const res = await axios.post('/api/group/mark/score', postData);

            if(res.status == 401){
                return toast.error('User not authenticated.')
            }
            if(res.status == 500){
                return toast.error('An internal server error occurred! Please report this to development.')
            }

            toast.success('Assigned scores to activity on date ' + selectedDate + '!')

            const newDates = dates.filter((i) => i !== selectedDate);
            const newDate = newDates[0];

            if(newDates.length !== 0){
                setActivity(newDate);
                setSelectedDate(newDate);
            }else{
                setActivity([]);
                setSelectedDate('');
            }

            reset();

            setDates(newDates);
        }catch(err){
            console.log(err);
        }
    }

    const colorTheme = localStorage.getItem('color-theme');
    const classAddition = colorTheme == '"dark"' ? '-dark' : '';

    return (
        <>
            <Breadcrumb pageName="Admin"></Breadcrumb>
            <div className="w-full grid grid-cols-1 gap-9">
                <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white">
                            Mark Scores
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-2">
                        <div>
                            <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                                Employee
                            </label>
                            <div className="relative z-20 bg-transparent dark:bg-form-input">
                                <select onChange={handleEmployeeChange} className='relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'>
                                    <option value="" className="text-body dark:text-bodydark">Select</option>
                                    {Object.keys(employees).map(value => {
                                        return (
                                            <option value={value} key={value} className="text-body dark:text-bodydark">
                                            {value}
                                            </option>
                                        )
                                    })}
                                </select>

                                <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                                    <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path fillRule="evenodd" clipRule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill=""></path> </g></svg>
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                                Date
                            </label>
                            <div className="relative z-20 bg-transparent dark:bg-form-input">
                                <select value={selectedDate} onChange={handleDateChange} className='relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'>
                                    <option value="" className="text-body dark:text-bodydark">Select</option>
                                    {dates.map(value => {
                                        return (
                                            <option value={value} key={value} className="text-body dark:text-bodydark">
                                            {value}
                                            </option>
                                        )
                                    })}
                                </select>

                                <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                                    <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path fillRule="evenodd" clipRule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill=""></path> </g></svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={`pl-6.5 pr-6.5 pb-1.5 table ag-theme-quartz${classAddition}`} style={{ height: '40vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '40vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
      <AgGridReact
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowData={activity}
                            rowHeight={90}
                        />
                        </div>
                        
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="pb-6.5 pl-6.5 pr-6.5 mt-5 mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="w-full sm:w-1/6">
                            <Input disabled={disabled} register={register} id='score' label='Score' type='number' errors={errors} showLabel={false} />
                        </div>
                        <div className="w-full sm:w-4/6">
                            <Input disabled={disabled} register={register} id='message' label='Message' type='text' errors={errors} showLabel={false} />
                        </div>
                        <div className="w-full sm:w-1/6 flex flex-col justify-end">
                            <Button disabled={disabled} fullWidth>Submit</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
        
    )
}

export default AdminDash;
