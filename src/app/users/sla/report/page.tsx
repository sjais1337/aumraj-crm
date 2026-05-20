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
  camelCaseToReadable
} from '@/libs/consts';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useData } from '@/context/DataContext';


export default function ActivityReport(){
    const data = useData();

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'staffsId', 
            minWidth: 120,
            headerName: 'Employee',
            filter: false,
            filterParams: { 
                filterOptions: ['contains']
            } 
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
            field: 'oem',
            cellDataType: 'text',
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            filterParams: { 
                filterOptions: ['contains']
            },
        },
        {
            field: 'sla',
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            cellEditor: 'agSelectCellEditor',
            cellDataType: 'text',
            cellEditorParams: {
              values: data.slaType
            },
            filterParams: { 
                filterOptions: ['contains']
            },
        },
        {
            field: 'supportType',
            headerName: 'Support Type',
            cellDataType: 'text',
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              values: data.slaSupportType
            },
            filterParams: { 
                filterOptions: ['contains']
            },
        },
        {
            field: 'slaStartDate', 
            headerName: 'Start Date',
            filter:'agDateColumnFilter',
            minWidth: 120,
            cellDataType: 'dateString',
            filterParams: { 
                filterOptions: ['inRange'],
            },
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            resizable: false,
            valueFormatter: function(params) { 
              return formatDate(params.value);        
            }
        },
        {
            field: 'slaEndDate', 
            headerName: 'End Date',
            filter:'agDateColumnFilter',
            sort: 'asc',
            minWidth: 120,
            cellDataType: 'dateString',
            filterParams: { 
            filterOptions: ['inRange'],
            },
            resizable: false,
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            valueFormatter: function(params) { 
              const dateString = new Date(params.value).toLocaleDateString()
              return dateString == 'Invalid Date' ? '' : dateString;
            }
        },
	{
		field: 'serialNo',
		minWidth: 180,
		headerName: 'Serial No',
		cellDataType: 'text',
		editable: true,
		onCellValueChanged: function(params) { updateAMC(params) },
		filterParams: {
			filterOptions: ['contains']
		}
	},
        {
            field: 'contractId', 
            minWidth: 180,
            headerName: 'Contract ID',
            cellDataType: 'text',
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            filterParams: { 
            filterOptions: ['contains']
            } 
        },
        {
            field: 'productDescription', 
	    wrapText: true,
            minWidth: 220,
            headerName: 'Product Description',
            cellDataType: 'text',
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            filterParams: { 
            filterOptions: ['contains']
            } 
        }
  ]);

  const updateAMC = async (params: any) => {
    const slaId = params.data.slaId;
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

    const response = await axios.post('/api/admin/amc/update', {
      slaId: slaId,
      field: field,
      value: value
    })

    if(response.status == 200){
      return toast.success('Successfully updated ' + fieldName + '!')
    }else{
      return toast.error('An unexpected error occurred! Please report to development.')
    }
  }

  const [ count, setCount ] = useState(0)

  const dataSource: IDatasource = {
    getRows: async (params) => {
      const { startRow, endRow } = params;
      const postData = { 
        startRow: startRow,
        endRow: endRow,
        filterModel: prismaFilter(params.filterModel),
        sortModel: prismaSort(params.sortModel)
      }
      const res = await axios.post('/api/user/amc/fetch', postData);
      if(res.status == 401){
        return toast.error('User not authenticated.')
      }
      if(res.status == 500){
          return toast.error('An internal server error occurred! Please report this to development.')
      }
      const { data, count } = res.data.data;
      if(Object.keys(params.filterModel).length == 0){
        setCount(count)
      }
      params.successCallback(data, count);
    }
  }

  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  return (
    <>
      <Breadcrumb pageName="AMC Report"></Breadcrumb>
      <span>Total AMC Cases: { count } </span>
      <div className={`table ag-theme-quartz${classAddition} mt-4`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowBuffer={0}
          rowHeight={130}
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
