import { useState, useEffect, useRef } from 'react';
import Input from '../FormElements/Inputs/Input';

import {
    FieldErrors,
    FieldValues,
    UseFormRegister,
    useForm
} from 'react-hook-form';
import OutsideClickHandler from '@/context/OutsideClickHandler';

interface InputProps {
    required?: boolean,
    register: UseFormRegister<FieldValues>,
    errors: FieldErrors,
    onSelect: (id: string) => void;
    onChange?: (id: string) => void;
    onCompanyStatus?: (status: boolean) => void;
    unregister: (name: string) => void;
}

const CustomerSearch: React.FC<InputProps> = ({
    required,
    errors,
    register,
    onSelect,
    onChange,
    onCompanyStatus,
    unregister
}) => {
    const [ query, setQuery ] = useState('');
    const [ results, setResults ] = useState([]);
    const [ selected, setSelected ] = useState(null);
    const [ addNew, setAddNew ] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const { reset } = useForm();

    useEffect(() => {
        const fetchCustomers = async () => {
            if(query.length == 0){
                setResults([]);
                return;
            }

            const response = await fetch(`/api/user/search/company?query=${query}`);
            const data = await response.json();
            setResults(data);
        }

        fetchCustomers();
    }, [query])

    useEffect(() => {
        if(onCompanyStatus){
            onCompanyStatus(addNew)
        }
    }, [addNew])

    useEffect(() => {
        if(addNew){
            return onChange('works');
        }
        onChange(selected);
    }, [selected])

    const handleOutsideClick = () => {
        setResults([]);
    }

    return (
        <div className="relative">
            { !addNew && (
                <OutsideClickHandler onOutsideClick={handleOutsideClick}>
                    <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                        Company Name

                        <span 
                            className='ml-2 text-danger cursor-pointer'
                            onClick={() => {
                                setSelected(null);
                                setQuery('');
                                setResults([]);
                                onSelect(null);
                                setAddNew(true);
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                }
                            }}   
                        >
                            Add New?
                        </span>
                    </label>
                    <input 
                        className='`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:focus:border-primary'
                        type='text'
                        id='companyName'
                        value={query}
                        placeholder='Company Name'
                        onChange={(event) => {
                            if(!addNew){
                                setSelected(null);
                            }
                            setQuery(event.target.value);
                        }}
                    />
                    {
                        results.length > 0 && (
                            <ul className="absolute bg-white z-100 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary shadow-lg max-h-60 overflow-y-auto"  style={{'zIndex':'21'}}>
                                {
                                    results.map((result) => (  
                                        <li
                                            className="cursor-pointer relative z-20 w-full appearance-none bg-white px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            key={result.customerId}
                                            onClick={() => {
                                                setSelected(result.customerId);
                                                setQuery(result.companyName);
                                                setResults([]);
                                                onSelect(result.customerId);
                                            }}
                                        >
                                            {result.companyName}
                                        </li>
                                    ))
                                }
                            </ul>
                        )
                    }
                </OutsideClickHandler>
            )}
            { addNew && (
                <>
                    <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                        New Company

                        <span 
                            className='ml-2 text-primary cursor-pointer'
                            onClick={() => {
                                // @ts-ignore
                                reset({ companyName: '' });
                                setQuery('');
                                setResults([]);
                                setSelected(null);
                                onSelect(null);
                                setAddNew(false);
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                }
                                unregister('companyName');
                            }}   
                        >
                            Use Old?
                        </span>
                    </label>
                    <Input register={register} id='companyName' label='New Company' type='text' errors={errors} showLabel={false}/>
                </>
            ) }
           
        </div>
    )
}

export default CustomerSearch;