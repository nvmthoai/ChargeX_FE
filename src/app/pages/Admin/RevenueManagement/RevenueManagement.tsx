import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

export const financeData = [
    { name: "January", income: 12500000, outcome: 8300000 },
    { name: "February", income: 15700000, outcome: 9500000 },
    { name: "March", income: 9800000, outcome: 7200000 },
    { name: "April", income: 18400000, outcome: 12100000 },
    { name: "May", income: 16500000, outcome: 8700000 },
    { name: "June", income: 21000000, outcome: 13200000 },
    { name: "July", income: 17500000, outcome: 14500000 },
    { name: "August", income: 19500000, outcome: 9500000 },
    { name: "September", income: 16000000, outcome: 11800000 },
    { name: "October", income: 23000000, outcome: 15500000 },
    { name: "November", income: 24500000, outcome: 13800000 },
    { name: "December", income: 27000000, outcome: 19000000 },
];

export const stats = [
    {
        title: "Today",
        value: 1200000,
        change: "+12% from yesterday",
        icon: "dollar",
        color: "#60A5FA",
    },
    {
        title: "This week",
        value: 8500000,
        change: "+8% from the previous week",
        icon: "calendar-week",
        color: "#34D399",
    },
    {
        title: "This month",
        value: 35000000,
        change: "+15% from the previous month",
        icon: "calendar-days",
        color: "#A78BFA",
    },
    {
        title: "This year",
        value: 194444000,
        change: "~0% from the previous year",
        icon: "chart-line",
        color: "#FBBF24",
    },
];

export default function RevenueManagement() {

    const [dateRange, setDateRange] = useState({
        from: "",
        to: "",
    });

    const formatDateDisplay = (isoDate: string) => {
        if (!isoDate) return "";
        const [year, month, day] = isoDate.split("-");
        return `${day}/${month}/${year}`;
    };

    const formatDateInput = (displayDate: string) => {
        if (!displayDate) return "";
        const [day, month, year] = displayDate.split("/");
        return `${year}-${month}-${day}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const formatted = formatDateDisplay(value);
        setDateRange((prev) => ({
            ...prev,
            [name]: formatted,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Khoảng thời gian đã chọn:", dateRange);
    };

    const formatCurrencyShort = (value: number): string => {
        if (value >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(1)}T ₫`; // T = Tỷ
        } else if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(1)}M ₫`; // M = Triệu
        } else if (value >= 1_000) {
            return `${(value / 1_000).toFixed(1)}K ₫`; // K = Nghìn
        }
        return `${value} ₫`;
    };

    return (
        <div className='admin-container'>
            <div className='inner-container management-container revenue-management-container'>

                <header className='main-header'>
                    <h1>Revenue Management</h1>

                    <div className="actions">
                        <form className="date-range-form" onSubmit={handleSubmit}>
                            <div className="field">
                                <label>From:</label>
                                <input
                                    type="date"
                                    name="from"
                                    value={formatDateInput(dateRange.from)}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="field">
                                <label>To:</label>
                                <input
                                    type="date"
                                    name="to"
                                    value={formatDateInput(dateRange.to)}
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="submit">SEARCH</button>
                        </form>
                    </div>
                </header>

                <div className="revenue-stats-grid">
                    {stats.map((item, index) => (
                        <div key={index} className="stat-card">
                            <div className="info">
                                <p className="title">{item.title}</p>
                                <h3>{item.value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h3>
                                {/* <span className="change">{item.change}</span> */}
                            </div>
                            <div className="icon" style={{ backgroundColor: item.color + '40' }}>
                                <i className={`fa-solid fa-${item.icon}`} style={{ color: item.color }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className='revenue-chart'>
                    <div className='title'>Revenue chart</div>

                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart
                            data={financeData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='name' />
                            <YAxis
                                tickFormatter={(value) => formatCurrencyShort(value)}
                                tick={{ fontSize: 12 }}
                                width={80}
                            />
                            <Tooltip formatter={(value: number) => formatCurrencyShort(value)} />
                            <Legend />
                            <Bar dataKey='income' fill='#4CAF50bf' name='Income' />
                            <Bar dataKey='outcome' fill='#F44336bf' name='Outcome' />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
