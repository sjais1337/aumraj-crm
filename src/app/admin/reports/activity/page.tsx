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
  formatDate,
  camelCaseToReadable
} from '@/libs/consts';
import toast from 'react-hot-toast';
import Button from '@/components/FormElements/Button';


const dataSource: IDatasource = {
    getRows: async (params) => {
        const { startRow, endRow } = params;
        const postData = { 
          startRow: startRow,
          endRow: endRow,
          filterModel: prismaFilter(params.filterModel),
          sortModel: prismaSort(params.sortModel)
        }
        const res = await axios.post('/api/admin/reports/activity', postData);
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
        checkboxSelection: true,
        field: 'staffsId', 
        minWidth: 130,
        headerName: 'Employee',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'activityId',
        hide: true
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
      field: 'score',
      width: 70,
      resizable: false,
      filter: false, 
      editable: true,
      onCellValueChanged: function(params){ updateAMC(params) },
      cellDataType: 'number'
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


const updateAMC = async (params: any) => {
    const activityId = params.data.activityId;
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

    const response = await axios.post('/api/admin/reports/activity/update', {
      activityId: activityId,
      field: field,
      value: value
    })

    if(response.status == 200){
      return toast.success('Successfully updated ' + fieldName + '!')
    }else{
      return toast.error('An unexpected error occurred! Please report to development.')
    }
  }


  const [ selectedRows, setSelectedRows ] = useState([]);
  const [ deleteDisabled, setDeleteDisabled ] = useState(true);
  const onSelectionChange = useCallback(
    (event: SelectionChangedEvent) => {
        const data = event.api.getSelectedNodes();
        if(data.length > 0) {
            setSelectedRows(Array.from(event.api.getSelectedNodes()).map(i => i.data.activityId))
            setDeleteDisabled(false);
        }else{ 
            setSelectedRows([]);
            setDeleteDisabled(true);
        }
    }, [window], 
  )


  const deleteSelected = async () => {
    try{
        const response = confirm('Deleting the activity will also delete conveyance and scores data for that particular activity. Do you want to continue?')
    
        if(response == false) {
            return;
        }

        const res = await axios.post('/api/admin/purge/activity', selectedRows);

        if(res.status == 401){
            return toast.error('User not authenticated.')
        }
        if(res.status == 500){
            return toast.error('An internal server error occurred! Please report this to development.')
        }

        toast.success(`Deleted ${selectedRows.length} entries! Refresh the page to see the changes.`)
        return setSelectedRows([]);
    }catch(err) { 

    } 
  }

  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  return (
    <>
      <Breadcrumb pageName="Activity Report"></Breadcrumb>
      <div className="mt-5 mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div></div>

            <nav>
                <div className="flex items-center gap-2">
                    <Button danger={true} onClick={deleteSelected} disabled={deleteDisabled}> Delete </Button>
                </div>
            </nav>
      </div>
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
          onSelectionChanged={onSelectionChange}
          getRowId={(params: GetRowIdParams) => String(params.data.activityId)}
          suppressRowClickSelection={true}
        />
      </div>
    </>
  );
}
