import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function getCustomerData() {
    const financialYear = () => {
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

    const topPOs: any = (await prisma.funnel.findMany({
        select: {
            Customer: true,
            topLine: true,
            employee: true
        },
        orderBy: [
            {
                topLine: 'desc'
            }
        ],
        where: {
            status: 'Won',
            closureDate: {
                lte: financialYear().end,
                gte: financialYear().start
            }
        },
        take: 5
    })).map(i => {
        return {
            companyName: i.Customer.companyName,
            topLine: i.topLine,
            staffName: i.employee.name
        }
    });

    console.log(topPOs)
}

getCustomerData();
