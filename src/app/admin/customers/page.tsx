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
  GetRowIdParams,
  ColDef,
  SelectionChangedEvent
} from 'ag-grid-community'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { 
  prismaSort, 
  defaultColDef, 
  formatDate
} from '@/libs/consts';
import toast from 'react-hot-toast';
import Button from '@/components/FormElements/Button';
import Export from '@/components/Breadcrumbs/Export';
import CustomerMergeDialog from '@/components/Customers/MergeDialog';
import {
  FilterModel,
} from 'ag-grid-community'


const prismaFilter = (filterModel: FilterModel) => {
  var filters = {};
  Object.entries(filterModel).forEach(i => {
      let temp: any = { }

      if(i[0] == 'staffs') {
          filters['employee']  = {
              name: {
                  contains: i[1].filter
              }
          }
      }else{
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
      }
  })

  return filters;
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

    const res = await axios.post('/api/admin/customers/fetch', postData);
    if(res.status == 401){
        return toast.error('User not authenticated.')
    }
    if(res.status == 500){
        return toast.error('An internal server error occurred! Please report this to development.')
    }
    const { data, contact } = res.data;

    params.successCallback(data, contact);
  }
}

export default function ActivityReport(){
    const gridRef = useRef<AgGridReact>(null);

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'companyId',
            hide: true,
        },
        {
            field: 'personId',
            hide: true
        },
        {
            checkboxSelection: true,
            field: 'companyName', 
            minWidth: 200,
            headerName: 'Company',
            editable: true,
            onCellValueChanged: function(params){ updateFunnel(params) },
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'personName',
            minWidth: 150,
            headerName: 'Contact Name',
            editable: true,
            onCellValueChanged: function(params){ updateFunnel(params) },
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'phoneNo', 
            minWidth: 100,
            headerName: 'Phone No.',
            editable: true,
            onCellValueChanged: function(params){ updateFunnel(params) },
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'emailId', 
            minWidth: 180,
            headerName: 'Email',
            editable: true,
            onCellValueChanged: function(params){ updateFunnel(params) },
            filterParams: { 
                filterOptions: ['contains']
            } 
        },
        {
            field: 'staffs',
            minWidth: 200
        },
        {
          field:'numberOfBranch', 
          cellDataType: 'number',
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filter:'agNumberColumnFilter',
          filterParams: { 
            filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
          } 
        },
        {
          field:'totalITUsers', 
          headerName: 'Total IT Users',
          cellDataType: 'number',
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filter:'agNumberColumnFilter',
          filterParams: { 
            filterOptions: ['lessThanOrEqual','inRange','greaterThanOrEqual']
          } 
        },
        {
          field: 'firewallModelNo',
          headerName: 'Firewall Model No',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'firewallAMCDueDate',
          headerName: 'Firewall AMC Date', 
          filter:'agDateColumnFilter',
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
          field: 'antiVirusOem',
          headerName: 'Anti Virus OEM',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'renewalDueDate', 
          headerName: 'Renewal Due Date',
          filter:'agDateColumnFilter',
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
          field: 'L3SwitchModel',
          headerName: 'L3 Switch Model',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'L3AMCDueDate', 
          headerName: 'L3 AMC Date',
          filter:'agDateColumnFilter',
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
          field: 'L2SwitchModel',
          headerName: 'L2 Switch Model',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'L2AMCDueDate', 
          headerName: 'L2 AMC Date',
          filter:'agDateColumnFilter',
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
          field: 'wifiModel',
          headerName: 'Wi-Fi Model',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'wifiAMCDueDate', 
          headerName: 'Wi-Fi AMC Date',
          filter:'agDateColumnFilter',
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
          field: 'VCOEM',
          headerName: 'VC OEM',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'VCAMCDueDate', 
          headerName: 'VC AMC Date',
          filter:'agDateColumnFilter',
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
          field: 'epbxModel',
          headerName: 'EPBX Model',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'epbxAMCDute', 
          headerName: 'EPBX Date',
          filter:'agDateColumnFilter',
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
          field: 'location',
          headerName: 'Location',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        },
        {
          field: 'state',
          headerName: 'State',
          minWidth: 120,
          editable: true,
          onCellValueChanged: function(params){ updateFunnel(params) },
          filterParams: {
            filterOptions: ['contains']
          }
        }
  ]);

  const [filters, setFilters] = useState({});


  const updateFilters = () => {
    if (!gridRef.current?.api) return;
    setFilters(prismaFilter(gridRef.current.api.getFilterModel()));
  }

  const  [totalCompanies, setTotalCompanies] = useState(0);
  const  [totalContacts, setTotalContacts] = useState(0);

 

  // setTotalCompanies(count);
  // setTotalContacts(contact);

  const updateFunnel = async (params: any) => {
    const field = params.column.colId;
    const nameL = params.column.colDef.headerName;
    console.log(nameL);
    let value = params.newValue;
    let id = '';
    let company = false;
    const dataType = params.colDef.cellDataType ? params.colDef.cellDataType : 'text' ;

    console.log(dataType)

    if(field == 'personName' || field == 'phoneNo' || field == 'emailId'){
        id = params.data.personId;
    }else{
      company = true
      id = params.data.companyId;
    }

    if(dataType == 'number'){
      value = parseInt(value)
    }

    if(dataType.toLowerCase().includes('date')){
      value = new Date(value)
    }
    
    const response = await axios.post('/api/admin/customers/update', {
      id: id,
      company: company, 
      field: field,
      value: value
    })

    if(response.status == 200){
      return toast.success('Successfully updated ' + nameL + '!');
    }
  }



  const colorTheme = localStorage.getItem('color-theme');
  const classAddition = colorTheme == '"dark"' ? '-dark' : '';

  type SelectedRow = {
    personId: string;
    companyId: string | null;
    personName: string;
    companyName: string | undefined;
  };

  const [ selectedRows, setSelectedRows ] = useState<SelectedRow[]>([]);
  const [ mergeDisabled, setMergeDisabled ] = useState(true);
  const [ mergeType, setMergeType ] = useState<'contacts' | 'companies' | null>(null);
  const [ survivorId, setSurvivorId ] = useState('');
  const [ mergeSubmitting, setMergeSubmitting ] = useState(false);

  const refreshGrid = () => {
    gridRef.current?.api.refreshInfiniteCache();
    gridRef.current?.api.deselectAll();
    setSelectedRows([]);
    setMergeDisabled(true);
    updateFilters();
  };
  
  const onSelectionChange = useCallback(
    (event: SelectionChangedEvent) => {
        const nodes = event.api.getSelectedNodes();
        const rows = nodes.map((node) => ({
          personId: node.data.personId,
          companyId: node.data.companyId,
          personName: node.data.personName,
          companyName: node.data.companyName,
        }));
        setSelectedRows(rows);
        setMergeDisabled(rows.length < 2);
    }, [],
  )

  const openMergeDialog = (type: 'contacts' | 'companies') => {
    if (selectedRows.length < 2) {
      toast.error('Select at least two rows to merge.');
      return;
    }
    setSurvivorId(selectedRows[0].personId);
    setMergeType(type);
  };

  const executeMerge = async () => {
    if (!mergeType || !survivorId) return;

    const survivor = selectedRows.find((row) => row.personId === survivorId);
    if (!survivor) return;

    const payload = [
      survivor,
      ...selectedRows.filter((row) => row.personId !== survivorId),
    ];

    setMergeSubmitting(true);
    try {
      const url =
        mergeType === 'contacts'
          ? '/api/admin/customers/merge/contacts'
          : '/api/admin/customers/merge/companies';

      const response = await axios.post(url, payload);

      if (response.status === 200) {
        const label =
          mergeType === 'contacts' ? 'contacts' : 'companies';
        toast.success(`Successfully merged ${selectedRows.length} ${label} into one record.`);
        setMergeType(null);
        refreshGrid();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          typeof err.response?.data === 'string'
            ? err.response.data
            : 'Merge failed. Please try again.';
        toast.error(message);
      } else {
        toast.error('Merge failed. Please try again.');
      }
    } finally {
      setMergeSubmitting(false);
    }
  };
  
  useEffect(() => {
    const fun  = async () => {
      try{
        const { count, contact } = (await axios.post('/api/admin/customers/count', {
          filterModel: filters
        })).data;

        setTotalCompanies(count);
        setTotalContacts(contact);
    
      }catch(err){
        return toast.error('Something went wrong! Please contact development team.')
      }
    }

    fun();
  }, [filters])

  return (
    <>
      <Breadcrumb pageName="Customer Database"></Breadcrumb>
      <div className="mt-5 mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className='text-title-md1 font-semibold text-black dark:text-white'>Companies: {totalCompanies}, Contacts: {totalContacts}</h2>
              <p className="mt-1 text-sm text-body dark:text-bodydark">
                Each row is a contact. Select two or more rows to merge duplicates.
              </p>
              {selectedRows.length === 1 ? (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  Select at least one more row to merge.
                </p>
              ) : null}
            </div>

            <nav>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <Button
                      danger={true}
                      onClick={() => openMergeDialog('companies')}
                      disabled={mergeDisabled}
                    >
                      Merge Companies
                    </Button>
                    <Button
                      danger={true}
                      onClick={() => openMergeDialog('contacts')}
                      disabled={mergeDisabled}
                    >
                      Merge Contacts
                    </Button>
                  </div>
                  <p className="text-xs text-body dark:text-bodydark">
                    Companies: combine duplicate orgs · Contacts: combine duplicate people
                  </p>
                </div>
            </nav>
      </div>
      <div className={`table ag-theme-quartz${classAddition}`} style={{ height: '80vh', width:'100%', fontFamily: 'Satoshi, sans-serif'}}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowBuffer={0}
          rowHeight={50}
          rowSelection={'multiple'}
          rowModelType={'infinite'}
          cacheBlockSize={30}
          cacheOverflowSize={2}
          maxConcurrentDatasourceRequests={1}
          infiniteInitialRowCount={10}
          datasource={dataSource}
          onSelectionChanged={onSelectionChange}
          getRowId={(params: GetRowIdParams) => String(params.data.personId)}
          onFilterChanged={updateFilters}
          suppressRowClickSelection={true}
        />
      </div>
      <Export filterState={filters} parent='customers'/>

      {mergeType ? (
        <CustomerMergeDialog
          type={mergeType}
          rows={selectedRows}
          survivorId={survivorId}
          onSurvivorChange={setSurvivorId}
          onConfirm={executeMerge}
          onCancel={() => setMergeType(null)}
          isSubmitting={mergeSubmitting}
        />
      ) : null}
    </>
  );
}
