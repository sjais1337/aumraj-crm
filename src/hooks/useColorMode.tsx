import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

const useColorMode = () => {
  const [colorMode, setColorMode] = useLocalStorage("color-theme", "light");

  useEffect(() => {
    const className = "dark";
    const bodyClass = window.document.body.classList;
    const table = window.document.body.querySelector('.table');
    const logo = window.document.body.querySelector('.main_logo');

    if(table){
      const tableClass = table.classList;
      if(colorMode === 'dark'){
        tableClass.remove('ag-theme-quartz')
        tableClass.add('ag-theme-quartz-dark')
      }else{
        tableClass.add('ag-theme-quartz')
        tableClass.remove('ag-theme-quartz-dark')
      }
    }

    if(colorMode === 'dark'){
      //@ts-ignore
      logo.src = '/images/logo/logo-dark.svg'
      bodyClass.add(className)
    }else{
      //@ts-ignore
      logo.src = '/images/logo/logo.svg'
      bodyClass.remove(className)
    } 
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;
