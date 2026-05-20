import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Chart component with no SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });



interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
}

interface ChartPerformance {
  dataUser: number[],
  dataTeam: number[],
  labels: string[]
}

const ChartOne: React.FC<ChartPerformance> = ({
  dataUser,
  dataTeam,
  labels
}) => {
  const [state, setState] = useState<ChartOneState>({
    series: [
      {
        name: 'Team',
        data: dataTeam,
      },

      {
        name: 'User',
        data: dataUser,
      },
    ],
  });

  const options: ApexOptions = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
  
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'straight',
    },
    // labels: {
    //   show: false,
    //   position: "top",
    // },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: ['#3056D3', '#80CAEE'],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: 'category',
      categories: labels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
      max: 300
    },
  };


  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      series: [
        {
          name: 'Team',
          data: dataTeam,
        },
  
        {
          name: 'Your',
          data: dataUser,
        },
      ],
    }));
  }, [dataTeam]);

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
          type="area"
          height={350}
          width={'100%'}
        />
  );
};

export default ChartOne;