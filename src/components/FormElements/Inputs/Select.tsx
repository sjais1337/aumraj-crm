"use client";
import React, { useState } from "react";
import {
  FieldErrors,
  FieldValues,
  UseFormRegister
} from 'react-hook-form';
import clsx from 'clsx';

interface InputProps {
  label: string,
  id: string,
  type?: string,
  required?: boolean,
  register:UseFormRegister<FieldValues>,
  errors: FieldErrors,
  disabled?: boolean,
  items: string[],
  hideLabel?: boolean,
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  styling?: string
}

const Select: React.FC<InputProps> = ({
  label,
  id,
  required,
  errors,
  register,
  disabled,
  items,
  onChange,
  hideLabel,
  styling
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  
  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div className={styling ? styling :''}>
      {!hideLabel && 
        (
          <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
            {label}
          </label>
        )
      }
      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          value={selectedOption}
          id={id}
          disabled={disabled}
          {...register(id, {required})}
          onChange={(e) => {
            setSelectedOption(e.target.value);
            changeTextColor();
            if(onChange){
              onChange(e);
            }
          }}
          className={clsx(`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
            isOptionSelected ? "text-black dark:text-white" : ""
          }`, errors[id] )} >
          <option value="" disabled className="text-body dark:text-bodydark">
            Select
          </option>
          {items.map(value => {
              return (
                <option value={value} key={value} className="text-body dark:text-bodydark">
                  {value}
                </option>
              )
          })}
        </select>

        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2 pointer-events-none">
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              ></path>
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default Select;
