"use client";
import React, { useState } from "react";
import {
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";
import clsx from "clsx";

interface InputProps {
  label: string;
  id: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
  items: string[];
  hideLabel?: boolean;
  onChange?: (selectedItems: string[]) => void;
}

const MultiSelect: React.FC<InputProps> = ({
  label,
  id,
  required,
  register,
  errors,
  disabled,
  items,
  hideLabel,
  onChange,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const handleOptionClick = (value: string) => {
    let updatedOptions: string[];
    if (selectedOptions.includes(value)) {
      updatedOptions = selectedOptions.filter((item) => item !== value);
    } else {
      updatedOptions = [...selectedOptions, value];
    }
    setSelectedOptions(updatedOptions);

    if (onChange) {
      onChange(updatedOptions);
    }
  };

  const handleDeselect = (value: string) => {
    const updatedOptions = selectedOptions.filter((item) => item !== value);
    setSelectedOptions(updatedOptions);
    if (onChange) {
      onChange(updatedOptions);
    }
  };

  return (
    <div className="relative">
      {!hideLabel && (
        <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
          {label}
        </label>
      )}
      <div
        className={clsx(
          `relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary cursor-pointer`,
          errors[id]
        )}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <span
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                handleDeselect(option);
              }}
              className="mr-2 mb-1 inline-block bg-gray-200 text-sm text-gray-900 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-white cursor-pointer"
            >
              {option} &times;
            </span>
          ))
        ) : (
          <span className="text-body dark:text-bodydark">Select...</span>
        )}
      </div>

      {dropdownOpen && (
        <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-stroke rounded shadow-lg dark:bg-form-input dark:border-form-strokedark">
          {items.map((value) => (
            <div
              key={value}
              className={clsx(
                "px-4 py-2 text-body dark:text-bodydark cursor-pointer",
                selectedOptions.includes(value)
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              onClick={() => handleOptionClick(value)}
            >
              {value}
            </div>
          ))}
        </div>
      )}

      <select
        id={id}
        multiple
        disabled={disabled}
        {...register(id, { required })}
        value={selectedOptions}
        onChange={(e) => {
          const options = Array.from(
            e.target.selectedOptions,
            (option) => option.value
          );
          setSelectedOptions(options);
          if (onChange) {
            onChange(options);
          }
        }}
        className="hidden"
      >
        {items.map((value) => (
          <option value={value} key={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MultiSelect;
