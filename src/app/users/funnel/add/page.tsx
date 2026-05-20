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
import PersonSearch from "@/components/SelectGroup/PersonSearch";
import CustomerSearch from "@/components/SelectGroup/CustomerSearch";
import { emailRegex, phoneRegex } from "@/libs/consts";
import { useData } from "@/context/DataContext";


const FunnelEntry = () => {

    const { data: session, status } = useSession()

    const [ isLoading, setIsLoading ] = useState(false);
    
    const [ contactStatus , setContactStatus ] = useState(true);
    const [ companySelected, setCompanySelected ] = useState(null);
    const [ personSelected, setPersonSelected ] = useState(null);

    const [ isNewCompany, setIsNewCompany ] = useState(false);
    const [ isNewPerson, setIsNewPerson ] = useState(false);
    

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

    useEffect(() => {
      if(isNewCompany){
        setIsNewPerson(true);
      }
    }, [isNewCompany])

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);
        try{
          data.isNewCompany = isNewCompany;
          data.isNewPerson = isNewPerson;

          if(isNewCompany){
            if(data.companyName == ''){
              return toast.error('Please fill in the company name, or use an existing one.')
            }

            if(data.personName == '' || data.phoneNo == '' || data.emailId == '') {
              return toast.error('Please fill in all the details.')
            }
          }

          if(!isNewCompany){
            if(companySelected == null){
              return toast.error('Please select a company from the list, or add a new one.')
            }

            data.companyId = companySelected
          }

          if(isNewPerson){
            if(!phoneRegex.test(data.phoneNo)){
              return toast.error('Please enter a valid phone number.')
            }

            if(!emailRegex.test(data.emailId)){
              return toast.error('Please enter a valid email ID.')
            }
          }

          if(!isNewPerson){
            if(personSelected == null){
              return toast.error('Please select a contact from the list, or add a new one.')              
            }

            data.personId = personSelected
          }

          if(data.type == 'Select'){
            return toast.error('Please select one of the funnel types (AMC/Support)')
          }

          if(data.opportunity == 'Select'){
            return toast.error('Please select the type of opportunity.')
          }

          if(data.oem == 'Select'){
            return toast.error('Please select an OEM.')
          }

          if(data.description.length <= 10){
            return toast.error('Please elaborate the description.')
          }

          if(data.topLine == '' || data.botomLine == '' || data.closureData == ''){
            return toast.error('Please fill in the remaining details.')
          }

          if(isNaN(parseInt(data.bottomLine)) || isNaN(parseInt(data.topLine))){
            return toast.error('The bottom and top lines must be numbers.')
          }

          // if(parseInt(data.bottomLine) < 5000){
          //   return toast.error('The bottom line cannot be lower than 5000!');
          // }

          // if(parseInt(data.topLine) < 50000){
          //   return toast.error('The to line cannot be lower than 5000!');
          // }

          if(data.status == 'Select'){
            return toast.error('Please select the status of funnel.')
          }

          axios.post('/api/user/funnel/add', data)
          .then((response) =>  {
            toast.success('Funnel entry added!')
            reset()
          })
          .catch((err) => {
            toast.error('Something went wrong! Please report this to development, with a screenshot.')
          })
          .finally(() => {
            setIsLoading(false)
          })

        }catch(error){
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSelect = (id) => {
      setCompanySelected(id);
      if(id != null){
        setContactStatus(false);
      }else{
        setContactStatus(true);
      }
    };

    const handleChange = (id) => {
      if(id != null){
        setContactStatus(false);
      }else{
        setContactStatus(true);
      }
    }

    const handlePersonSelct = (id) => {
      setPersonSelected(id);

    }

    const handlePersonChange = (id) => {
    
    }

    const onCompanyStatus = (status) => {
      unregister('phoneNo');
      unregister('emailId');
      setIsNewCompany(status);
    }

    const onPersonStatus = (status) => {
      unregister('phoneNo');
      unregister('emailId');
      setIsNewPerson(status);
    }

    const data = useData();

    return (
        <div>
        <Breadcrumb pageName="Funnel Entry"></Breadcrumb>
        <div className="w-full grid grid-cols-1 gap-9">
          <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Fill Funnel Entry
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-2">
                <CustomerSearch onCompanyStatus={onCompanyStatus} unregister={unregister} onChange={handleChange} onSelect={handleSelect}  register={register} errors={errors} />
                {isNewCompany && (
                  <>
                    <Input register={register} id='personName' label='Contact Name' type='text' errors={errors} showLabel={true}/>
                    <Input register={register} id='emailId' label='Email ID' type='email' errors={errors} showLabel={true} />
                    <Input register={register} id='phoneNo' label='Phone Number' type='tel' errors={errors} showLabel={true} />
                  </>
                )}
                {!isNewCompany && (                  
                    <PersonSearch onPersonStatus={onPersonStatus} selected={companySelected} disabled={contactStatus} unregister={unregister} onSelect={handlePersonSelct} onChange={handlePersonChange} register={register} errors={errors} />
                )}  
                <Select register={register} id='type' label='Type' items={['Supply', 'Software/AMC']} errors={errors}></Select>
                <Select register={register} id='opportunity' label='Opportunity' items={data.opportunity} errors={errors}></Select>
                <Select register={register} id='oem' label='OEM' items={data.oem} errors={errors}></Select>
                <Textarea register={register} id='description' label="Description" errors={errors}></Textarea>
                <Input register={register} id='topLine' label='Top Line' type='number' errors={errors} showLabel={true} />
                <Input register={register} id='bottomLine' label='Bottom Line' type='number' errors={errors} showLabel={true} />
                <Select register={register} id='status' label='Status' items={data.funnelStatus} errors={errors}></Select>
                <Input register={register} id='closureDate' label='Expected Closure Date ' type='date' errors={errors} showLabel={true}></Input>
                <Button disabled={false} >Add</Button>
            </form>
          </div>
        </div>
      </div>
    )
}

export default FunnelEntry;