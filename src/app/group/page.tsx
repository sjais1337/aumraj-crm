'use client'


import { useData } from "@/context/DataContext";

const ScoreReport = () => {
    const data = useData();

    return (
        <div>
            Welcome to your {data.groupData.name} Dashboard, {data.groupData.head}.
        </div>
    )
}

export default ScoreReport;
