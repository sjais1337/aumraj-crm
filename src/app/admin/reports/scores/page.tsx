'use client'

import { AgGridReact } from 'ag-grid-react'; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import {  
  useEffect,
  useState  
} from 'react';
import {
  ColDef,
} from 'ag-grid-community'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import {  
  financialYear,
} from '@/libs/consts';
import toast from 'react-hot-toast';
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from '@/components/FormElements/Inputs/Input';
import Button from '@/components/FormElements/Button';
import Loader from '@/components/Loader/Loader';

function transformData(data) {
  const resultMap = new Map();
function formatDate(date: string | Date) {
  const d = new Date(date);
  
  // force consistent 3-letter month abbreviations
  const monthNames = [
    "jan","feb","mar","apr","may","jun",
    "jul","aug","sep","oct","nov","dec"
  ];
  
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2); 
  return `${month}${year}`;
}

  data.forEach(entry => {
      const { id, name, date, score } = entry;
      const monthYear = formatDate(date);
      const key = `${id}-${monthYear}`;
  
      if (!resultMap.has(key)) {
          resultMap.set(key, { id, name, [monthYear]: score });
      } else {
          resultMap.get(key)[monthYear] += score;
      }
  });

  const resultArray = [];
  resultMap.forEach((value, key) => {
      const existingEntry = resultArray.find(item => item.id === value.id);
      if (existingEntry) {
          Object.assign(existingEntry, value);
      } else {
          resultArray.push(value);
      }
  });

  return resultArray;
}

const classAddition = '';

