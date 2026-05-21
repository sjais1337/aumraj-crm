import Button from "../FormElements/Button";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import axios from "axios";
import * as XLSX from 'xlsx';
import { exportSheetName, formatExportData } from '@/libs/exportFormat';

interface ExportProps {
    filterState: Record<string, unknown>;
    parent: string;
}

function cloneFilterState(filterState: Record<string, unknown>) {
    return JSON.parse(JSON.stringify(filterState ?? {})) as Record<string, unknown>;
}

function buildWorksheet(rows: Record<string, string | number>[]) {
    const worksheet = XLSX.utils.json_to_sheet(rows);

    if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        worksheet['!cols'] = headers.map((header) => ({
            wch: Math.min(Math.max(header.length + 4, 14), 48),
        }));
    }

    return worksheet;
}

const Export: React.FC<ExportProps> = ({ filterState, parent }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const filter = cloneFilterState(filterState);

            const res = await axios.post('/api/admin/' + parent + '/export', {
                filterModel: filter,
            });

            const dataFinal = formatExportData(parent, res.data);
            const worksheet = buildWorksheet(dataFinal);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, exportSheetName(parent));

            XLSX.writeFile(workbook, parent.toUpperCase() + '.xlsx');

            toast.success('Successfully exported the requested data.');
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const message =
                    typeof err.response?.data === 'string'
                        ? err.response.data
                        : null;
                if (status === 401) {
                    toast.error(message ?? 'User not authenticated.');
                } else if (status === 500) {
                    toast.error('An internal server error occurred! Please report this to development.');
                } else {
                    toast.error(message ?? 'Export failed. Please try again.');
                }
            } else {
                toast.error('Export failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="mt-5 mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-title-md3 font-semibold text-black dark:text-white">
                Export Data
            </h2>

            <nav>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExport}> Export </Button>
                </div>
            </nav>
        </div>
    );
};

export default Export;
