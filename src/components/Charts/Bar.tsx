import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";

// components/Chart.js
import dynamic from 'next/dynamic';

// Dynamically import the Chart component with no SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartTwoState {
  series: {
    name: string;
    data: number[];
  }[];
}

interface ChartTwo {
  data: number[],
  colors: string[],
  labels: string[],
  title: string,
  home?: boolean
}

const Bar: React.FC<ChartTwo> = ({ data, colors, labels, title, home }) => {

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
  
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: "25%",
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        distributed: true,
        horizontal: false,
        borderRadius: 0,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
  
    xaxis: {
      categories: labels,
    },
    legend: {
      show: home == true ? false : true,
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

  
  const [state, setState] = useState<ChartTwoState>({
    series: [
      {
        name: home == true ? "Score ":"Sales" ,
        data: data,
      }
    ],
  });

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      series: [
        {
          name: home == true ? "Score ":"Sales" ,
          data: data,
        }
      ],
    }));
  }, [data]);

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
    }));
  };
  handleReset;

  return (
    <div className={home == true ? "col-span-1 md:col-span-4 p-7.5 flex flex-col border border-stroke bg-white  shadow-default dark:border-strokedark dark:bg-boxdark" : "w-full md:w-1/3 px-4 mb-4"}>
      <div className={home == true ? "" : "col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark"}>
        <div className={home == true ? "mb-6 justify-between gap-4 sm:flex" : "mb-4 justify-between gap-4 sm:flex"}>
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              {title}
            </h4>
          </div>
          <div>
            {
              !home && <div className="relative z-20 inline-block">
              <div
                id="#"
                className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
              >
                Last Week
              </div>
            </div>
            }
            
          </div>
        </div>  
        <div>
          <div id="chartTwo" className={home == true ? "-mb-9 -ml-5 px-2.5" : "-mb-9 -ml-5"}>
            <Chart
              options={options}
              series={state.series}
              type="bar"
              height={home == true ? 350 : 250}
              width={"100%"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bar;
