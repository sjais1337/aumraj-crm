'use client'

import { AgGridReact } from 'ag-grid-react'; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import { 
  useState 
} from 'react';
import {
  IDatasource,
  ColDef,
} from 'ag-grid-community'
import "ag-grid-enterprise";
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { 
  prismaFilter, 
  prismaSort, 
  defaultColDef, 
  formatDate
} from '@/libs/consts';
import toast from 'react-hot-toast';


export default function ActivityReport(){

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: 'date', 
      filter:'agDateColumnFilter',
      sort: 'desc',
      filterParams: { 
        filterOptions: ['inRange'],
      },
      resizable: false,
      valueFormatter: function(params) { 
        return formatDate(params.value);
      }
    },
    {
      field: 'location',
      resizable: false,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field: 'activity',
      minWidth: 400,
      cellClass: 'wrap-text',
      editable: true,
      wrapText: true,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field: 'companyName', 
      headerName: 'Company',
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field:'personName', 
      headerName: 'Meeting with',
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field:'emailId',
      minWidth: 200,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field:'phoneNo', 
      headerName:'Phone No.',
      filterParams: { 
        filterOptions: ['contains']
      } 
    }
  ]);

  const dataSource: IDatasource = {
    getRows: async (params) => {
      const { startRow, endRow } = params;
      const postData = { 
        startRow: startRow,
        endRow: endRow,
        filterModel: prismaFilter(params.filterModel),
        sortModel: prismaSort(params.sortModel)
      }
      const res = await axios.post('/api/user/reports/activity', postData);
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

  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  return (
    <>
      <Breadcrumb pageName="Activity Report"></Breadcrumb>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowBuffer={0}
          rowHeight={125}
          rowSelection={'multiple'}
          rowModelType={'infinite'}
          cacheBlockSize={30}
          cacheOverflowSize={2}
          maxConcurrentDatasourceRequests={1}
          infiniteInitialRowCount={10}
          datasource={dataSource}
        />
      </div>
    </>
  );
}