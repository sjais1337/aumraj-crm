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
    type?: string,
    required?: boolean,
    register: UseFormRegister<FieldValues>,
    errors: FieldErrors,
    disabled?: boolean,
    showLabel: boolean,
    value?: string,
    onChange?: (id: string) => void,
    styling?: string
}

const Input: React.FC<InputProps> = ({
    label,
    id,
    type,
    required,
    errors,
    register,
    disabled,
    value,
    showLabel,
    onChange,
    styling
}) => {
    return ( 
        <div className={styling?styling:''}> 
            <label className={`block text-sm font-medium leading-6 text-gray-900 ${showLabel ? '' : 'hidden'}`} htmlFor={id}>
                {label}
            </label>
            <div className='mt-2'>
                <input onChange={(event) => { onChange(event.target.value) }} value={value} id={id} step="any"  type={type} placeholder={label}  disabled={disabled} autoComplete={id}
                    {...register(id, { required })}
                    className={clsx(`w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`,
                        errors[id]
                    )}
                />
            </div>
        </div>
        
    )
}

export default Input;
