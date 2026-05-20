import Link from "next/link";
import Button from "../FormElements/Button";
import Select from "../FormElements/Inputs/Select";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import axios from "axios";
import * as XLSX from 'xlsx';
import { prismaFilter } from "@/libs/consts";

interface ExportProps {
    filterState: any;
    parent: string;
}

const Export: React.FC<ExportProps> = ({ filterState, parent }) => {

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {}
    })
    

    const [isLoading, setIsLoading ] = useState(false);

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);
        try {
            let filter: any = filterState;


	    if(parent == 'customers'){

            }else if(data.dataset == ''){
                setIsLoading(false);    
                return toast.error('Please chose a category!')
            }else if(data.dataset == 'Past'){
                filter['employee']= {
                    leaveDate: {
                        not: null
                    }
                }
            }else if(data.dataset == 'Current'){
                filter['employee'] ={
                    leaveDate: null
                }
            }else if(data.dataset == 'All'){
                if(filter.employee){
                    delete filter.employee.leaveDate
                }
            }

            const postData = {
                filterModel: filter
            }

            const res = await axios.post('/api/admin/' + parent + '/export', postData);
            
            if(res.status == 401){
                return toast.error('User not authenticated.')
            }
            if(res.status == 500){
                return toast.error('An internal server error occurred! Please report this to development.')
            }

            let dataFinal = res.data;
            let flag = '';

            console.log(dataFinal);

            if(parent == 'customers'){
                dataFinal = await dataFinal.map(person => {
                    console.log(person)

                    return {
                        companyName: person.company?.companyName,
                        personName: person.personName,
                        emailId: person.emailId,
                        phoneNo: person.phoneNo,
                        numberOfBranch: person.company.numberOfBranch == null ? '': person.company.numberOfBranch.toString(), 
                        totalITUsers: person.company.totalITUsers == null ? '' : person.company.totalITUsers.toString(), 
                        firewallModelNo: person.company.firewallModelNo, 
                        firewallAMCDueDate: person.company.firewallAMCDueDate == null ? '' : person.company.firewallAMCDueDate,
                        antiVirusOem: person.company.antiVirusOem,
                        renewalDueDate: person.company.renewalDueDate == null ? '' : person.company.renewalDueDate,
                        L3SwitchModel: person.company.L3SwitchModel,
                        L3AMCDueDate: person.company.L3AMCDueDate == null ? '' : person.company.L3AMCDueDate,
                        L2SwitchModel: person.company.L2SwitchModel,
                        L2AMCDueDate: person.company.L2AMCDueDate == null ? '' : person.company.L2AMCDueDate,
                        wifiModel: person.company.wifiModel,
                        wifiAMCDueDate: person.company.wifiAMCDueDate == null ? '' : person.company.wifiAMCDueDate,
                        VCOEM: person.company.VCOEM ,
                        VCAMCDueDate: person.company.VCAMCDueDate == null ? '' : person.company.VCAMCDueDate,
                        epbxModel: person.company.epbxModel,
                        epbxAMCDute: person.company.epbxAMCDute == null ? '' : person.company.epbxAMCDute,
                        location: person.company.location,
                        state: person.company.state 
                    }
                });
            }else{
                flag = '_'+data.dataset.toUpperCase();
            }

            console.log(dataFinal)

            const worksheet = XLSX.utils.json_to_sheet(dataFinal);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, parent);

            XLSX.writeFile(workbook, parent.toUpperCase() + flag + '.xlsx')

            setIsLoading(false);
            return toast.success('Successfully exported the requested data.')
        }catch(err) { 
            console.log(err);
        }finally{ 

        }
    }

    if(isLoading) return (
        <Loader />
    );

    return (
        <div className="mt-5 mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-title-md3 font-semibold text-black dark:text-white">
                Export Data
            </h2>

            <nav>
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                    
                    {parent != 'customers' && <Select hideLabel={true} errors={errors} items={['Past', 'Current', 'All']} register={register} id='dataset' label=''></Select>}
                    <Button> Export </Button>
                </form>
            </nav>
        </div>
    );
};

export default Export;
