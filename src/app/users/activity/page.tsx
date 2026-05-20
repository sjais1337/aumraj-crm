'use client'

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Input from "@/components/FormElements/Inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Select from "@/components/FormElements/Inputs/Select";
import Textarea from "@/components/FormElements/Inputs/Textarea";
import Button from "@/components/FormElements/Button";
import { createRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSession } from "next-auth/react";
import PersonSearch from "@/components/SelectGroup/PersonSearch";
import CustomerSearch from "@/components/SelectGroup/CustomerSearch";
import { emailRegex, lists, phoneRegex } from "@/libs/consts";
import { useData } from "@/context/DataContext";


const SubmitActivity = () => {

    const { data: session, status } = useSession()
    
    const [ isLoading, setIsLoading ] = useState(false);
    const [ selectedType, setSelectedType ] = useState('');

    const [ contactStatus , setContactStatus ] = useState(true);
    const [ companySelected, setCompanySelected ] = useState(null);
    const [ personSelected, setPersonSelected ] = useState(null);

    const [ isNewCompany, setIsNewCompany ] = useState(false);
    const [ isNewPerson, setIsNewPerson ] = useState(false);

    const handleSelectChange = (event: any) => {
        setSelectedType(event.target.value);
    };


    const ref = createRef<HTMLFormElement>();

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

            const {activity, date} = data;

            if(date == ''){
              return toast.error('Please chose a date.')
            }

            if(selectedType == '' || selectedType == 'Select'){
                return toast.error('Please select a activity type!')
            }

            if(new Date(date) > new Date() ) { 
                return toast.error('Please enter a valid date.')
            }

            if(new Date(new Date().setDate(new Date().getDate() - 3)) > new Date(date)){
                return toast.error(`Date cannot be older than 3 days.`)
            }

            if(activity.length < 10){
                return toast.error('Please elaborate activity.')
            }

            if(selectedType == 'Meeting' || selectedType == 'Telecalling'){
                if(isNewCompany){
                    if(data.companyName == ''){
                      return toast.error('Please fill the company name, or use an existing one.')
                    }
    
                    if(data.personName == '' || data.phoneNo == '' || data.emailId == '') {
                      return toast.error('Please fill all the details.')
                    }
                }

                if(isNewPerson){
                  if(!phoneRegex.test(data.phoneNo)){
                      return toast.error('Please enter a valid phone number.')
                  }
  
                  if(!emailRegex.test(data.emailId)){
                      return toast.error('Please enter a valid email ID.')
                  }
              }
    
                if(!isNewCompany){
                    if(companySelected == null){
                    return toast.error('Please select a company from the list, or add a new one.')
                    }
    
                    data.companyId = companySelected
                }
    
                if(!isNewPerson){
                    if(personSelected == null){
                        return toast.error('Please select a contact from the list, or add a new one.')              
                    }
    
                    data.personId = personSelected
                }
            }
            
            if(selectedType == 'Meeting'){

                const {from, to, km,  parking} = data;

                if(from == ''){
                  return toast.error('Please fill from location.')
                }

                if(to == ''){
                  return toast.error('Please fill to location.')
                }

                if(km == ''){
                  return toast.error('Please mention kilometers travelled.')
                }

                if(parking == ''){
                  return toast.error('Please mention parking cost.')
                }
            }

            axios.post('/api/user/addActivity', data)
            .catch(() => {
                toast.error('Something went wrong! Please report this to admin with a screenshot.')
            })
            .finally(() => { 
                toast.success('Activity entry added!')
                setIsLoading(false);
                reset()
            })

        }catch(error){
            console.log(error)
            toast.error("Something went wrong! Please report this to admin with a screenshot.");
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
    
    return (
        <div>
        <Breadcrumb pageName="Add Activity"></Breadcrumb>
        <div className="w-full grid grid-cols-1 gap-9">
          <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Fill Details
              </h3>
            </div>
            <form ref={ref} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-2">
                <Input register={register} id='date' label='Activity date' type='date' errors={errors} showLabel={true}></Input>
                <Select onChange={handleSelectChange} register={register} id='type' label='Type' items={['Meeting','Office', 'Telecalling']} errors={errors}></Select>
                <Textarea register={register} id='activity' label="Activity" errors={errors}></Textarea>
                
                {(selectedType === 'Meeting' || selectedType === 'Telecalling') && (
              <>
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
              </>
            )}

            {selectedType === 'Meeting'  && (
              <>
                <Input register={register} id='from' label='From' type='text' errors={errors} showLabel={true} />
                <Input register={register} id='to' label='To' type='text' errors={errors} showLabel={true} />
                <Input register={register} id='km' label='Km' type='number' errors={errors} showLabel={true} />
                <Input register={register} id='parking' label='Parking Cost' type='number' errors={errors} showLabel={true} />
              </>
            )}
                <Button disabled={isLoading} >Submit</Button>
            </form>
          </div>
        </div>
      </div>
    )
}

export default SubmitActivity;