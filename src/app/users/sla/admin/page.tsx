'use client'

import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"
import { 
  useCallback,
  useState 
} from 'react';
import {
  IDatasource,
  FilterModel,
  ColDef,
  RowHeightParams
} from 'ag-grid-community'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { lists } from '@/libs/consts';
import toast from 'react-hot-toast';


export default function ActivityReport(){

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
        field: 'staffsId', 
        minWidth: 120,
        headerName: 'Employee',
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
        resizable: false,
        filterParams: { 
          filterOptions: ['contains']
        },
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { 
          values: lists.oem
        }
    },
    {
        field: 'sla',
        resizable: false,
        filterParams: { 
          filterOptions: ['contains']
        },
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { 
          values: lists.slaType
        }
    },
    {
        field: 'supportType',
        headerName: 'Support Type',
        resizable: false,
        filterParams: { 
          filterOptions: ['contains']
        },
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { 
          values: lists.supportType
        }
    },
    {
        field: 'slaStartDate', 
        headerName: 'Start Date',
        filter:'agDateColumnFilter',
        minWidth: 120,
        editable: true,
        cellDataType: 'dateString',
        filterParams: { 
          filterOptions: ['inRange'],
        },
        resizable: false,
        valueFormatter: function(params) { 
          const dateString = new Date(params.value).toLocaleDateString()
          return dateString == 'Invalid Date' ? '' : dateString;
        }
    },
    {
        field: 'slaEndDate', 
        headerName: 'End Date',
        filter:'agDateColumnFilter',
        sort: 'desc',
        minWidth: 120,
        editable: true,
        cellDataType: 'dateString',
        filterParams: { 
          filterOptions: ['inRange'],
        },
        resizable: false,
        valueFormatter: function(params) { 
          const dateString = new Date(params.value).toLocaleDateString()
          return dateString == 'Invalid Date' ? '' : dateString;
        }
    },
    {
        field: 'contractId', 
        minWidth: 180,
        headerName: 'Contract ID',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'pdfLocation', 
        minWidth: 110,
        headerName: 'Attatchment',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'productDescription', 
        minWidth: 110,
        headerName: 'Product Description',
        filterParams: { 
          filterOptions: ['contains']
        } 
    }
  ]);

  const prismaFilter = (filterModel: FilterModel) => {
    var filters = {};
    Object.entries(filterModel).forEach(i => {
        
      let temp: any = { }

        if(i[1].filterType == 'date') {
            if(i[1].dateFrom) {
                temp.gte = new Date(i[1].dateFrom)
            }
            if(i[1].dateTo) {
                temp.lte = new Date(i[1].dateTo)
            }
        }

        if(i[1].filterType == 'text') {
            temp = {
                contains: i[1].filter
            }
        }

        if(i[1].filterType == 'number'){
          if(i[1].type == 'lessThanOrEqual') {
            temp.lte = i[1].filter
          } 

          if(i[1].type == 'greaterThanOrEqual') {
            temp.gte = i[1].filter
          }

          if(i[1].type == 'inRange') {
            const { filter, filterTo } = i[1]
            if(filter > filterTo){
              temp.gte = filter
              temp.lte = filterTo
            }else{
              temp.gte = filterTo,
              temp.lte = filter
            }
          }
        }

        filters[i[0]] = temp;
    })

    return filters;
  }

  const prismaSort = (sortModel: any) => {
    var sort = {};
    if(sortModel.length >= 1){
      sort[sortModel[0].colId] = sortModel[0].sort
      return sort;
    }else{
      return {}
    }
  }

  const defaultColDef =  {
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,
      minWidth: 110
  }

  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

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
      params.successCallback(data, count);
    }
  }

  const getRowHeight = useCallback((params: RowHeightParams) => {
    return 300;
  }, [])

  return (
    <>
      <Breadcrumb pageName="Funnel Report"></Breadcrumb>
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
        />
      </div>
    </>
  );
}