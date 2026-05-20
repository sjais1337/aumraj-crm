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
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
function transformData(data) {
  const resultMap = new Map();

  function formatDate(date) {
      const d = new Date(date);
      const month = d.toLocaleString('default', { month: 'short' }).toLowerCase();
      const year = d.getFullYear().toString().slice(-2); // Get last two digits of the year
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

// const colorTheme = localStorage.getItem('color-theme');
const classAddition = '';


export default function ActivityReport(){

  const router = useRouter();
  const tee = useData();

  useEffect(() => {
      const runfun = () => {
        if(!tee.groupData.reports){
          return router.push('/users/permissions'); 
        }
      }
      runfun();
  }, [tee, router])

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

    if (value <= 150) {
      const ratio = value / 150;
      r = 255;
      g = Math.ceil(255 * (1 - ratio));
      b = Math.ceil(255 * (1 - ratio));
  }  else if (value <= 200) {
        const ratio = (value - 151) / 49;
        r = 255;
        g = 255;
        b = Math.ceil(127 * (1 - ratio));
    } else if (value <= 250) {
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
    const response = await axios.post('/api/group/reports/score', {
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


      const monthMap = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };

      const getDateFromKey = (key) => {
          const [month, year] = [key.slice(0, 3), key.slice(3)];
          //@ts-ignore
          return new Date(`20${year}`, monthMap[month.toLowerCase()]);
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
              .filter(key => key.match(/^[a-z]{3}\d{2}$/i) && getDateFromKey(key) >= start)
              .map(key => person[key]);

          //@ts-ignore
          const averageScore = scores.length > 0 ? parseInt(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

          const {joinDate, salary} = salaryMap[person.id] || 0;

          console.log(joinDate, salary)

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

    const sortedKeys = Object.keys(objectWithMostKeys).sort((a, b) => {
      const [monthA, yearA] = [a.slice(0, 3), a.slice(3)];
      const [monthB, yearB] = [b.slice(0, 3), b.slice(3)];
      const dateA = new Date(`20${yearA}-${monthMap[monthA]}-01`);
      const dateB = new Date(`20${yearB}-${monthMap[monthB]}-01`);
      //@ts-ignore
      return dateB - dateA;
    });

    const columns = sortedKeys.map(key => {
      if(key == 'id' || key == 'name'){
        return {
          field: key,
          hide: true
        }
      }

      if(key=='incentive' || key =='averageScore') {
        return {
          field: key,
          hide: true
        }
      }
        return {
            headerName: `${key.slice(0, 3).charAt(0).toUpperCase() + key.slice(0, 3).slice(1)} ${key.slice(3)}`,
            field: key,
            cellStyle: params => heatmapCellStyle(params.value),
            minWidth: 100
        };
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
    fetch('/api/group/fetchStaffs')
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
            <div className='w-full sm:w-2/24'>
              <label className={`block text-sm font-medium leading-6 text-gray-900 mb-2 hidden lg:block`}>
                ‎
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
