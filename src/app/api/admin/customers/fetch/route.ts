import { getServerSession } from "next-auth";
import prisma from '@/libs/prismadb';
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";

async function getCustomerData(filterModel: any, sortModel: any, startRow: number, endRow: number) {
  
  let newFilter:any = [
    filterModel.personName ? { personName: filterModel.personName } : {},
    filterModel.phoneNo ? { phoneNo: filterModel.phoneNo  } : {},
    filterModel.emailId ? { emailId: filterModel.emailId } : {},
    filterModel.companyName ? { company: { companyName: filterModel.companyName } } : {},
  ];

  for (let x of Object.entries(filterModel) ){
      if(!['personName', 'phoneNo', 'emailId', 'companyName', 'employee'].includes(x[0])){
          let temp = {};
          temp['company'] = {};
          temp['company'][x[0]] = x[1]; 
          console.log(temp)
          newFilter.push(temp)
      }
  }

  if(filterModel['employee']){
    const id = (await prisma.staffs.findFirst({
      where: filterModel.employee
    })).id;
    newFilter.push({
      staffs: {
        some: {
          staffId: id
        }
      }
    });
  }
  
  const totalContacts = await prisma.person.count({
      where: {
        AND: newFilter,
      },
  });

  const totalCount = await prisma.customer.count();

    let newSort = {};
    
    if(sortModel['Customer']){
      newSort['company'] = {
        companyName: sortModel['Customer'].companyName
      }
    }else if(sortModel['person']){ 
      newSort['personName'] = sortModel['person'].personName
    }else if(['staffs', 'phoneNo', 'emailId'].includes(Object.keys(sortModel)[0])){
      
    }else{
      newSort['company'] = sortModel
    }

    const persons = await prisma.person.findMany({
      where: {
        AND: newFilter,
      },
      orderBy: newSort,
      skip: startRow,
      take: endRow - startRow,
      include: {
        company: true,
        staffs: {
          include: {
            staff: true,
          },
        },
      },
    });
  
    const result = persons.map(person => ({
      companyId: person.companyId,
      companyName: person.company?.companyName,
      personId: person.personId,
      personName: person.personName,
      emailId: person.emailId,
      phoneNo: person.phoneNo,
      staffs: person.staffs.map(ps => ps.staff.name),
      numberOfBranch: person.company?.numberOfBranch, 
      totalITUsers: person.company?.totalITUsers, 
      firewallModelNo: person.company?.firewallModelNo, 
      firewallAMCDueDate: person.company?.firewallAMCDueDate,
      antiVirusOem: person.company?.antiVirusOem ,
      renewalDueDate: person.company?.renewalDueDate,
      L3SwitchModel: person.company?.L3SwitchModel  ,
      L3AMCDueDate: person.company?.L3AMCDueDate,
      L2SwitchModel: person.company?.L2SwitchModel,
      L2AMCDueDate: person.company?.L2AMCDueDate,
      wifiModel: person.company?.wifiModel ,
      wifiAMCDueDate: person.company?.wifiAMCDueDate,
      VCOEM: person.company?.VCOEM ,
      VCAMCDueDate: person.company?.VCAMCDueDate,
      epbxModel: person.company?.epbxModel,
      epbxAMCDute: person.company?.epbxAMCDute,
      location: person.company?.location,
      state: person.company?.state 
    }));
  
    return { data: result, count: totalCount, contact: totalContacts };
}

export async function POST(
    request: Request
){
    try { 
        const session = await getServerSession(authOptions);

        if(!session) { 
            return new NextResponse('User not authenticated.', { status: 401 })
        }

        if(!session.user.admin) { 
            return new NextResponse('User is not admin.', { status: 401 })
        }

        const body = await request.json()

        let { startRow, endRow, filterModel, sortModel } =  body;

        const data = await getCustomerData(filterModel, sortModel, startRow, endRow);
        
        return NextResponse.json(data);
    }catch(err) {
        console.log(err) 
        return new NextResponse('Internal Error', { status: 500 })
    }
}
