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
import { emailRegex, lists, phoneRegex } from "@/libs/consts";
import { useData } from "@/context/DataContext";
import { redirect } from "next/navigation";


const SupportEntry = () => {

    const { data: session, status } = useSession()
    
    const [ isLoading, setIsLoading ] = useState(false);
    const [ selectedType, setSelectedType ] = useState('');

    const [ contactStatus , setContactStatus ] = useState(true);
    const [ companySelected, setCompanySelected ] = useState(null);
    const [ personSelected, setPersonSelected ] = useState(null);

    const [ isNewCompany, setIsNewCompany ] = useState(false);
    const [ isNewPerson, setIsNewPerson ] = useState(false);
   
    const {
        getValues,
        register,
        reset,
        unregister,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {}
    })

    const [ employees, setEmployees ] = useState({});
    const [ selectedEmployee, setSelectedEmployee ] = useState(null);

    const fetchUsers = async () => {
        fetch('/api/user/fetchUsers')
        .then(response => response.json())
        .then(data => {
            let userReference = {};
            data.forEach(i => {
                userReference[i.name] = i.id;
            })
            setEmployees(userReference);
        })
    }

    const handleEmployeeChange = (event: any) => {
        setSelectedEmployee(employees[event.target.value]);
    }

    useEffect(() => {
        fetchUsers();
    }, [])

    const handleOEMChange = (event: any) => {
        setSelectedType(event.target.value);
        if(event.target.value !== 'Others'){
            unregister('otherOEM')
        }
    }

    useEffect(() => {
        if(isNewCompany){
          setIsNewPerson(true);
        }
    }, [isNewCompany])
  


    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);
        try{

            if(selectedEmployee === null) {
                return toast.error('Please select a employee.')
            }

            data.staffsId = selectedEmployee;

            if(data.type == 'Select' || data.type == ''){
                return toast.error('Please select the support type.')
            }

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

            if(data.description.length <= 10){
                return toast.error('Please elaborate the description.')
            }

            if(data.oem == 'Select' || data.oem == ''){
                return toast.error('Please select an OEM.')
            }

            if(data.oem == 'Others'){
                data.oem = data.otherOEM;
                delete data.otherOEM;
            }

            if(data.status == 'Select' || data.status == ''){
                return toast.error('Please select the status!')
            }

            if(data.closureData == ''){
                return toast.error('Please select a expected closure data.')
            }

            axios.post('/api/user/support/add', data)
            .then((response) =>  {
                toast.success('Support entry added!')
                reset()
            })
            .catch(() => {
                toast.error('Something went wrong! Please report this to development.')
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
        <Breadcrumb pageName="Support Entry"></Breadcrumb>
        <div className="w-full grid grid-cols-1 gap-9">
          <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Fill Support Entry
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-2">
                <Select register={register} onChange={handleEmployeeChange}  id='employee' label='Member' items={Object.keys(employees)} errors={errors}></Select>
                <Select register={register} id='type' label='Support Type' items={data.supportType} errors={errors}></Select>
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
                <Select onChange={handleOEMChange} register={register} id='oem' label='OEM' items={data.oem} errors={errors}></Select>
                {(selectedType === 'Others') && (
                    <Input register={register} id='otherOEM' label='Type OEM name' type='text' errors={errors} showLabel={true} />
                )}
                <Textarea register={register} id='description' label="Description" errors={errors}></Textarea>
                <Select register={register} id='status' label='Status' items={data.supportStatus} errors={errors}></Select>
                <Input register={register} id='closureDate' label='Expected Closure Date' type='date' errors={errors} showLabel={true}></Input>
                <Button disabled={false} >Add Entry</Button>
            </form>
          </div>
        </div>
      </div>
    )
}

export default SupportEntry;