'use client'

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Input from "@/components/FormElements/Inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/FormElements/Button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "@/components/Loader/Loader";


const SubmitActivity = () => {

    const [isLoading, setIsLoading ] = useState(false);
    const [ employees, setEmployees ] = useState<employeeList>({});
    const [ employeesIds, setEmployeesIds ] = useState<employeeList>({});
    const [ groupLeader, setGroupLeader ] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {}
    })

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);
        try{
            if(groupLeader == ''){
                return toast.error('Please select a user.')
            }

            if(data.message.length < 10){
                return toast.error('Please explain the task properly.')
            }
            
            const newGroup = await axios.post('/api/admin/addTask', {
                message: data.message,
                userId: groupLeader
            })

            if(newGroup.status == 200){
                toast.success('Task assigned successfully!')
            }
        }catch(error){
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    interface employeeList{
        [key: string]: string
    }

    const handleLeaderChange = (event: any) => {
        setGroupLeader(employees[event.target.value]);
    }

    const fetchStaffs = async () => {
        fetch('/api/admin/fetchStaffs')
        .then(response => response.json())
        .then(data => {
            const swap = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

            let userReference = {};

            data.forEach(i => {
                userReference[i.name] = i.id;
            })
   
            setEmployees(userReference);
            setEmployeesIds(swap(userReference));
        })
    }

    useEffect(() => {
        fetchStaffs();
    }, [])

    if(isLoading) return (
        <Loader />
    );

    return (
        <div>
            <Breadcrumb pageName="Add Group"></Breadcrumb>
            <div className="w-full grid grid-cols-1 gap-9">
                <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Fill Details 
                    </h3>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="gap-5.5 p-6.5">
                        <div className="mb-2.5">
                            <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                                Employee
                            </label>
                            <div className="relative z-20 bg-transparent dark:bg-form-input">
                                <select onChange={handleLeaderChange} className='relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'>
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
                        <Input register={register} id='message' label='Message' type='text' errors={errors} showLabel={true} />
                        <div className="py-2">

                        </div>
                        <Button disabled={false} >Submit</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SubmitActivity;