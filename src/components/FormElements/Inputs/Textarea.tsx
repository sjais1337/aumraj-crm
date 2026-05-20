'use client'

import clsx from 'clsx';

import {
    FieldErrors,
    FieldValues,
    UseFormRegister
} from 'react-hook-form';

interface InputProps {
    label: string,
    id: string,
    required?: boolean,
    register: UseFormRegister<FieldValues>,
    errors: FieldErrors,
    disabled?: boolean
}

const Textarea: React.FC<InputProps> = ({
    label,
    id,
    required,
    errors,
    register,
    disabled
}) => {
    return ( 
        <div> 
            <label className="block text-sm font-medium leading-6 text-gray-900" htmlFor={id}>
                {label}
            </label>
            <div className='mt-2'>
                <textarea rows={1}  id={id}   disabled={disabled} autoComplete={id} placeholder={label}
                    {...register(id, { required })}
                    className={clsx(`w-full block rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`,
                        errors[id]
                    )}
                ></textarea>
            </div>
        </div>
        
    )
}

export default Textarea;