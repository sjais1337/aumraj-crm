'use client'

import { AgGridReact } from 'ag-grid-react'; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"
import { 
  useCallback,
  useEffect,
  useRef,
  useState 
} from 'react';
import {
  IDatasource,
  ColDef,
  SelectionChangedEvent,
  GetRowIdParams
} from 'ag-grid-community'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { 
  prismaFilter, 
  prismaSort, 
  defaultColDef, 
  formatDate,
  lists
} from '@/libs/consts';
import toast from 'react-hot-toast';
import Bar from '@/components/Charts/Bar';
import Pie from '@/components/Charts/Pie';
import Export from '@/components/Breadcrumbs/Export';
import {  useForm } from "react-hook-form";
import Button from '@/components/FormElements/Button';
import Loader from '@/components/Loader/Loader';

const dataSource: IDatasource = {
  getRows: async (params) => {
    const { startRow, endRow } = params;
    const postData = { 
      startRow: startRow,
      endRow: endRow,
      filterModel: prismaFilter(params.filterModel),
      sortModel: prismaSort(params.sortModel)
    }
    const res = await axios.post('/api/admin/funnel/fetch', postData);
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

export default function AdminFunnelReport(){

  const gridRef = useRef<AgGridReact>();


  const [filters, setFilters] = useState({});
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
        field: 'staffsId', 
        minWidth: 130,
        checkboxSelection: true,
        headerName: 'Employee',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field: 'funnelId',
      hide: true
    },
    {
        field: 'companyName', 
        minWidth: 180,
        headerName: 'Company',
        filterParams: { 
          filterOptions: ['contains']
        } 
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
        onCellValueChanged: function(params){ updateFunnel(params) },
        editable: true,
        cellEditor: 'agSelectCellEditor',
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
      minWidth: 120,
      onCellValueChanged: function(params){ updateFunnel(params) },
      cellEditor: "agDateStringCellEditor",
      valueFormatter: function(params) { 
        return formatDate(params.value);
      }
    },
    {
        field:'topLine', 
        cellDataType: 'number',
        headerName:'Top Line',
        editable: true,
        onCellValueChanged: function(params){ updateFunnel(params) },
        filter:'agNumberColumnFilter',
        filterParams: { 
          filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
        } 
    },
    {
        field:'bottomLine', 
        editable: true,
        cellDataType: 'number',
        headerName:'Bottom Line',
        onCellValueChanged: function(params){ updateFunnel(params) },
        filter:'agNumberColumnFilter',
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
      minWidth: 180,
      cellClass: 'wrap-text',
      editable: true,
      wrapText: true,
      filterParams: { 
        filterOptions: ['contains']
      } 
    },
    {
        field: 'date', 
        headerName: 'Add Date',
        filter:'agDateColumnFilter',
        cellDataType: 'dateString',
        filterParams: { 
          filterOptions: ['inRange'],
        },
        minWidth: 120,
        cellEditor: "agDateStringCellEditor",
        resizable: false,
        valueFormatter: function(params) { 
          return formatDate(params.value);
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

      if(parseInt(bottomLine) > parseInt(topLine)){
        return alert('The bottom line cannot be more than the top line!')
      }
    }

    console.log(dataType);
    
    if(dataType == 'number'){
      value = parseInt(value)
    }

    if(dataType.toLowerCase().includes('date')){
      value = new Date(value)
    }

    const response = await axios.post('/api/admin/funnel/update', {
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

  const updateFilters = () => {
    setFilters(prismaFilter(gridRef.current.api.getFilterModel()));
  }

  const [ selectedRows, setSelectedRows ] = useState([]);
  const [ deleteDisabled, setDeleteDisabled ] = useState(true);

  const [ ordersChartOptions, setOrdersChartOptions ] = useState([]);
  const [ TLineChartOptions, setTLineChartOptions ] = useState([]);
  const [ BLineChartOptions, setBLineChartOptions ] = useState([]);

  const [ propData, setPropData ] = useState(null);

  async function fetchGraph(filters){
    const res = await axios.post('/api/admin/funnel/charts', { 
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
  
    setPropData(data);
  }

  useEffect(() => {
    fetchGraph(filters)
    console.log(filters);
  }, [filters])

  const [ summaryHit, setSummaryHit ] = useState([]);  
  const [ summaryMonthly, setSummaryMonthly ] = useState([]);

  useEffect(() => {
    const func = async () => {
      const res = await axios.get('/api/admin/funnel/fetch/summary');

      setSummaryHit(res.data.summary);
      setSummaryMonthly(res.data.monthly);
    }

    func();
  }, [])

  const onSelectionChange = useCallback(
    (event: SelectionChangedEvent) => {
        const data = event.api.getSelectedNodes();
        if(data.length > 0) {
            setSelectedRows(Array.from(event.api.getSelectedNodes()).map(i => i.data.funnelId))
            setDeleteDisabled(false);
        }else{ 
            setSelectedRows([]);
            setDeleteDisabled(true);
        }
    }, [window], 
  )

  const deleteSelected = async () => {
    try{
        const response = confirm(`Please confirm the deletion of ${selectedRows.length} entries. Click cancel to prevent deletion.`)
    
        if(response == false) {
            return;
        }

        const res = await axios.post('/api/admin/purge/funnel', selectedRows);

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

  if(propData == null){
    return <Loader></Loader>
  }

  return (
    <>
      <Breadcrumb pageName="Team Funnel"></Breadcrumb>
      <div className="container mx-auto p-4">
          <div className="flex flex-row flex-wrap -mx-4">
            <Bar data={ordersChartOptions}  labels={['Hot','Mild','Cold']}  colors={lists.colors} title='Case Count' />
            <Pie title='Top Line' labels={['Hot','Mild','Cold']} data ={TLineChartOptions}  colors={lists.colors} />
            <Pie title='Bottom Line' labels={['Hot','Mild','Cold']} data ={BLineChartOptions}  colors={lists.colors} />
          </div>
      </div>
      
      <div className="col-span-1 md:col-span-8 border border-stroke bg-white px-4 py-4 md:px-4 md:py-4 shadow-default dark:border-strokedark dark:bg-boxdark overflow-x-auto">
        <table className="table-auto w-full text-black dark:text-white">
          <thead>
            <tr>
              <th className="text-left px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base">Name</th>
              <th className="text-left px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base">Won</th>
              <th className="text-left px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base">Total</th>
              <th className="text-left px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base">Hit %</th>
              <th className="text-left px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base">Customers</th>
              <th className="text-left px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base">Cases</th>
            </tr>
          </thead>
          <tbody className="">
            {
              summaryHit.map((i,x) => {
                
                return <tr key={x+0.4}>
                  <td className="px-3 sm:px-6 py-2 font-medium font-semibold text-sm sm:text-base">{i.name}</td>
                  <td className="px-3 sm:px-6 py-2 text-danger font-medium text-sm sm:text-base">{i.wonCases}</td>
                  <td className="px-3 sm:px-6 py-2 text-danger font-medium text-sm sm:text-base">{i.totalFunnelCases}</td>
                  <td className="px-3 sm:px-6 py-2 text-danger font-medium text-sm sm:text-base">{i.hitPercentage}%</td>
                  <td className="px-3 sm:px-6 py-2 text-primary font-medium text-sm sm:text-base">{i.distinctCompanies}</td>
                  <td className="px-3 sm:px-6 py-2 text-primary font-medium text-sm sm:text-base">{i.cases}</td>
                </tr>
              })
            }
          </tbody>
        </table>
      </div>

      <div className="col-span-1 md:col-span-8 border border-stroke mt-8 bg-white px-4 py-4 md:px-4 md:py-4 shadow-default dark:border-strokedark dark:bg-boxdark overflow-x-auto">
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
          ref={gridRef}
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
          onSelectionChanged={onSelectionChange}
          getRowId={(params: GetRowIdParams) => String(params.data.funnelId)}
          suppressRowClickSelection={true}
          onFilterChanged={updateFilters}
        />
      </div>
      <Export filterState={filters} parent='funnel'/>
    </>
  );
}