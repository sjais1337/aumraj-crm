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
    required?: boolean;
    disabled: boolean;
    selected: string;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onSelect: (id: string) => void;
    onChange: (id: string) => void;
    onPersonStatus: (status: boolean) => void;
    unregister: (name: string) => void;
    all?: boolean;
}

const PersonSearch: React.FC<InputProps> = ({
    required,
    errors,
    selected,
    disabled,
    register,
    onSelect,
    onChange,
    onPersonStatus,
    unregister,
    all
}) => {


    const [ addNew, setAddNew ] = useState(false);
    
    const [ query, setQuery ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ phoneNo, setPhoneNo ] = useState('');

    const [ results, setResults ] = useState([]);
    const [ allData, setAllData ] = useState({});


    useEffect(() => {
        const fetchPersons = async () => {

            if(query.length == 0){
                setResults([]);
                return;
            }

            const response = await fetch('/api/user/search/person?query=' + query + '&company=' + selected)
            const data = await response.json();

            const keys = data.reduce((acc, item) => {
                acc[item.personId] = item;
                return acc;
            }, {});
            
            setResults(data)
            setAllData(keys)
        }

        fetchPersons();
    }, [query])

    useEffect(() => {
        onPersonStatus(addNew)
    }, [addNew])

    const onOutsideClick = () => {
        setResults([]);
        setAllData([]);
    }

    return (
        <>
                {!addNew && (
                    <>
                        <div className='relative'>
                            <OutsideClickHandler onOutsideClick={onOutsideClick}>
                                <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                                    Contact Name

                                    <span 
                                        className='ml-2 text-danger cursor-pointer'
                                        onClick={() => {
                                            if(selected != null){
                                                setAddNew(true)
                                                setEmail('');
                                                setPhoneNo('');
                                                onSelect(null);
                                            }
                                        }}   
                                    >
                                        Add New?
                                    </span>
                                </label>
                                <input 
                                    className='`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none disabled:cursor-default disabled:bg-whiter transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                                    type='text'
                                    id='personName'
                                    value={query}
                                    disabled={disabled}
                                    placeholder='Contact Name'
                                    onChange={(event) => {
                                        setQuery(event.target.value)
                                    }}
                                />
                                {
                                    results.length > 0 && (
                                        <ul className="absolute bg-white z-100 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary shadow-lg max-h-60 overflow-y-auto"  style={{'zIndex':'21'}}>
                                            
                                            {
                                                results.map((result) => (  
                                                    <li
                                                        className="cursor-pointer relative z-20 w-full appearance-none bg-white px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                                        key={result.personId}
                                                        onClick={(event) => {
                                                            const data = allData[result.personId];
                                                            onSelect(result.personId);
                                                            setEmail(data.emailId);
                                                            setPhoneNo(data.phoneNo);
                                                            setQuery(data.personName);
                                                            setResults([])
                                                            setAllData({});
                                                        }}
                                                    >
                                                        {result.personName}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    )
                                }
                            </OutsideClickHandler>
                        </div>
                        <Input register={register} value={email} id='emailId' label='Email ID' type='email' errors={errors} showLabel={true} disabled={true}/>
                        <Input register={register} value={phoneNo} id='phoneNo' label='Phone Number' type='tel' errors={errors} showLabel={true} disabled={true}/>
                    </>
                )}
                {addNew && (
                    <>
                        <div>
                            <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                                New Contact Name

                                <span 
                                    className='ml-2 text-primary cursor-pointer'
                                    onClick={() => {
                                        if(selected != null){
                                            unregister('personName');
                                            setQuery('');
                                            setAddNew(false);
                                        }
                                        // @ts-ignore
                                        // reset({ companyName: '' });
                                        // onSelect(null);
                                        // if (inputRef.current) {
                                        //     inputRef.current.value = '';
                                        // }
                                    }}   
                                >
                                    Use Old?
                                </span>
                            </label>
                            <Input disabled={disabled} register={register} id='personName' label='New Contact Name' type='text' errors={errors} showLabel={false}/>
                        </div>
                        <Input register={register} id='emailId' label='Email ID' type='email' errors={errors} showLabel={true} disabled={false}/>
                        <Input register={register} id='phoneNo' label='Phone Number' type='tel' errors={errors} showLabel={true} disabled={false}/>
                    </>
                )}
            
        </>
    )
}

export default PersonSearch;
