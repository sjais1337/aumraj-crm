'use client'

import { AgGridReact } from 'ag-grid-react'; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import { 
  useEffect,
  useRef,
  useState 
} from 'react';
import {
  IDatasource,
  ColDef,
} from 'ag-grid-community'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { 
  prismaFilter, 
  prismaSort, 
  defaultColDef, 
  formatDate
} from '@/libs/consts';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';


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

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
        field: 'staffsId'
    },
    {
      field: 'date', 
      filter:'agDateColumnFilter',
      sort: 'desc',
      filterParams: { 
        filterOptions: ['inRange'],
      },
      resizable: false,
      valueFormatter: function(params) { 
        return formatDate(params.value)
      }
    },
    {
        field:'companyName', 
        headerName:'Company',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field: 'activity',
      minWidth: 500,
      cellClass: 'wrap-text',
      editable: true,
      wrapText: true,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
        field:'fromLocation', 
        headerName:'From Place',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field:'toLocation', 
        headerName:'To Place',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field:'distance', 
      headerName:'Distance',
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      } 
    },
    {
        field:'parkingCost', 
        headerName:'Parking Cost',
        filter:'agNumberColumnFilter',
        filterParams: { 
          filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
        } 
    }
  ]);

  const gridRef = useRef();
  
  const dataSource: IDatasource = {
    getRows: async (params) => {
      const { startRow, endRow } = params;
      const postData = { 
        startRow: startRow,
        endRow: endRow,
        filterModel: prismaFilter(params.filterModel),
        sortModel: prismaSort(params.sortModel)
      }
      const res = await axios.post('/api/group/reports/conveyance', postData);      
      if(res.status == 401){
          return toast.error('User not authenticated.')
      }
      if(res.status == 500){
          return toast.error('An internal server error occurred! Please report this to development.')
      }
      const { data, count } = res.data.data;
      params.successCallback(data, count);
    }
  }

  const [ parkingCost, setParkingCost ] = useState(0);
  const [ distance, setDistance ] = useState(0);
  const [ conveyance, setConveyance ] = useState(0);


  async function recalculateCosts(params){
    console.log('hi')

    const filterModel = params.api.getFilterModel();
    const res = await axios.post('/api/group/reports/conveyance/calc', {
      filterModel: prismaFilter(filterModel)
    });
    
    const data = res.data;

    setParkingCost(data.parking == null ? 0 : data.parking);
    setDistance(data.distance == null ? 0 : data.distance);
    setConveyance(data.cost == null ? 0 : data.cost);
  }
  
  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';


  return (
    <>
      <Breadcrumb pageName="Conveyance Report"></Breadcrumb>
      <div className='container mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-6.5 mb-6.5'>
      <div className="col-span-1 md:col-span-4 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {conveyance.toLocaleString('en-IN', { style: 'currency', currency: 'INR',  maximumFractionDigits: 0})}
            </h4>
            <span className="text-sm font-medium">Total Conveyance</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg className="fill-primary dark:fill-white" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 320 512" fill="none" ><path d="M160 0c17.7 0 32 14.3 32 32l0 35.7c1.6 .2 3.1 .4 4.7 .7c.4 .1 .7 .1 1.1 .2l48 8.8c17.4 3.2 28.9 19.9 25.7 37.2s-19.9 28.9-37.2 25.7l-47.5-8.7c-31.3-4.6-58.9-1.5-78.3 6.2s-27.2 18.3-29 28.1c-2 10.7-.5 16.7 1.2 20.4c1.8 3.9 5.5 8.3 12.8 13.2c16.3 10.7 41.3 17.7 73.7 26.3l2.9 .8c28.6 7.6 63.6 16.8 89.6 33.8c14.2 9.3 27.6 21.9 35.9 39.5c8.5 17.9 10.3 37.9 6.4 59.2c-6.9 38-33.1 63.4-65.6 76.7c-13.7 5.6-28.6 9.2-44.4 11l0 33.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.9c-.4-.1-.9-.1-1.3-.2l-.2 0s0 0 0 0c-24.4-3.8-64.5-14.3-91.5-26.3c-16.1-7.2-23.4-26.1-16.2-42.2s26.1-23.4 42.2-16.2c20.9 9.3 55.3 18.5 75.2 21.6c31.9 4.7 58.2 2 76-5.3c16.9-6.9 24.6-16.9 26.8-28.9c1.9-10.6 .4-16.7-1.3-20.4c-1.9-4-5.6-8.4-13-13.3c-16.4-10.7-41.5-17.7-74-26.3l-2.8-.7s0 0 0 0C119.4 279.3 84.4 270 58.4 253c-14.2-9.3-27.5-22-35.8-39.6c-8.4-17.9-10.1-37.9-6.1-59.2C23.7 116 52.3 91.2 84.8 78.3c13.3-5.3 27.9-8.9 43.2-11L128 32c0-17.7 14.3-32 32-32z"/></svg>
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-4 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {parkingCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR',  maximumFractionDigits: 0})}
            </h4>
            <span className="text-sm font-medium">Parking Cost</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg className="fill-primary dark:fill-white" xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0  448 512" fill="none" ><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM192 256l48 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-48 0 0 64zm48 64l-48 0 0 32c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64 0-120c0-22.1 17.9-40 40-40l72 0c53 0 96 43 96 96s-43 96-96 96z"/></svg>
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-4 border border-stroke bg-white px-7.5 py-6 md:px-7.5 md:py-6 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {distance} KM
            </h4>
            <span className="text-sm font-medium">Distance Travelled</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg className="fill-primary dark:fill-white" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" fill="none" ><path d="M135.2 117.4L109.1 192l293.8 0-26.1-74.6C372.3 104.6 360.2 96 346.6 96L165.4 96c-13.6 0-25.7 8.6-30.2 21.4zM39.6 196.8L74.8 96.3C88.3 57.8 124.6 32 165.4 32l181.2 0c40.8 0 77.1 25.8 90.6 64.3l35.2 100.5c23.2 9.6 39.6 32.5 39.6 59.2l0 144 0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L96 400l0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L0 256c0-26.7 16.4-49.6 39.6-59.2zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>          
          </div>
        </div>
      </div>
      </div>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          // @ts-ignore
          columnDefs={columnDefs}
          ref={gridRef}
          defaultColDef={defaultColDef}
          rowBuffer={0}
          rowHeight={90}
          rowSelection={'multiple'}
          rowModelType={'infinite'}
          cacheBlockSize={30}
          cacheOverflowSize={2}
          maxConcurrentDatasourceRequests={1}
          infiniteInitialRowCount={10}
          datasource={dataSource}
          onFilterChanged={recalculateCosts}
        />
      </div>
    </>
  );
}
