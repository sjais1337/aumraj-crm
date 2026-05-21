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
  INumberFilterParams,
  IFilterOptionDef
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
import Switcher from '@/components/FormElements/Inputs/Switcher';
import { useForm, FieldValues } from 'react-hook-form';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import Export from '@/components/Breadcrumbs/Export';
import { useRouter } from 'next/navigation';

const dataSourceUnarchived = {
  getRows: async (params) => {
    let filterModel = prismaFilter(params.filterModel)
    filterModel['archived'] = false;
    const { startRow, endRow } = params;
    const postData = { 
      startRow: startRow,
      endRow: endRow,
      filterModel: filterModel,
      sortModel: prismaSort(params.sortModel)
    }
    const res = await axios.post('/api/admin/amc/report', postData);
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

const dataSourceArchived = {
  getRows: async (params) => {
    let filterModel = prismaFilter(params.filterModel)
    filterModel['archived'] = true;
    const { startRow, endRow } = params;
    const postData = { 
      startRow: startRow,
      endRow: endRow,
      filterModel: filterModel,
      sortModel: prismaSort(params.sortModel)
    }
    const res = await axios.post('/api/admin/amc/report', postData);
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
  const booleanFilter = {
    filterOptions: [
      {
        displayKey: 'true',
        displayName: 'True',
        predicate: (_, cellValue) => cellValue === true,
        numberOfInputs: 0,
      },
      {
        displayKey: 'false',
        displayName: 'False',
        predicate: (_, cellValue) => cellValue === false,
        numberOfInputs: 0,
      },
    ],
    suppressAndOrCondition: true,
  };

  const [ gridApi, setGridApi ] = useState(null);
  const [ seeArchived, setSeeArchived ] = useState(false)

  const gridRef = useRef(null);

  const data = useData();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'staffsId', 
            checkboxSelection: true,
            minWidth: 120,
            headerName: 'Employee',
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
          field: 'slaId',
          hide: true
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
            field: 'slaStartDate', 
            headerName: 'Start Date',
            filter:'agDateColumnFilter',
            minWidth: 120,
            cellDataType: 'dateString',
            filterParams: { 
                filterOptions: ['inRange'],
            },
            resizable: false,
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            valueFormatter: function(params) { 
              return formatDate(params.value)
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
              return formatDate(params.value)
            }
        },
        {
          field: 'serialNo',
          minWidth: 180,
          headerName: 'Serial No',
          editable: true,
          onCellValueChanged: function(params){ updateAMC(params) },
          filterParams: { 
            filterOptions: ['contains']
          } 
        },
        {
          field: 'productDescription', 
          minWidth: 220,
          headerName: 'Product Description',
          cellDataType: 'text',
          editable: true,
          onCellValueChanged: function(params){ updateAMC(params) },
          filterParams: { 
            filterOptions: ['contains']
          } 
      },
        {
            field: 'contractId', 
            minWidth: 180,
            headerName: 'Contract ID',
            editable: true,
            onCellValueChanged: function(params){ updateAMC(params) },
            filterParams: { 
            filterOptions: ['contains']
            } 
        },
        {
          field: 'sla',
          cellDataType: 'text',
          editable: true,
          onCellValueChanged: function(params){ updateAMC(params) },
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: data.slaType
          },
          filterParams: { 
              filterOptions: ['contains']
          },
      },
      {
          field: 'supportType',
          cellDataType: 'text',
          headerName: 'Support Type',
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
          field: 'emailId', 
          minWidth: 220,
          headerName: 'Email ID',
          editable: false,
          cellDataType: 'text',
          filter: false
        },
        {
          field: 'phoneNo', 
          minWidth: 120,
          headerName: 'Phone No.',
          editable: false,
          cellDataType: 'text',
          filter: false
        },
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
  
  const [ archiveDisabled, setArchiveDisabled ] = useState(true);
  const [ unarchiveDisabled, setUnarchiveDisabled ] = useState(true);
  const [ deleteDisabled, setDeleteDisabled ] = useState(true);

  const [ selectedRowsArchived, setSelectedRowsArchived ] = useState([]);
  const [ selectedRowsUnarchived, setSelectedRowsUnarchived ] = useState([]);

  const onSelectionChangeArchived = useCallback(
    (event: SelectionChangedEvent) => {
        const data = event.api.getSelectedNodes();
        if(data.length > 0) {
            setSelectedRowsArchived(Array.from(event.api.getSelectedNodes()).map(i => i.data.slaId))
            setUnarchiveDisabled(false);
            setDeleteDisabled(false);
        }else{ 
            setSelectedRowsArchived([]);
            setUnarchiveDisabled(true);
            setDeleteDisabled(true);
        }
    }, [window], 
  )

  const onSelectionChangeUnarchived = useCallback(
    (event: SelectionChangedEvent) => {
        const data = event.api.getSelectedNodes();
        if(data.length > 0) {
            setSelectedRowsUnarchived(Array.from(event.api.getSelectedNodes()).map(i => i.data.slaId))
            setArchiveDisabled(false);
            setDeleteDisabled(false);
        }else{ 
            setSelectedRowsUnarchived([]);
            setArchiveDisabled(true);
            setDeleteDisabled(true);
        }
    }, [window], 
  )

  const archiveSelected = async () => {
    try{
        const response = confirm('A total of ' + selectedRowsUnarchived.length + ' AMC entries will be archived. Do you wish to continue?')
    
        if(response == false) {
            return;
        }

        const res = await axios.post('/api/admin/purge/amc/archive', selectedRowsUnarchived);

        if(res.status == 401){
            return toast.error('User not authenticated.')
        }
        if(res.status == 500){
            return toast.error('An internal server error occurred! Please report this to development.')
        }

        toast.success(`Archived ${selectedRowsUnarchived.length} AMC entries! Refresh the page to see the changes.`)
        return setSelectedRowsUnarchived([]);
    }catch(err) { 
      toast.error('An unexpected error occurred! Please report to development.')
    } 
  }

  const unarchiveSelected = async () => {
    try{
        const response = confirm('A total of ' + selectedRowsArchived.length + ' archived AMC entries will be unarchived. Do you wish to continue?')
    
        if(response == false) {
            return;
        }

        const res = await axios.post('/api/admin/purge/amc/unarchive', selectedRowsArchived);

        if(res.status == 401){
            return toast.error('User not authenticated.')
        }
        if(res.status == 500){
            return toast.error('An internal server error occurred! Please report this to development.')
        }

        toast.success(`Unarchived ${selectedRowsArchived.length} AMC entries! Refresh the page to see the changes.`)
        return setSelectedRowsArchived([]);
    }catch(err) { 
      toast.error('An unexpected error occurred! Please report to development.')
    } 
  }

  const [filteredRowCount, setFilteredRowCount] = useState(0);

  const [filters, setFilters] = useState<{ archived: boolean }>({ archived: false });

  const buildAmcFilters = (gridFilterModel: Record<string, unknown>) => ({
    ...prismaFilter(gridFilterModel),
    archived: seeArchived,
  });

  const onFilterChanged = () => {
    if (!gridRef.current?.api) return;
    setFilters(buildAmcFilters(gridRef.current.api.getFilterModel()));
  };

  useEffect(() => {
    if (gridRef.current?.api) {
      setFilters(buildAmcFilters(gridRef.current.api.getFilterModel()));
    } else {
      setFilters({ archived: seeArchived });
    }
  }, [seeArchived]);

  const deleteSelected = async () => {
    try{
      const rows = selectedRowsArchived.length == 0 ? selectedRowsUnarchived : selectedRowsArchived;

      const response = confirm('A total of ' + rows.length + ' AMC entries will be deleted. Do you wish to continue?')
  
      if(response == false) {
          return;
      }

      const res = await axios.post('/api/admin/purge/amc', rows);

      if(res.status == 401){
          return toast.error('User not authenticated.')
      }
      if(res.status == 500){
          return toast.error('An internal server error occurred! Please report this to development.')
      }

      toast.success(`Deleted ${rows.length} AMC entries! Refresh the page to see the changes.`)
      return setSelectedRowsArchived([]);
    }catch(err) { 
      toast.error('An unexpected error occurred! Please report to development.')
    } 
  }

  useEffect(() => {
    const fun = async () => {
      try {
        const rowCount = await axios.post('/api/admin/amc/count', {
          filterModel: filters,
        });
        setFilteredRowCount(rowCount.data.count);
      } catch (err) {
        toast.error('Something went wrong! Please contact development team.');
      }
    };

    fun();
  }, [filters]);

  const router = useRouter();

  const addAMCEntry = () => {
    router.push('/users/sla/entry?from=admin_dash');
  }

  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  return (
    <>
      <Breadcrumb pageName="AMC Report"></Breadcrumb>
      <span>Total AMC Cases: { filteredRowCount } </span>
      <div className="mt-5 mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <label className={`block text-sm font-medium leading-6 text-gray-900 mb-2 hidden lg:block`}>
              See Archived?      
            </label>
            <label
                    className="cursor-pointer select-none items-center"
                  >
                    <div className="relative">
                      <input
                        type='checkbox'
                        className="sr-only"
                        onChange={(e) => {
                          setDeleteDisabled(true)
                          setArchiveDisabled(true)
                          setUnarchiveDisabled(true)
                          setSelectedRowsArchived([])
                          setSelectedRowsUnarchived([])
                          setSeeArchived(!seeArchived)
                        }}
                      />
                      <div className="block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]"></div>
                      <div
                        className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
                          seeArchived && "!right-1 !translate-x-full !bg-primary dark:!bg-white"
                        }`}>
                        <span className={`hidden ${seeArchived && "!block"}`}>
                          <svg
                            className="fill-white dark:fill-black"
                            width="11"
                            height="8"
                            viewBox="0 0 11 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                              fill=""
                              stroke=""
                              strokeWidth="0.4"
                            ></path>
                          </svg>
                        </span>
                        <span className={`${seeArchived && "hidden"}`}>
                          <svg
                            className="h-4 w-4 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </label>
            </div>

            <nav>
                <div className="flex items-center gap-2">
                  <Button danger={false} onClick={addAMCEntry} > Add Entry </Button>

                  <Button danger={true} onClick={deleteSelected} disabled={deleteDisabled}> Delete </Button>
                  
                  {seeArchived && 
                    <Button danger={true} onClick={unarchiveSelected} disabled={unarchiveDisabled}> Unarchive </Button>
                  }
                  {!seeArchived &&
                    <Button danger={true} onClick={archiveSelected} disabled={archiveDisabled}> Archive </Button>
                  }
                </div>
            </nav>
      </div>
      {!seeArchived &&
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
            datasource={dataSourceUnarchived}
            ref={gridRef}
            onFilterChanged={onFilterChanged}
            onSelectionChanged={onSelectionChangeUnarchived}
            getRowId={(params: GetRowIdParams) => String(params.data.slaId)}
            suppressRowClickSelection={true}
            onGridReady={(params) => {
              setGridApi(params.api);
            }}
          />
        </div>
      }

      {seeArchived && 
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
            datasource={dataSourceArchived}
            onFilterChanged={onFilterChanged}
            ref={gridRef}
            onSelectionChanged={onSelectionChangeArchived}
            getRowId={(params: GetRowIdParams) => String(params.data.slaId)}
            suppressRowClickSelection={true}
            onGridReady={(params) => {
              setGridApi(params.api);
            }}
          />
        </div>
      }
    
    <Export filterState={filters} parent='amc'/>

    </>
  );
}
