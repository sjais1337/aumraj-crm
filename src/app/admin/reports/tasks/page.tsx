'use client'

import { AgGridReact } from 'ag-grid-react'; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import { 
    useCallback,
  useState 
} from 'react';
import {
  IDatasource,
  ColDef,
  GetRowIdParams,
  SelectionChangedEvent,
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


const dataSource: IDatasource = {
    getRows: async (params) => {
        const { startRow, endRow } = params;
        const postData = { 
            startRow: startRow,
            endRow: endRow,
            filterModel: prismaFilter(params.filterModel),
            sortModel: prismaSort(params.sortModel)
        }
        const res = await axios.post('/api/admin/reports/tasks', postData);
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


export default function ActivityReport(){

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
        field: 'staffsId', 
        minWidth: 130,
        headerName: 'Employee',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'id',
        hide: true
    },
    {
      field: 'date', 
      filter:'agDateColumnFilter',
      headerName: 'Assign Date', 
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
        field: 'markTime', 
        filter:'agDateColumnFilter',
        headerName: 'Close Date',
        filterParams: { 
          filterOptions: ['inRange'],
        },
        resizable: false,
        valueFormatter: function(params) { 
          return formatDate(params.value)
        }
    },
    {
      field: 'message',
      headerName: 'Task',
      minWidth: 400,
      cellClass: 'wrap-text',
      editable: true,
      wrapText: true,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
        field: 'remark',
        minWidth: 400,
        cellClass: 'wrap-text',
        editable: true,
        wrapText: true,
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
  ]);

  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  return (
    <>
      <Breadcrumb pageName="Tasks Report"></Breadcrumb>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          columnDefs={columnDefs}
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
          getRowId={(params: GetRowIdParams) => String(params.data.id)}
          suppressRowClickSelection={true}
        />
      </div>
    </>
  );
}