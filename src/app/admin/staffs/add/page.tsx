'use client'

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Input from "@/components/FormElements/Inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Select from "@/components/FormElements/Inputs/Select";
import Button from "@/components/FormElements/Button";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSession } from "next-auth/react";
import Switcher from "@/components/FormElements/Inputs/Switcher";
import { phoneRegex } from "@/libs/consts";
import Loader from "@/components/Loader/Loader";


const SubmitActivity = () => {

    const [isLoading, setIsLoading ] = useState(false);
    const [selectedType, setSelectedType ] = useState('');

    const handleSelectChange = (event: any) => {
        setSelectedType(event.target.value);
    };

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
            if(Object.values(data).some(value => value === '')){
                return toast.error('Please fill in all the details.')
            }

            if(data.department == 'Select'){
                return toast.error('Please select a department.')
            }

            if(!phoneRegex.test(data.phone)){
                return toast.error('Please enter a valid phone number.')
            }

            if(data.otherDepartment){
                data.department = data.otherDepartment;

                delete data.otherDepartment 
            }

            const res = await axios.post('/api/admin/register', data);
            
            if(res.status == 401){
                return toast.error('User not authenticated.')
            }
            if(res.status == 500){
                return toast.error('An internal server error occurred! Please report this to development.')
            }

            return toast.success('New staff added.');
        }catch(error){
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    if(isLoading) return (
        <Loader />
    );

    return (
        <div>
            <Breadcrumb pageName="Add Staffs"></Breadcrumb>
            <div className="w-full grid grid-cols-1 gap-9">
            <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Fill Details 
                </h3>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-2">
                    <Input register={register} id='name' label='Name' type='text' errors={errors} showLabel={true} />
                    <Input register={register} id='email' label='Email' type='email' errors={errors} showLabel={true} />
                    <Input register={register} id='password' label='Password' type='password' errors={errors} showLabel={true} />
                    <Input register={register} id='phone' label='Phone Number' type='tel' errors={errors} showLabel={true} />
                    <Select onChange={handleSelectChange} register={register} id='department' label='Department' items={['Sales','Pre Sales','Post Sales','OPCC','Accounts']} errors={errors}></Select>
                    {(selectedType === 'Others') && (
                        <Input register={register} id='otherDepartment' label='Type department name' type='' errors={errors} showLabel={true} />
                    )}
                    <Input register={register} id='post' label='Post' type='text' errors={errors} showLabel={true} />
                    <Input register={register} id='salary' label='Salary' type='number' errors={errors} showLabel={true} />
                    <Input register={register} id='aadharNo' label='Aadhar' type='text' errors={errors} showLabel={true} />
                    <Input register={register} id='pan' label='Pan' type='text' errors={errors} showLabel={true} />
                    
                    <Input register={register} id='joinDate' label='Join date' type='date' errors={errors} showLabel={true}></Input>
                    <Input register={register} id='birthDate' label='Birthday' type='date' errors={errors} showLabel={true}></Input>
                    <Input register={register} id='anniversaryDate' label='Anniversary' type='date' errors={errors} showLabel={true}></Input>
                    <Switcher  register={register} id='slaEntryPerms' label='AMC Entry Perms' showLabel={true} errors={errors}></Switcher>
                    <Switcher register={register} id='slaReportPerms' label='AMC Report Perms' showLabel={true} errors={errors}></Switcher>
                    <Switcher  register={register} id='supportPerms' label='Support Perms' showLabel={true} errors={errors}></Switcher>
                    <Button disabled={false} >Submit</Button>
                </form>
            </div>
            </div>
        </div>
    )
}

export default SubmitActivity;
