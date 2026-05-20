import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";

// components/Chart.js
import dynamic from 'next/dynamic';

// Dynamically import the Chart component with no SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// interface ChartTwoState {
//   series: {
//     name: string;
//     data: number[];
//   }[];
// }

interface ChartTwo {
  data: number[],
  colors: string[],
  labels: string[],
  title: string
}

const Pie: React.FC<ChartTwo> = ({ data, colors, labels, title }) => {

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
      height: 335,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    dataLabels: {
      enabled: false,
    },
    labels: labels,
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        radius: 99,
      },
    },
    fill: {
      opacity: 1,
    },
  };

  
  const [state, setState] = useState({
    series: data
  });

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      series: data
    }));
  }, [data]);

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
    }));
  };
  handleReset;

  return (
    <div className="w-full md:w-1/3 px-4 mb-4">

      <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 justify-between gap-4 sm:flex">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              {title}
            </h4>
          </div>
          <div>
            <div className="relative z-20 inline-block">
              <div
                id="#"
                className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
              >
                Present FY
              </div>
            </div>
          </div>
        </div>
        <div>
          <div id="chartTwo" className="-mb-9 -ml-5">
            <Chart
              options={options}
              series={state.series}
              type="donut"
              height={250}
              width={"100%"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pie;
