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
  GetRowIdParams,
  SelectionChangedEvent,
} from 'ag-grid-community'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { 
  prismaFilter, 
  prismaSort, 
  defaultColDef 
} from '@/libs/consts';
import toast from 'react-hot-toast';
import SalarySlip from '@/components/SalarySlip/Slip';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const dataSource: IDatasource = {
    getRows: async (params) => {
        const { startRow, endRow } = params;
        const postData = { 
          startRow: startRow,
          endRow: endRow,
          filterModel: prismaFilter(params.filterModel),
          sortModel: prismaSort(params.sortModel)
        }
        const res = await axios.post('/api/user/salary', postData);
        if(res.status == 401){
            return toast.error('User not authenticated.')
        }
        if(res.status == 500){
            return toast.error('An internal server error occurred! Please report this to development.')
        }
        let { data, count } = res.data.data;
        data = data.map(i => {
          let temp = i;
          const { salary, paidDays, ec, tds, loan, others, employee } = i
          let base = ((((+salary) / 30) * (2 / 3)) * (+paidDays)).toFixed(2);
          let hra = ((((+salary) / 30) * (1 / 3)) * (+paidDays)).toFixed(2);
          let gross = ((+hra) + (+base))
          let deductions = ((+ec) + (+tds) + (+loan) + (+others));
          let nsp = Math.round((gross - deductions));
          temp['nsp'] = nsp;
          temp['base'] = base;
          temp['hra'] = hra;
          temp['gross'] = gross;
          temp['deduction'] = deductions;
          temp['pan'] = employee.panNo;
          return i;
        })

        params.successCallback(data, count);
    }
}


export default function SalaryReport(){

  const grid = useRef(null);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {field: 'base', hide: true},
    {field: 'gross', hide: true},
    {field: 'hra', hide: true},
    {field: 'deduction', hide: true},
    {field: 'pan', hide: true},
    {
      field: 'slipId',
      cellRenderer: (params) => {
        const id = params.value;

        return (
          <button id={id} className='px-3 py-1 text-sm font-medium rounded-lg bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200' onClick={handleGenerate}>G</button>
        )
      }
    },
    {
      field: 'month', 
      filter:'agDateColumnFilter',
      filterParams: { 
        filterOptions: ['inRange'],
      },
      sort: 'desc',
      resizable: false,
      valueFormatter: function(params) { 
        const date = new Date(params.value);
        const dateString = date.toLocaleDateString()
        return dateString == 'Invalid Date' ? '' : date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
      }
    },
    {
        field: 'staffsId', 
        minWidth: 130,
        headerName: 'Employee',
        filterParams: { 
          filterOptions: ['contains']
        } 
    },
    {
      field:'salary', 
      cellDataType: 'number',
      headerName:'Salary',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'nsp', 
      cellDataType: 'number',
      headerName:'NSP',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'leavesTaken', 
      cellDataType: 'number',
      headerName:'L Taken',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'leavesAvailable', 
      cellDataType: 'number',
      headerName:'L Available',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'carryLeaves', 
      cellDataType: 'number',
      headerName:'CF Leave',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'compoffAdded', 
      cellDataType: 'number',
      headerName:'CP Added',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'compoffTaken', 
      cellDataType: 'number',
      headerName:'CP Taken',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'compoffBalance', 
      cellDataType: 'number',
      headerName:'Bal CP',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'paidDays', 
      cellDataType: 'number',
      headerName:'Paid Days',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'tds', 
      cellDataType: 'number',
      headerName:'TDS',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'ec', 
      cellDataType: 'number',
      headerName:'EC',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'loan', 
      cellDataType: 'number',
      headerName:'Loan',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    },
    {
      field:'others', 
      cellDataType: 'number',
      headerName:'Other',
      editable: true,
      filter:'agNumberColumnFilter',
      filterParams: { 
        filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
      }
    }
  ]);

  const [ slipData, setSlipData ] = useState({});

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


  const printRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (event) => {
    if(grid.current){
      const rows = grid.current.api.getRenderedNodes();
      const data = rows.filter(i => i.data.slipId == event.target.id)[0].data
      
      setSlipData(data);
    }else{
      return toast.error('Unexpected error occurred! Please report to development.');
    }
  }

  useEffect(() => {
    if(Object.keys(slipData).length == 0){
      return;
    }
    generatePDF();
  }, [slipData])

  const generatePDF = async () => {
    const element = printRef.current;

    element.style.width = '1440px';

    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.85);    

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('exported.pdf');
  };



  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  return (
    <>
      <Breadcrumb pageName="Salary Report"></Breadcrumb>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          ref={grid}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowBuffer={0}
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
      <div style={{maxHeight: '0', maxWidth: '0', overflow:'hidden'}}>
          <SalarySlip ref={printRef} data={slipData}></SalarySlip>   
      </div>
    </>
  );
}