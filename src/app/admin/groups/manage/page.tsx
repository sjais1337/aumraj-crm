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
  camelCaseToReadable,
  defaultColDef, 
  formatDate
} from '@/libs/consts';
import toast from 'react-hot-toast';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/components/FormElements/Inputs/Input';
import Switcher from '@/components/FormElements/Inputs/Switcher';
import Button from '@/components/FormElements/Button';

export default function ActivityReport(){

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
        field: 'name', 
        minWidth: 120,
        headerName: 'Name',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field: 'id',
      hide: true
    },
    {
        field: 'head',
        headerName: 'Head'
    },
    {
        field: 'headId',
        hide: true
    },
    {
        field: 'members',
        minWidth: 400,
        cellClass: 'wrap-text',
        wrapText: true,
    },
    {
        field: 'funnel',
        onCellValueChanged: (params) => { updatePermissions(params.data.id, params.data.name, params.colDef.field, params.newValue) }, 
        editable: true
    },
    {
        field: 'scores',
        onCellValueChanged: (params) => { updatePermissions(params.data.id, params.data.name, params.colDef.field, params.newValue) }, 
        editable: true
    },
    {
        field: 'reports',
        onCellValueChanged: (params) => { updatePermissions(params.data.id, params.data.name, params.colDef.field, params.newValue) }, 
        editable: true
    },
    {
        field: 'Delete',
        cellRenderer: (params) => {
          const id = params.data.id;
          const name = params.data.name
  
          return (
            <button id={id} className='px-3 py-1 text-sm font-medium rounded-lg bg-danger text-white' onClick={() => { deleteGroup(id, name) }}>Delete</button>
          )
        }
      },
  ]);

  const updatePermissions = async (groupId, name, field, value) =>{

    console.log(value);

    const confirm = window.confirm('Do you want to ' + (value == true ? 'grant ' : 'revoke ' ) + field + ' permissions for group: ' + name  + '?')

    console.log(confirm)

    if(confirm == false){
      return;
    }

    const res = await axios.post('/api/admin/groups/update/permissions', {
      field: field,
      id: groupId,
      value: value
    })

    console.log(res);
  }

    const deleteGroup = async (groupId, groupName) => {
        const confirm = window.confirm('Do you want to delete the group ' + groupName  + '?')

        if(!confirm){
            return;
        }

        const response = await axios.get('/api/admin/groups/update/delete?id='+groupId)

        
        if(response.status == 200){
            return toast.success('Successfully deleted the group ' + groupName + '!')
        }else{
            return toast.error('An unexpected error occurred! Please report to devellopment.')
        }
    }

    const colorTheme = localStorage.getItem('color-theme');
    const classAddition = colorTheme == '"dark"' ? '-dark' : '';
    const [ rowData, setRowData ] = useState([]);

    const onGridReady = async () => {
        const res = await axios.get('/api/admin/groups/fetch');
        if(res.status == 401){
            return toast.error('User not authenticated.')
        }
        if(res.status == 500){
            return toast.error('An internal server error occurred! Please report this to development.')
        }
        const { data } = res;
        setRowData(data);
    }

    return (
        <>
            <Breadcrumb pageName="Group Management"></Breadcrumb>
            <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '50vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    rowBuffer={0}
                    rowHeight={90}
                    onGridReady={onGridReady}
                />
            </div>
        </>
    );
}
