import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import * as fs from 'fs';
import bcrypt from 'bcrypt';

async function main (){
    await prisma.personStaff.deleteMany({});
    await prisma.person.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.staffs.deleteMany({});
    await prisma.activity.deleteMany({})
    await prisma.support.deleteMany({})
    await prisma.sla.deleteMany({})
    await prisma.funnel.deleteMany({})
    await prisma.salarySlip.deleteMany({})
    await prisma.permissions.deleteMany({});


    const customers = JSON.parse(fs.readFileSync('./nodeData/customer.json', 'utf-8'));
    const contacts = JSON.parse(fs.readFileSync('./nodeData/person.json', 'utf-8'));
    const staffs = JSON.parse(fs.readFileSync('./nodeData/staffs.json', 'utf-8'));
    const sla = JSON.parse(fs.readFileSync('./nodeData/sla.json', 'utf-8'));
    const support = JSON.parse(fs.readFileSync('./nodeData/support.json', 'utf-8'));
    const funnel = JSON.parse(fs.readFileSync('./nodeData/funnel.json', 'utf-8'));
    const activity = JSON.parse(fs.readFileSync('./nodeData/activity.json', 'utf-8'));
    const salary = JSON.parse(fs.readFileSync('./nodeData/salarySlip.json', 'utf-8'));
    const relations = JSON.parse(fs.readFileSync('./nodeData/person_relationships.json', 'utf-8'));

    await Promise.all(staffs.map((record : any)  => prisma.staffs.create({ data: record })));
    await prisma.customer.createMany({data: customers})
    await prisma.person.createMany({data: contacts})
    await prisma.sla.createMany({ data: sla })
    await prisma.salarySlip.createMany({ data: salary})
    await prisma.activity.createMany({ data: activity})
    await prisma.support.createMany({ data: support})
    await prisma.funnel.createMany({ data: funnel})
    await prisma.personStaff.createMany({data: relations})
    await prisma.settings.create({
        data: {
            oem:  ['Commscope', 'Cisco', 'Juniper', 'Fortinet', 'Ruckus', 'NComputing', 'Extreme', 'Sophos', 'HP', 'Dell', 'Lenevo', 'Sapphire', 'Avaya', 'Polycom', 'Hikvision', 'D-Link', '3C3', 'McAfee', 'Microsoft', 'TrendMicro', 'Others'],
            slaSupportType: ['B2B', 'B2B + ATPL', 'ATPL'],
            supportType: ['Support', 'Delivery', 'Payment'],
            slaType: ['8x5xNBD', '24x7'],
            opportunity: ['Cabling', 'Switching/Routing', 'Security', 'Wi-Fi', 'Video Conferencing', 'Advanced Tech', 'Systems', 'Non-Networking', 'Project', 'CCTV', 'Software', 'Others'],
            funnelType: ['Supply/Support', 'AMC/Software'],
            funnelStatus: ['Cold', 'Mild', 'Hot'],
            supportStatus: ['Planning', 'Progress', 'Issues', 'Closed'],
            target: 110000000
        }
    });
    await prisma.billingData.create({
        data: {
            amount: 41500000
        }
    })
}


main().catch(e => console.log(e))
.then(async () => {
    await prisma.$disconnect
})



