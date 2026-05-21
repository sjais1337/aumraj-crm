import {
    FilterModel,
} from 'ag-grid-community'

export const lists = {
    oem:  ['Commscope', 'Cisco', 'Juniper', 'Fortinet', 'Ruckus', 'NComputing', 'Extreme', 'Sophos', 'HP', 'Dell', 'Lenevo', 'Sapphire', 'Avaya', 'Polycom', 'Hikvision', 'D-Link', '3C3', 'McAfee', 'Microsoft', 'TrendMicro', 'Others'],
    slaSupportType: ['B2B', 'B2B + ATPL', 'ATPL'],
    supportType: ['Support', 'Delivery', 'Payment'],
    slaType: ['8x5xNBD', '24x7'],
    opportunity: ['Cabling', 'Switching/Routing', 'Security', 'Wi-Fi', 'Video Conferencing', 'Advanced Tech', 'Systems', 'Non-Networking', 'Project', 'CCTV', 'Software', 'Others'],
    funnelType: ['Supply/Support', 'AMC/Software'],
    funnelStatus: ['Cold', 'Mild', 'Hot'],
    supportStatus: ['Planning', 'Progress', 'Issues', 'Closed'],
    colors: ['#eb4034', "#34eb62", "#3474eb"],
    months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    years: [
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
        "31",
        "32",
        "33",
        "34",
        "35"
    ]
}

export function camelCaseToReadable(str) {
    // Add a space before each uppercase letter, then capitalize the first letter
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')  // Insert space before each capital letter
        .replace(/([A-Z])/g, ' $1')           // Add a space at the beginning if the first letter is capital
        .trim()                               // Remove leading spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
}

export function formatCurrency(num) {
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
    if (num >= 1e3) return `₹${(num / 1e3).toFixed(2)}K`;
    return `₹${num}`;
}

export const phoneRegex = /^\+?[0-9()-]{8,}$/;

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function formatDate(date) {
    const d = new Date(date)
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear()

    if (month.length < 2) {
        month = '0' + month;
    }
    
    if (day.length < 2) {
        day = '0' + day;
    }

    const final = [day, month, year].join('-');

    return ( final == 'NaN-NaN-NaN' || final == '01-01-1970' ) ? '' : final;
}

export function endOfMonthISO(date: Date = new Date()): string {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return d.toISOString().split('T')[0];
}

/** Last ~13 months for funnel monthly hit-% charts (1st of month 12 months ago → end of current month). */
export function funnelSummaryMonthlyRange(date: Date = new Date()): {
    dateStart: string;
    dateEnd: string;
} {
    const dateEnd = endOfMonthISO(date);
    const start = new Date(date.getFullYear(), date.getMonth() - 12, 1);
    const dateStart = start.toISOString().split('T')[0];
    return { dateStart, dateEnd };
}

export const financialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    let startYear, endYear;

    if (month >= 3) {
        startYear = year;
        endYear = year + 1;
    } else {
        startYear = year - 1;
        endYear = year;
    }

    const startOfFinancialYear = new Date(startYear, 3, 1);  // April 1st
    const endOfFinancialYear = new Date(endYear, 2, 31);    // March 31st

    return {
        start: startOfFinancialYear,
        end: endOfFinancialYear
    };
}

export const prismaSort = (sortModel: any) => {
    var sort = {};
    if(sortModel.length >= 1){
      if(sortModel[0].colId == 'companyName'){
        sort['Customer'] = {
            companyName: sortModel[0].sort
        }
      }else if(sortModel[0].colId == 'personName' || sortModel[0].colId == 'emailId' || sortModel[0].colId == 'phoneNo'){
        sort['person'] = {}
        sort['person'][sortModel[0].colId] = sortModel[0].sort
      }else{
          sort[sortModel[0].colId] = sortModel[0].sort
      }
      return sort;
    }else{
      return {}
    }
}

export const defaultColDef = {
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    flex: 1,
    minWidth: 110
}

export const prismaFilter = (filterModel: FilterModel) => {
    var filters = {};
    Object.entries(filterModel).forEach(i => {
        let temp: any = { }

        if(i[0] == 'staffsId') {
            filters['employee']  = {
                name: {
                    contains: i[1].filter
                }
            }
        }else if(i[0] == 'companyName'){
            filters['Customer'] = {
                companyName: {
                    contains: i[1].filter
                }
            }
        }else if(i[0] == 'personName' || i[0] == 'emailId' || i[0] == 'phoneNo') {
            if(filters['person']){
                filters['person'] = filters['person']
            }else{
                filters['person'] = {}
            }
            filters['person'][i[0]] = {
                contains: i[1].filter
            }
        }else{
	    if(i[1].filterType == 'date') {
                if(i[1].dateFrom) {
                    temp.gte = new Date((new Date(i[1].dateFrom)).setHours(0, 0, 0, 0))
                }
                if(i[1].dateTo) {
                    temp.lte = new Date((new Date(i[1].dateTo)).setHours(23, 59, 59, 0))
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

  const nameMap = {};

// employees.forEach(employee => {
//   const { name, department, post } = employee;

//   if (!nameMap[name]) {
//     // If name is not in map, add it
//     nameMap[name] = [{ department, post }];
//   } else {
//     // If name is in the map, check for duplicates
//     const existing = nameMap[name].find(item => item.department === department);
    
//     if (existing) {
//       // If name and department are the same, append post
//       employee.name = `${name} (${post}, ${department})`;
//     } else {
//       // If only name is the same, append department
//       employee.name = `${name} (${department})`;
//     }
    
//     // Add the department and post to the map for future reference
//     nameMap[name].push({ department, post });
//   }
// });
