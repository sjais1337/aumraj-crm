import React, { forwardRef } from 'react';

interface SalarySlip {
    data: any;
    ref: any;
}

const SalarySlip: React.FC<SalarySlip> = forwardRef(({ data }, ref) => {

  if(Object.keys(data).length == 0){
    //@ts-ignore
    return (<div ref={ref} className='p-3'>No data found.</div>)
  }
  return (
    //@ts-ignore
    <div ref={ref} className="max-w-2xl mx-auto p-8 bg-white text-black">
       <div className="text-center mb-4">
            <img src="/images/logo/logo.svg" alt="Company Logo" className="mx-auto mb-4 h-16" />
            <h1 className="text-xl font-bold">Aumraj Technologies Pvt. Ltd.</h1>
            <p>GT-221, Ghitorni, MG Road, Near Charan Singh Farm House, New Delhi - 110030</p>
            <p>GSTIN: 07AANCA5150D1ZW, PAN No: AANCA5150D, E-mail: sales@aumraj.in</p>
        </div>

      <div className="text-center mb-6">
        <h2 className="text-lg font-bold">Monthly Salary Slip</h2>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p>Employee Name: <strong>{data.staffsId}</strong></p>
          <p>Department: <strong>{data.department}</strong></p>
          <p>Designation: <strong>{data.post}</strong></p>
          <div className="flex">
            <div className="mr-4">
              <p>Compoff Added: <strong>{data.compoffAdded}</strong></p>
              <p>Balance Leaves: <strong>{data.leavesAvailable}</strong></p>
              <p>Carry Forward Leaves: <strong>{data.carryLeaves}</strong></p>
            </div>
            <div>
              <p>Compoff Taken: <strong>{data.compoffTaken}</strong></p>
              <p>Leave Taken: <strong>{data.leavesTaken}</strong></p>
            </div>
          </div>
        </div>
        <div>
          <p>Payslip for Month: <strong>{new Date(data.month).toLocaleString('default', { month: 'short' }) + ' ' + new Date(data.month).getFullYear()}</strong></p>
          <p>PAN No: <strong>{data.pan}</strong></p>
          <p>Paid Days: <strong>{data.paidDays}</strong></p>
          <p>Balance Compoff: <strong>{data.compoffBalance}</strong></p>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div className="w-1/2 pr-4">
          <table className="w-full border-collapse">
<thead>
              <tr>
                <th className="border-b py-2 text-left">Earning</th>
                <th className="border-b py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b py-2">Basic Salary</td>
                <td className="border-b py-2 text-right">{data.base}</td>
              </tr>
              <tr>
                <td className="border-b py-2">HRA</td>
                <td className="border-b py-2 text-right">{data.hra}</td>
              </tr>
              <tr>
                <td className="font-bold py-2">Gross Total</td>
                <td className="font-bold py-2 text-right">{data.gross.toFixed(2)}</td>
              </tr>
            </tbody>
	  </table>
        </div>
        <div className="w-1/2 pl-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b py-2 text-left">Deduction</th>
                <th className="border-b py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b py-2">Tax on salary</td>
                <td className="border-b py-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border-b py-2">EC & TDS</td>
                <td className="border-b py-2 text-right">{data.tds + data.ec}</td>
              </tr>
              <tr>
                <td className="border-b py-2">Loan</td>
                <td className="border-b py-2 text-right">{data.loan}</td>
              </tr>
              <tr>
                <td className="border-b py-2">Others</td>
                <td className="border-b py-2 text-right">{data.others}</td>
              </tr>
              <tr>
                <td className="font-bold py-2">Total Deduction</td>
                <td className="font-bold py-2 text-right">{data.deduction}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center font-bold text-xl mb-0">
        Net Salary Payable: {data.netSalary}
      </div>

<div className="flex justify-between items-end">
  <div className="flex-1 text-center mr-4">
    <div className="border-b-2 border-black mb-4"></div>
    <p className="mt-1">Signature of Employee</p>
  </div>
  <div className="flex-1 text-center ml-4">
    <img src="/images/logo/stamp.png" alt="Director Stamp" className="block mx-auto h-24 w-24 mb-2" />
    <div className="border-b-2 border-black mb-4"></div>
    <p className="mt-1">Director</p>
  </div>
</div>


    </div>
  );
});

SalarySlip.displayName = 'SalarySlip';

export default SalarySlip;
