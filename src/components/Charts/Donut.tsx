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
        // enabled: false,
      }
    },
    plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10
        }
    },
    dataLabels: {
      enabled: false,
    },
    labels: labels,
    legend: {
        show: false
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
        enabled: false
    }
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
    <Chart
        options={options}
        series={state.series}
        type="donut"
        height={300}
        width={"100%"}
    />
  );
};

export default Pie;
