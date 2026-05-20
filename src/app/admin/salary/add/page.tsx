'use client'

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Input from "@/components/FormElements/Inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Select from "@/components/FormElements/Inputs/Select";
import Textarea from "@/components/FormElements/Inputs/Textarea";
import Button from "@/components/FormElements/Button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSession } from "next-auth/react";
import CustomerSearch from "@/components/SelectGroup/CustomerSearch";
import { lists, phoneRegex } from "@/libs/consts";


const AddSalary = () => {

    const { data: session, status } = useSession()
    const [ isLoading, setIsLoading ] = useState(false);
    const [ selectedId, setSelectedId ] = useState(null);
    const [ employees, setEmployees ] = useState({});
    const [ salary, setSalary ] = useState(0);
    const [ selectedEmployee, setSelectedEmployee ] = useState(null);


    useEffect(() => {
        const fetchUsers = async () => {
            fetch('/api/admin/fetchUsers')
            .then(response => response.json())
            .then(data => {
                let userReference = {};
                data.forEach(i => {
                    userReference[i.name] = {
                        id: i.id, 
                        salary: i.salary,
                        department: i.department,
                        post: i.post
                    }
                })
                setEmployees(userReference);
            })
        }

        fetchUsers();
    }, [])

    

    const handleEmployeeChange = (event: any) => {
        if(event.target.value == ''){
            setSelectedEmployee(null);
            setSalary(0);
            return;
        }

        setSelectedEmployee(employees[event.target.value]);
        setSalary(employees[event.target.value].salary);
    }
  
    const {
        register,
        unregister,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {}
    })

    function camelCaseToWords(s: string) {
        const result = s.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
      

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);
        try{
            if(selectedEmployee == null){
                return toast.error('Please select an employee!');
            }
            for(const x of Object.entries(data)){
                console.log(x);
                if(x[1] == ''){
                    return toast.error('Please fill the ' + camelCaseToWords(x[0]));
                    break;
                }else{
                    if(x[0] != "month" && x[0] != "staffsId"){
                        data[x[0]] = parseFloat(x[1]);
                    }
                }
            }

            data.salary = salary;

            data.month = new Date("5 " + data.month + ", " + data.year);
            data.department = selectedEmployee.department;
            data.post = selectedEmployee.post;
            data.staffsId = selectedEmployee.id;

            delete data.year;

            const res = await axios.post('/api/admin/addSalary', data);

            if(res.status == 200){
                return toast.success('Entry successfully added!');
            }
        }catch(error){
            return toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
        <Breadcrumb pageName="Salary Slip Entry"></Breadcrumb>
        <div className="w-full grid grid-cols-1 gap-9">
          <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Fill details
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-2">
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
                <div className="md:flex w-full justify-between gap-5.5">
                    <Select styling="w-full" register={register} id='month' label='Month' items={lists.months} errors={errors}></Select>
                    <Select register={register} id='year' label='Year' items={lists.years} errors={errors}></Select>
                    
                </div>
                <div className="md:flex w-full justify-between gap-5.5">
                    <Input value={salary.toString()} register={register} styling="w-full" id='salary' label='Salary' type='number' errors={errors} showLabel={true} />
                    <Input register={register} styling="w-full" id='leavesAvailable' label='Balance Leaves' type='number' errors={errors} showLabel={true} />
                </div>
                <div className="md:flex w-full justify-between gap-5.5">
                    <Input  register={register} styling="w-full"  id='leavesTaken' label='Leaves Taken' type='number' errors={errors} showLabel={true} />
                    <Input  register={register} styling="w-full" id='carryLeaves' label='Carryforward Leaves' type='number' errors={errors} showLabel={true} />

                </div>
                <div className="md:flex w-full justify-between gap-5.5">
                    <Input  register={register} styling="w-full" id='compoffAdded' label='Compoff Added' type='number' errors={errors} showLabel={true} />
                    <Input  register={register} styling="w-full" id='compoffTaken' label='Compoff Taken' type='number' errors={errors} showLabel={true} />
                </div>
                <div className="md:flex w-full justify-between gap-5.5">
                    <Input  register={register} styling="w-full" id='compoffBalance' label='Compoff Balance' type='number' errors={errors} showLabel={true} />
                    <Input  register={register} styling="w-full" id='paidDays' label='Paid Days' type='number' errors={errors} showLabel={true} />
                </div>
                <div className="md:flex w-full justify-between gap-5.5">
                    <Input  register={register} styling="w-full" id='tds' label='TDS' type='number' errors={errors} showLabel={true} />
                    <Input  register={register} styling="w-full" id='ec' label='EC' type='number' errors={errors} showLabel={true} />
                </div>
                <div className="md:flex w-full justify-between gap-5.5">
                    <Input  register={register} styling="w-full" id='loan' label='Loan' type='number' errors={errors} showLabel={true} />
                    <Input  register={register} styling="w-full" id='others' label='Others' type='number' errors={errors} showLabel={true} />
                </div>
                <Input  register={register} styling="w-full" id='netSalary' label='Net Salary Payable' type='number' errors={errors} showLabel={true} />
                
                <Button disabled={false} >Add</Button>
            </form>
          </div>
        </div>
      </div>
    )
}

export default AddSalary;
