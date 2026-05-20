'use client'

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Input from "@/components/FormElements/Inputs/Input";
import { Field, FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Select from "@/components/FormElements/Inputs/Select";
import Textarea from "@/components/FormElements/Inputs/Textarea";
import Button from "@/components/FormElements/Button";
import { useState } from "react";
import toast from "react-hot-toast";
import Tags from "@/components/FormElements/Inputs/Tags";
import { useData } from "@/context/DataContext";
import { AgGridReact } from "ag-grid-react";
import { defaultColDef, formatDate, prismaFilter, prismaSort } from '@/libs/consts';
import {
  IDatasource,
  ColDef,
  GetRowIdParams,
  SelectionChangedEvent,
} from 'ag-grid-community'
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import axios from "axios";

const dataSource: IDatasource = {
  getRows: async (params) => {
      const { startRow, endRow } = params;
      const postData = { 
        startRow: startRow,
        endRow: endRow,
      }
      const res = await axios.post('/api/admin/billing/report', postData);
      if(res.status == 401){
          return toast.error('User not authenticated.')
      }
      if(res.status == 500){
          return toast.error('An internal server error occurred! Please report this to development.')
      }
      const { data, count } = res.data.data;
      params.successCallback(data, count);
  }
}

const SlaEntry = () => {

    const [ isLoading, setIsLoading ] = useState(false);
    const [ selectedType, setSelectedType ] = useState('');

    const {
        register,
        unregister,
        reset,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {}
    })

    const data = useData();

    const colorTheme = localStorage.getItem('color-theme');
    const classAddition = colorTheme == '"dark"' ? '-dark' : '';

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
      {
        field: 'billingId',
        headerName: 'Date',
        filter:'agDateColumnFilter',
        cellDataType: 'dateString',
        filterParams: { 
          filterOptions: ['inRange'],
        },
        sort: 'asc',
        minWidth: 120,
        resizable: false,
        valueFormatter: function(params) { 
            return formatDate(params.value);
          }
        },
      {
        field: 'amount',
        cellDataType: 'number'
      }
    ]);

    const updateBilling: SubmitHandler<FieldValues> = async (data) => {
      try{


        if(data.billingTarget == ''){
          return toast.error('Please fill the field.')
        }

        if(isNaN(parseInt(data.billingTarget))){
          return toast.error('The entry is not a number.')
        }

        const res = await axios.get('/api/admin/billing/update?amt=' + data.billingTarget);

        if(res.status == 200){
          return toast.success('Updated the billing target.')
        }else{
          return toast.error('An unexpected error occurred. Please report to development with billing amount.')
        }
      }catch(err){
        console.log(err)
      }
    }
    
    const addBillingUpdate: SubmitHandler<FieldValues> = async (data) => {
      try{

        if(data.billingNow == ''){
          return toast.error('Please fill the field.')
        }

        if(isNaN(parseInt(data.billingNow))){
          return toast.error('The entry is not a number.')
        }

        const res = await axios.get('/api/admin/billing/add?amt=' + data.billingNow);

        if(res.status == 200){
          return toast.success('Updated the billing target.')
        }else{
          return toast.error('An unexpected error occurred. Please report to development with billing amount.')
        }
      }catch(err){
        console.log(err)
      }
    }

    return (
        <div>
        <div className="bg-white  w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-7">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Manage Billing
              </h3>
            </div>  
          <form onSubmit={handleSubmit(addBillingUpdate)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6.5">
                <div className="w-full sm:w-5/6">
                  <Input register={register} id='billingNow' label='Update Billing Achieved' type='number' errors={errors} showLabel={true} />
                </div>
                <div className="w-full sm:w-1/6 flex flex-col justify-end pt-2 sm:pt-0">
                <label className={`block text-sm font-medium leading-6 text-gray-900 mb-2 hidden lg:block`}>
                ‎
              </label>
                  <Button fullWidth>Submit</Button>
                </div>
              </form>
              <div className={`table ag-theme-quartz${classAddition} p-6.5 pt-0`} style={{ height: '40vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
                <AgGridReact
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  rowBuffer={0}
                  rowSelection={'multiple'}
                  rowModelType={'infinite'}
                  cacheBlockSize={30}
                  cacheOverflowSize={2}
                  maxConcurrentDatasourceRequests={1}
                  infiniteInitialRowCount={10}
                  datasource={dataSource}
                  getRowId={(params: GetRowIdParams) => String(params.data.activityId)}
                  suppressRowClickSelection={true}
                />
              </div>
             <form onSubmit={handleSubmit(updateBilling)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pr-6.5 pl-6.5 ">
                <div className="w-full sm:w-5/6">
                  <Input register={register} id='billingTarget' label='Update Billing Target' type='number' errors={errors} showLabel={true} />
                </div>
                <div className="w-full sm:w-1/6 flex flex-col justify-end pt-2 sm:pt-0">
                  <label className={`block text-sm font-medium leading-6 text-gray-900 mb-2 hidden lg:block`}>
                  ‎
                </label>
                  <Button fullWidth>Update</Button>
                </div>
              </form>
        </div>
        <Breadcrumb pageName="Settings"></Breadcrumb>
        
        <div className="w-full grid grid-cols-1 gap-9">
          <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Manage Settings
              </h3>
            </div>
            <div className="p-6 sm:p-10">
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">OEMs</h3>
              <Tags id='oem' initialTags={data.oem}  />

              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">AMC Type</h3>
              <Tags id='slaType' initialTags={data.slaType} />

              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">Opportunity Type</h3>
              <Tags id='opportunity' initialTags={data.opportunity}  />
            
            </div>
          </div>
        </div>
      </div>
    )
}

export default SlaEntry;
