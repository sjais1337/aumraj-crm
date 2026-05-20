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
  lists,
  formatDate
} from '@/libs/consts';
import toast from 'react-hot-toast';
import Bar from '@/components/Charts/Bar';
import Pie from '@/components/Charts/Pie';

export default function ActivityReport(){

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
        field: 'companyName', 
        minWidth: 180,
        headerName: 'Company',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field: 'funnelId',
      hide: true
    },
    {
      field: 'type',
      resizable: false,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
        field: 'status',
        resizable: false,
        filterParams: { 
          filterOptions: ['contains']
        },
        cellDataType: 'text',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        onCellValueChanged: function(params){ updateFunnel(params) },
        cellEditorParams: { 
          values: ['Hot', 'Mild', 'Cold', 'Won', 'Lost', 'Dropped']
        }
    },
    {
      field: 'closureDate', 
      headerName: 'Closure Date',
      filter:'agDateColumnFilter',
      sort: 'desc',
      editable: true,
      cellDataType: 'dateString',
      filterParams: { 
        filterOptions: ['inRange'],
      },
      resizable: false,
      onCellValueChanged: function(params){ updateFunnel(params) },
      valueFormatter: function(params) { 
        return formatDate(params.value)
      }
    },
    {
        field:'topLine', 
        cellDataType: 'number',
        headerName:'Top Line',
        filter:'agNumberColumnFilter',
        editable: true,
        onCellValueChanged: function(params){ updateFunnel(params) },
        filterParams: { 
          filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
        } 
    },
    {
        field:'bottomLine', 
        editable: true,
        cellDataType: 'number',
        headerName:'Bottom Line',
        filter:'agNumberColumnFilter',
        onCellValueChanged: function(params){ updateFunnel(params) },
        filterParams: { 
          filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
        } 
    },
    {
        field: 'opportunity',
        resizable: false,
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
        field: 'oem',
        resizable: false,
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field: 'description',
      minWidth: 140,
      cellClass: 'wrap-text',
      wrapText: true,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field:'personName', 
      headerName: 'Contact person',
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field:'phoneNo', 
      minWidth: 125,
      headerName:'Phone No.',
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
      field:'emailId', 
      minWidth: 180,
      headerName:'Email ID',
      filterParams: { 
        filterOptions: ['contains']
      } 
    }
  ]);

  const updateFunnel = async (params: any) => {
    const funnelId = params.data.funnelId;
    const field = params.column.colId;
    let value = params.newValue;
    const dataType = params.colDef.cellDataType;

    if(field == 'topLine' || field == 'bottomLine'){
      const { topLine, bottomLine } = params.data;

      // if(parseInt(bottomLine) < 5000){
      //   return toast.error('The bottom line cannot be lower than 5,000!')
      // }

      // if(parseInt(topLine) < 50000){
      //   return toast.error('The top line cannot be lower than 50,000!')
      // }

      if(parseInt(bottomLine) > parseInt(topLine)){
        return toast.error('The bottom line cannot be more than the top line!')
      }
    }
    
    if(dataType == 'number'){
      value = parseInt(value)
    }

    if(dataType.toLowerCase().includes('date')){
      value = new Date(value)
    }

    const response = await axios.post('/api/user/funnel/update', {
      funnelId: funnelId,
      field: field,
      value: value
    })

    if(response.status == 200){
      return toast.success('Successfully updated ' + field + ' to ' + value + '!')
    }else{
      return toast.error('An unexpected error occurred! Please report to development.')
    }
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
      const res = await axios.post('/api/user/funnel/fetch', postData);
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

  const [ ordersChartOptions, setOrdersChartOptions ] = useState([]);
  const [ TLineChartOptions, setTLineChartOptions ] = useState([]);
  const [ BLineChartOptions, setBLineChartOptions ] = useState([]);

  async function fetchGraph(filters){
    const res = await axios.post('/api/user/funnel/charts', { 
      filters: filters
    });

    if(res.status == 401){
      return toast.error('User not authenticated.')
    }

    if(res.status == 500){
        return toast.error('An internal server error occurred! Please report this to development.')
    }

    const data = res.data;

    let counts = { Hot: 0, Mild: 0, Cold: 0 };
    let netBottomLines = { Hot: 0, Mild: 0, Cold: 0 };
    let netTopLines = { Hot: 0, Mild: 0, Cold: 0 };
    
    data.forEach(item => {
      counts[item.status] += 1;
      netBottomLines[item.status] += item.bottomLine;
      netTopLines[item.status] += item.topLine;
    });

    setOrdersChartOptions([counts['Hot'], counts['Mild'], counts['Cold']])
    setBLineChartOptions([netBottomLines['Hot'], netBottomLines['Mild'], netBottomLines['Cold']])
    setTLineChartOptions([netTopLines['Hot'], netTopLines['Mild'], netTopLines['Cold']])
  }

  const updateGraph = async (params) => {
    const filters = prismaFilter(params.api.getFilterModel());

    fetchGraph(filters)
  }

  const [ summaryMonthly, setSummaryMonthly ] = useState([]);

  useEffect(() => {
    const func = async () => {
      const res = await axios.get('/api/user/funnel/fetch/summary');

      setSummaryMonthly(res.data.monthly);
    }

    func();
  }, [])

  useEffect(() => {
    fetchGraph({})
  }, [])

  return (
    <>
      <Breadcrumb pageName="Funnel Report"></Breadcrumb>
      <div className="container mx-auto p-4">
          <div className="flex flex-row flex-wrap -mx-4">
            <Bar data={ordersChartOptions}  labels={['Hot','Mild','Cold']}  colors={lists.colors} title='Case Count' />
            <Pie title='Top Line' labels={['Hot','Mild','Cold']} data ={TLineChartOptions}  colors={lists.colors} />
            <Pie title='Bottom Line' labels={['Hot','Mild','Cold']} data ={BLineChartOptions}  colors={lists.colors} />
          </div>
      </div>

      <div className="col-span-1 md:col-span-8 border border-stroke mb-8 bg-white px-4 py-4 md:px-4 md:py-4 shadow-default dark:border-strokedark dark:bg-boxdark overflow-x-auto">
        <table className="table-auto w-full text-black dark:text-white">
          <tbody className="">
            <tr >
              <td  className="px-3 sm:px-6 py-2 font-bold text-sm sm:text-base">Month</td>
              {
                summaryMonthly.map((i,x) => {
                  return <td key={x+0.55} className="px-3 sm:px-6 py-2 font-bold text-sm sm:text-base">{i.monthYear}</td>
                })
              }
            </tr>
            <tr >
              <td  className="px-3 sm:px-6 py-2 font-bold text-sm sm:text-base">Total</td>
              {
                summaryMonthly.map((i,x) => {
                  return <td key={x+0.56} className="px-3 sm:px-6 py-2 font-medium text-sm sm:text-base">{i.totalFunnelCases}</td>
                })
              }
            </tr>
            <tr >
              <td  className="px-3 sm:px-6 py-2 font-bold text-sm sm:text-base">Won</td>
              {
                summaryMonthly.map((i,x) => {
                  return <td key={x+0.57} className="px-3 sm:px-6 py-2 font-medium text-sm sm:text-base">{i.wonCases}</td>
                })
              }
            </tr>
            <tr >
              <td  className="px-3 sm:px-6 py-2 font-bold text-sm sm:text-base">Hit</td>
              {
                summaryMonthly.map((i,x) => {
                  return <td key={x+0.58} className="px-3 sm:px-6 py-2 font-medium text-primary text-sm sm:text-base">{i.hitPercentage}%</td>
                })
              }
            </tr>

          </tbody>
        </table>
      </div>

      <div className="table ag-theme-quartz" style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
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
          onFilterChanged={updateGraph}
        />
      </div>
    </>
  );
}