export default function ActivityReport(){

  const [ columnDefs, setColumnDefs ] = useState<ColDef[]>([]);
  const [ rowData, setRowData] = useState([]);

  const defaultColDef = {
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    flex: 1,
    minWidth: 90
  }

  const getColorShade = (value) => {
    if(!value){
      return `rgb(237, 241, 247, 0.2)`
    }
    
    let r, g, b;
    const alpha = 0.7;

    if (value < 150) {
      const ratio = value / 150;
      r = 255;
      g = Math.ceil(255 * (1 - ratio));
      b = Math.ceil(255 * (1 - ratio));
  }  else if (value < 200) {
        const ratio = (value - 151) / 49;
        r = 255;
        g = 255;
        b = Math.ceil(127 * (1 - ratio));
    } else if (value < 250) {
        const ratio = (value - 201) / 49;
        r = Math.ceil(127 * (1 - ratio));
        g = 255;
        b = Math.ceil(127 * (1 - ratio));
    } else {
        r = 128;
        g = 0;
        b = 128;
    }
    return `rgba(${r},${g},${b},${alpha})`; 
  };
  
  const heatmapCellStyle = (value) => {
    return {
      backgroundColor: getColorShade(value),
    };
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: {
        errors
    }
} = useForm<FieldValues>({
    defaultValues: {}
})
  
  const [ data, setData ] = useState([]);

  const [ incentives, setIncentives ] = useState([]);

  const [ propData, setPropData ] = useState<any>([]);

  async function fetchScores(from?, to?){
    const response = await axios.post('/api/admin/reports/score', {
      employee: selectedEmployee,
      from: from == undefined ? '' : from,
      to: to == undefined ? '' : to
    })

    const billing = await axios.get('/api/user/dash');
    const billingPercentage = parseFloat(billing.data.billingPercentage)/100;

    setPropData(billing);

    const data = response.data.scores;
    const salaries = response.data.salaries;

    const uniqueData = Array.from(data.reduce((acc, current) => {
        const key = `${current.date}_${current.id}`;
        if (!acc.has(key)) {
            acc.set(key, current);
        }
        return acc;
    }, new Map()).values());

    let finalData = transformData(uniqueData);

    if(from == undefined && to == undefined && selectedEmployee == null && includeOld == false) {
      let { start }= financialYear();
      start = new Date(start.setDate(start.getDate() - 1));

      // ✅ FIXED: ensure 'sep' is handled consistently
      const monthMap:{[key:string]:number} = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };

      const parseKeyToDate = (key: string): Date => {
            const match = key.match(/^([a-z]+)(\d+)$/i);
            if (!match) return new Date('invalid');
            
            const [, monthStr, yearStr] = match;
            const year = parseInt(yearStr, 10);
            const monthIndex = monthMap[monthStr.toLowerCase()];

            if (monthIndex === undefined) return new Date('invalid');
            return new Date(2000 + year, monthIndex, 1);
        };

      const salaryMap = salaries.reduce((map, item) => {
          map[item.id] = {
            salary: item.salary,
            joinDate: item.joinDate
          };
          return map;
      }, {});

      const updatedArr1 = finalData.map(person => {
          let { start, end } = financialYear();

          const scores = Object.keys(person)
              .filter(key => {
                const keyDate = parseKeyToDate(key);
                return !isNaN(keyDate.getTime()) && keyDate >= start;
               })
              .map(key => person[key as keyof typeof person]);

          //@ts-ignore
          const averageScore = scores.length > 0 ? parseInt(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

          const {joinDate, salary} = salaryMap[person.id] || 0;

          let m = new Date(joinDate);

          const monthDiff = (dateFrom, dateTo) => {
              return dateTo.getMonth() - dateFrom.getMonth() + 
                (12 * (dateTo.getFullYear() - dateFrom.getFullYear())) + 1
           }
  
          let workMonths = m < start ? monthDiff(start, end) : monthDiff(m, end);

          let incentive = 
            (averageScore >= 250 ? 0.25 * billingPercentage * salary * workMonths :
            averageScore >= 200 ? 0.15 * billingPercentage * salary * workMonths :
            averageScore >= 150 ? 0.06 * billingPercentage * salary * workMonths: 
            0).toFixed(0);

          return {
              ...person,
              incentive,
              averageScore,
          };
      });

      finalData = updatedArr1;
    }

    const objectWithMostKeys = finalData.reduce((maxObj, currentObj) => {
        return Object.keys(currentObj).length > Object.keys(maxObj).length ? currentObj : maxObj;
    }, {});

    const allMonthKeys = new Set<string>();
    finalData.forEach(person => {
        Object.keys(person).forEach(key => {
            if (key.match(/^[a-z]+(\d+)$/i)) { 
                allMonthKeys.add(key);
            }
        });
    }); 

   // ✅ FIXED: consistent month mapping includes 'sep'
   const monthMap = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12
    };

    const parseKey = (key) => {
        const match = key.match(/^([a-z]+)(\d+)$/i);
        if (!match) {
            return { year: 0, month: 0 };
        }
        const [, monthStr, yearStr] = match;
        return {
            year: parseInt(yearStr, 10),
            month: monthMap[monthStr.toLowerCase()] || 0
        };
    };

    const sortedKeys = Array.from(allMonthKeys).sort((a, b) => {
        const keyA = parseKey(a);
        const keyB = parseKey(b);

        if (keyA.year !== keyB.year) {
            return keyB.year - keyA.year;
        }
        return keyB.month - keyA.month;
    });

    const columns = sortedKeys.map(key => {
        const match = key.match(/^([a-z]+)(\d+)$/i);
        if (match) {
            const monthStr = match[1];
            const yearStr = match[2];
            return {
                headerName: `${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)} ${yearStr}`,
                field: key,
                cellStyle: params => heatmapCellStyle(params.value),
                minWidth: 100
            };
        }

        if (key === 'id' || key === 'name' || key === 'incentive' || key === 'averageScore') {
            return { field: key, hide: true };
        }

        return { field: key };
    });

    if(from != undefined || to != undefined || includeOld == true || selectedEmployee != null){
      setColumnDefs([{ headerName: "Staffs", field: "name", minWidth: 150 }, ...columns])     
    }else{
      setColumnDefs([{ headerName: "Staffs", field: "name", minWidth: 150 }, { headerName: "Avg. Score", field: "averageScore", minWidth: 120,  cellStyle: params => heatmapCellStyle(params.value),}, { headerName: "Incentive", field: "incentive", minWidth: 120 }, ...columns])
    }
    
    setRowData(finalData)
  }

  useEffect(() => {
    fetchScores();
  }, [data])

  const [ selectedEmployee, setSelectedEmployee ] = useState(null);
  
  const [ employees, setEmployees ] = useState({});
  const [ includeOld, setIncludeOld ] = useState(false);

  const fetchUsers = async (data) => {
    fetch('/api/admin/fetchStaffs?old=' + data)
    .then(response => response.json())
    .then(data => {
        let userReference = {};
        data.forEach(i => {
            userReference[i.name] = i.id;
        })
        setEmployees(userReference);
    })
}

  useEffect(() => {
    fetchUsers(includeOld);
  }, [includeOld])

  const handleEmployeeChange = (event: any) => {
      setSelectedEmployee(employees[event.target.value]);
  }

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try{
      if(data.from == '' && data.to == '' && selectedEmployee == null) {
        return toast.error('Please choose atleast one parameter to filter.')
      }

      if((data.to + data.from).length < 11 && (data.to + data.from) != '') {
        return toast.error('Please fill in both the dates.')
      }

      if(data.to !== '' && data.from !== ''){
        fetchScores(data.from, data.to);
        return;
      }

      if(selectedEmployee != null){
        fetchScores('', '')
        return;
      }
    }catch(error){
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      
    }
  }

  if(propData.length == 0){
    return <Loader></Loader>
  }

  return (
    <>
      <Breadcrumb pageName="Score Report"></Breadcrumb>
      <div className="bg-white  w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-7">
          <form onSubmit={handleSubmit(onSubmit)} className='pt-1 pr-6.5 pl-6.5 mt-5 mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className="w-full sm:w-7/24">
                <Input register={register} id='from' label='From date' type='date' errors={errors} showLabel={true} />
            </div>
            <div className="w-full sm:w-7/24">
                <Input register={register} id='to' label='To date' type='date' errors={errors} showLabel={true} />
            </div>
            <div className='w-full sm:w-7/24'>
              <div>
                  <label className="mb-2.5 block text-sm font-medium leading-6 text-gray-900">
                      Employee
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <select onChange={handleEmployeeChange} className='relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'>
                          <option value="" className="text-body dark:text-bodydark">Select</option>
                          {Object.keys(employees).map(value => {
                              return (
                                  <option value={value} key={value} className="text-body dark:text-bodydark">
                                  {value}
                                  </option>
                              )
                          })}
                      </select>
                      <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path fillRule="evenodd" clipRule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill=""></path> </g></svg>
                      </span>
                  </div>
              </div>
            </div>
            <div className='w-20 sm:w-1/24'>
              <label className={`block text-sm font-medium leading-6 text-gray-900 mb-2 hidden lg:block`}>
                   
                </label>
                <div>
                  <label
                    className="cursor-pointer select-none items-center"
                  >
                    <div className="relative">
                      <input
                        type='checkbox'
                        className="sr-only"
                        onChange={(e) => {
                            setIncludeOld(!includeOld)
                        }}
                      />
                      <div className="block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]"></div>
                      <div
                        className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
                          includeOld && "!right-1 !translate-x-full !bg-primary dark:!bg-white"
                        }`}>
                        <span className={`hidden ${includeOld && "!block"}`}>
                          <svg
                            className="fill-white dark:fill-black"
                            width="11"
                            height="8"
                            viewBox="0 0 11 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                              fill=""
                              stroke=""
                              strokeWidth="0.4"
                            ></path>
                          </svg>
                        </span>
                        <span className={`${includeOld && "hidden"}`}>
                          <svg
                            className="h-4 w-4 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
            </div>
            <div className='w-full sm:w-2/24'>
              <label className={`block text-sm font-medium leading-6 text-gray-900 mb-2 hidden lg:block`}>
                
              </label>
              <Button fullWidth>Filter</Button>
            </div>
          </form>
      </div>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          // @ts-ignore
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
        />
      </div>
    </>
  );
}

