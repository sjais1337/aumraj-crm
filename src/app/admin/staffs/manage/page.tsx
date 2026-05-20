'use client'

import { AgGridReact } from 'ag-grid-react'; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import { 
  useState 
} from 'react';
import {
  ColDef,
} from 'ag-grid-community'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { 
  camelCaseToReadable,
  defaultColDef, 
  formatDate
} from '@/libs/consts';
import toast from 'react-hot-toast';

export default function ActivityReport(){

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
        field: 'name', 
        minWidth: 120,
        headerName: 'Name',
        filterParams: { 
          filterOptions: ['contains']
        },
	editable: true,
	onCellValueChanged: function(params){ updateDetails(params) },
    },
    {
      field: 'id',
      hide: true
    },
    {
        field: 'emailId',
        resizable: false,
        minWidth: 140,
        filterParams: { 
          filterOptions: ['contains']
        }, 
        onCellValueChanged: function(params){ updateDetails(params) },
	cellDataType: 'text',
	editable: true
    },
    {
        field: 'phoneNo',
        resizable: false,
        minWidth: 120,
        filterParams: { 
          filterOptions: ['contains']
        },
        onCellValueChanged: function(params){ updateDetails(params) },
	cellDataType: 'text',
	editable: true
    },
    {
      field: 'joinDate', 
      headerName: 'Join Date',
      filter:'agDateColumnFilter',
      editable: true,
      cellDataType: 'dateString',
      filterParams: { 
        filterOptions: ['inRange'],
      },
      cellEditor: 'agDateStringCellEditor',
      resizable: false,
            onCellValueChanged: function(params){ updateDetails(params) },
      valueFormatter: function(params) { 
        return formatDate(params.value)
    }
    },
    {
        field: 'birthDate', 
        headerName: 'Birthday',
        filter:'agDateColumnFilter',
        editable: true,
        cellDataType: 'dateString',
        filterParams: { 
          filterOptions: ['inRange'],
        },
        cellEditor: 'agDateStringCellEditor',
        resizable: false,
        onCellValueChanged: function(params){ updateDetails(params) },
        valueFormatter: function(params) { 
          return formatDate(params.value)
      }
    },
    {
        field: 'anniversaryDate', 
        headerName: 'Anniversary',
        filter:'agDateColumnFilter',
        editable: true,
        cellDataType: 'dateString',
        filterParams: { 
          filterOptions: ['inRange'],
        },
        cellEditor: 'agDateStringCellEditor',
        resizable: false,
        onCellValueChanged: function(params){ updateDetails(params) },
        valueFormatter: function(params) { 
            return formatDate(params.value)
        }
    },
    {
      field: 'leaveDate', 
      headerName: 'Leave Date',
      filter:'agDateColumnFilter',
      editable: true,
      cellDataType: 'dateString',
      filterParams: { 
        filterOptions: ['inRange'],
      },
      cellEditor: 'agDateStringCellEditor',
      resizable: false,
      onCellValueChanged: function(params){ updateDetails(params) },
      valueFormatter: function(params) { 
        if(params.value == null){
          return '';
        }
        return formatDate(params.value)
      }
    },
    {
        field:'salary', 
        editable: true,
        cellDataType: 'number',
        filter:'agNumberColumnFilter',
        onCellValueChanged: function(params){ updateDetails(params) },
        filterParams: { 
          filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
        } 
    },
    {
        field: 'panNo',
        headerName:'Pan No.',
        resizable: false,
        minWidth: 140,
        editable: true,
        onCellValueChanged: function(params) { updateDetails(params) },
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'aadharNo',
        headerName:'Aadhar No.',
        minWidth: 160,
        resizable: false,
        editable: true,
        cellDataType: 'text',
        onCellValueChanged: function(params){ updateDetails(params) },
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'department',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Sales','Pre Sales','Post Sales','OPCC','Accounts']
        },
        onCellValueChanged: function(params){ updateDetails(params) },
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'post',
        editable: true,
        minWidth: 180,
        onCellValueChanged: function(params){ updateDetails(params) },
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field: 'conveyanceCost',
      editable: true,
      minWidth: 100,
      onCellValueChanged: function(params) { updateDetails(params) }
    },
    {
        field: 'slaEntry',
        onCellValueChanged: (params) => { updatePermissions(params.data.id, params.data.name, params.colDef.field, params.newValue) }, 
        editable: true
    },
    {
      field: 'slaReport',
      onCellValueChanged: (params) => { updatePermissions(params.data.id, params.data.name, params.colDef.field, params.newValue) }, 
      editable: true
    },
    {
        field: 'support',
        onCellValueChanged: (params) => { updatePermissions(params.data.id, params.data.name, params.colDef.field, params.newValue) }, 
        editable: true
    },
    {
      field: 'password',
      cellRenderer: (params) => {
        const id = params.data.id;
        const name = params.data.name

        return (
          <button id={id} className='px-3 py-1 text-sm font-medium rounded-lg bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200' onClick={() => updatePassword(id, name)}>Update</button>
        )
      }
    },
  ]);

  const updatePassword = async (id, name) => {
    const newPassword = window.prompt('Please enter the new password for employee ' + name + '.');

    if(newPassword == null){
      return;
    }

    const res = await axios.get('/api/admin/updatePassword?pass=' + newPassword + '&id=' + id);

    if(res.status == 200){
      return toast.success('Password updated successfully!')
    }
  }

  const updatePermissions = async (staffId, name, field, value) =>{


    const confirm = window.confirm('Do you want to ' + (value == true ? 'grant ' : 'revoke ' ) + field + ' permissions for employee: ' + name  + '?')

    if(confirm == false){
      return;
    }

    const res = await axios.post('/api/admin/updatePermissions', {
      field: field,
      id: staffId,
      value: value
    })

    console.log(res);
  }

  const updateDetails = async (params: any) => {
    const staffsId = params.data.id;
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

    const response = await axios.post('/api/admin/updateStaffs', {
      id: staffsId,
      field: field,
      value: value
    })


    if(response.status == 200){
      return toast.success('Successfully updated ' + fieldName + '!')
    }else{
      return toast.error('An unexpected error occurred! Please report to development.')
    }
  }

  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';
  const [ rowData, setRowData ] = useState([]);

  const onGridReady = async () => {
    const res = await axios.get('/api/admin/manageStaffs');
    if(res.status == 401){
      return toast.error('User not authenticated.')
    }
    if(res.status == 500){
        return toast.error('An internal server error occurred! Please report this to development.')
    }
    const { data } = res;
    const final = data.map(i => {
      i.slaEntry = i.permissions.slaEntry;
      i.slaReport = i.permissions.slaReport;
      i.funnel = i.permissions.funnel;
      i.support = i.permissions.support;

      return i;
    })
    setRowData(final);
  }


  return (
    <>
      <Breadcrumb pageName="Staffs Data"></Breadcrumb>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          rowBuffer={0}
          rowHeight={50}
          onGridReady={onGridReady}
        />
      </div>
    </>
  );
}
