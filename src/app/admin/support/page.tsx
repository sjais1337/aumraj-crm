'use client'

import { AgGridReact } from 'ag-grid-react'; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import { 
  useEffect,
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
import { useData } from '@/context/DataContext';


export default function ActivityReport(){
  const data = useData();

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
          field: 'staffsId',
          minWidth: 160,
          headerName: 'Employee'
        },
        {
            field: 'type', 
            minWidth: 100,
            headerName: 'Type',
            editable: true,
            cellDataType: 'text',
            onCellValueChanged: function(params){ updateSupport(params) },
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              values: data.supportType
            },
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
            field: 'status', 
            minWidth: 100,
            headerName: 'Status',
            editable: true,
            cellDataType: 'text',
            onCellValueChanged: function(params){ updateSupport(params) },
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              values: data.supportStatus
            },
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
            editable: true,
            onCellValueChanged: function(params){ updateSupport(params) },
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
            resizable: false,
            editable: true,
            onCellValueChanged: function(params){ updateSupport(params) },
            valueFormatter: function(params) { 
              return formatDate(params.value)
            }
        },
        {
            field: 'oem',
            resizable: false,
            editable: true,
            onCellValueChanged: function(params){ updateSupport(params) },
            filterParams: { 
                filterOptions: ['contains']
            },
        },
        {
            field: 'description', 
            minWidth: 110,
            headerName: 'Description',
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

    const response = await axios.post('/api/admin/support/update', {
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
      const res = await axios.post('/api/admin/support', postData);
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

  const [ supportSummary, setSupportSummary ] = useState([]);
  const [ supportTotal, setSupportTotal ] = useState({"SUPPORT":0, "DELIVERY": 0, "PAYMENT":0});

  const [ statusSummary, setStatusSummary ] = useState([]);
  const [ statusTotal, setStatusTotal ] = useState({"SUPPORT":0, "DELIVERY": 0, "PAYMENT":0});
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/user/summaries/support'); 
    
      const res = response.data;
      
      console.log(res)

      setSupportSummary(res.type);
      setSupportTotal(res.type.reduce(
        (totals, item) => {
            totals.SUPPORT += item.SUPPORT || 0;
            totals.DELIVERY += item.DELIVERY || 0;
            totals.PAYMENT += item.PAYMENT || 0;
            return totals;
        },
        { SUPPORT: 0, DELIVERY: 0, PAYMENT: 0 }
      ));

      setStatusSummary(res.status);
      setStatusTotal(res.status.reduce(
        (totals, item) => {
            totals.SUPPORT += item.SUPPORT || 0;
            totals.DELIVERY += item.DELIVERY || 0;
            totals.PAYMENT += item.PAYMENT || 0;
            return totals;
        },
        { SUPPORT: 0, DELIVERY: 0, PAYMENT: 0 }
      ));
    }

    fetchData();
  }, [])


  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  return (
    <>
      <Breadcrumb pageName="Support Report"></Breadcrumb>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-6.5">
        <div className="col-span-1 md:col-span-6 border border-stroke bg-white px-6 mb-8 py-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <table className="table-auto w-full text-black dark:text-white">
            <thead>
            <tr>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Name</th>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Planning</th>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Progress</th>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Issues</th>
              </tr>
            </thead>
            <tbody className="">
              {
                statusSummary.map((i,x) => {
                  return <tr key={x+0.4}>
                    <td className="px-3  py-3 font-medium text-sm sm:text-base">{i.name}</td>
                    <td className="px-3  py-3 text-sm sm:text-base">{i['SUPPORT']}</td>
                    <td className="px-3  py-3 text-sm sm:text-base">{i['DELIVERY']}</td>
                    <td className="px-3  py-3 text-sm sm:text-base">{i['PAYMENT']}</td>
                  </tr>
                })
              }
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">Total : {statusTotal.SUPPORT + statusTotal.DELIVERY + statusTotal.PAYMENT}</td>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">{statusTotal.SUPPORT}</td>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">{statusTotal.DELIVERY}</td>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">{statusTotal.PAYMENT}</td>
              </tr>
            </tfoot>
            
          </table>
        </div>
        <div className="col-span-1 md:col-span-6 border border-stroke bg-white px-6 mb-8 py-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <table className="table-auto w-full text-black dark:text-white">
            <thead>
              <tr>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Name</th>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Support</th>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Delivery</th>
                <th className="text-left px-3  py-3 font-semibold text-sm sm:text-base">Payment</th>
              </tr>
            </thead>
            <tbody className="">
              {
                supportSummary.map((i,x) => {
                  return <tr key={x+0.4}>
                    <td className="px-3  py-3 font-medium text-sm sm:text-base">{i.name}</td>
                    <td className="px-3  py-3 text-sm sm:text-base">{i['SUPPORT']}</td>
                    <td className="px-3  py-3 text-sm sm:text-base">{i['DELIVERY']}</td>
                    <td className="px-3  py-3 text-sm sm:text-base">{i['PAYMENT']}</td>
                  </tr>
                })
              }
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">Total : {supportTotal.SUPPORT + supportTotal.DELIVERY + supportTotal.PAYMENT}</td>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">{supportTotal.SUPPORT}</td>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">{supportTotal.DELIVERY}</td>
                <td className="px-3  py-3 font-bold text-sm sm:text-base">{supportTotal.PAYMENT}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
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
