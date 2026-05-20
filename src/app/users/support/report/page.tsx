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
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { 
  prismaFilter, 
  prismaSort, 
  defaultColDef, 
  formatDate,
  lists,
  camelCaseToReadable
} from '@/libs/consts';
import toast from 'react-hot-toast';
import { useData } from '@/context/DataContext';


export default function ActivityReport(){

    const data = useData();

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'type', 
            minWidth: 100,
            headerName: 'Type',
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
          field: 'supportId',
          hide: true
        },
	{
		field: 'staffsId',
		headerName: 'User'
	},
        {
            field: 'companyName', 
            minWidth: 150,
            headerName: 'Company',
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'status', 
            minWidth: 100,
            headerName: 'Status',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              values: data.supportStatus
            },
	    cellDataType: 'text',
            editable: true,
            onCellValueChanged: function(params){ updateSupport(params) },
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'addDate', 
            headerName: 'Start Date',
            filter:'agDateColumnFilter',
            minWidth: 120,
            cellDataType: 'dateString',
            filterParams: { 
                filterOptions: ['inRange'],
            },
            resizable: false,
            valueFormatter: function(params) { 
              return formatDate(params.value)
            }
        },
        {
            field: 'closeDate', 
            headerName: 'End Date',
            filter:'agDateColumnFilter',
            sort: 'desc',
            minWidth: 120,
            cellDataType: 'dateString',
            filterParams: { 
            filterOptions: ['inRange'],
            },
            editable: true,
            onCellValueChanged: function(params){ updateSupport(params) },
            resizable: false,
            valueFormatter: function(params) { 
              const dateString = new Date(params.value).toLocaleDateString()
              return dateString == 'Invalid Date' ? '' : dateString;
            }
        },
        {
            field: 'oem',
            resizable: false,
            filterParams: { 
                filterOptions: ['contains']
            },
        },
        {
            field: 'description', 
            minWidth: 110,
            headerName: 'Description',
            cellDataType: 'text',
            editable: true,
            onCellValueChanged: function(params){ updateSupport(params) },
            filterParams: { 
            filterOptions: ['contains']
            },
            wrapText: true
        },
        {
            field: 'personName', 
            minWidth: 120,
            headerName: 'Person',
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'phoneNo', 
            minWidth: 120,
            headerName: 'Phone No.',
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'emailId', 
            minWidth: 180,
            headerName: 'Email',
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
  ]);

  const updateSupport = async (params: any) => {
    const supportId = params.data.supportId;
    const field = params.column.colId;
    let value = params.newValue;
    const dataType = params.colDef.cellDataType;

    const fieldName = camelCaseToReadable(field);
    
    if(dataType == 'number'){
      value = parseInt(value)
    }

    if(dataType.toLowerCase().includes('date')){
      value = new Date(value)
    }

    const response = await axios.post('/api/user/support/update', {
      supportId: supportId,
      field: field,
      value: value
    })

    if(response.status == 200){
      return toast.success('Successfully updated ' + fieldName + '!')
    }else{
      return toast.error('An unexpected error occurred! Please report to development.')
    }
  }

  const dataSource: IDatasource = {
    getRows: async (params) => {
      const { startRow, endRow } = params;
      const postData = { 
        startRow: startRow,
        endRow: endRow,
        filterModel: prismaFilter(params.filterModel),
        sortModel: prismaSort(params.sortModel)
      }
      const res = await axios.post('/api/user/support/fetch', postData);
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
      <Breadcrumb pageName="Support Report"></Breadcrumb>
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
