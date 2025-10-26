import { useState, useEffect } from 'react';
import { fetchData, getQueryString } from '../../../../mocks/CallingAPI';
import './KycManagement.css';

const KycManagement = () => {

    const [KYCs, setKYCs] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                setLoading(true);
                const PageKycsResponse = await fetchData(`/kyc-profiles${getQueryString({ page: page, limit: 10, status: selectedStatus, level: selectedLevel })}`, token);
                console.log('PageKycsResponse', PageKycsResponse);
                setKYCs(PageKycsResponse.data.data);
            } catch (error) {
                console.error(error);
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [page, selectedStatus, selectedLevel]);

    // const getQueryString = (params: Record<string, string | number | undefined>) => {
    //     return params
    //         ? '?' + Object.entries(params)
    //             .filter(([_, value]) => value !== undefined && value !== '')
    //             .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    //             .join('&')
    //         : '';
    // };

    if (loading) return <div className='admin-container'>Loading</div>
    if (error) return <div className='admin-container'>Error</div>
    return (
        <div className='admin-container'>
            <div className='inner-container user-management-container'>

                <header className='main-header'>
                    <h1>User Management</h1>
                </header>

                <div className='controls'>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Find by name or email...' />
                    </div>
                    <form>
                        <select id='options' value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value=''>-- Status --</option>
                            <option value='pending'>Pending</option>
                            <option value='approved'>Approved</option>
                            <option value='rejected'>Rejected</option>
                        </select>
                        <select id='options' value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                            <option value=''>-- Status --</option>
                            <option value='basic'>Basic</option>
                            <option value='advanced'>Advanced</option>
                        </select>
                    </form>
                    <button className='btn btn-secondary'>
                        Filter
                    </button>
                    <button className='btn btn-secondary'>
                        Sort
                    </button>
                </div>

                <section className='customer-table-container'>
                    <table className='customer-table'>
                        <thead>
                            <tr>
                                <th>AVATAR</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th className='actions'>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {KYCs?.map(kyc => (
                                <tr key={kyc.kycProfileId}>
                                    <td>
                                        <div className='avatar'>
                                            <img src={`${kyc.user.image}`} alt='Customer avatar' />
                                        </div>
                                    </td>
                                    <td>
                                        <div className='customer-name-cell'>
                                            <div className='customer-info'>
                                                <span className='name'>{kyc.user.fullName}</span>
                                                <span className='role'>{kyc.user.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{kyc.user.email}</td>
                                    <td>
                                        <div className='action-buttons'>
                                            <button className='action-btn'>
                                                <i className='fa-solid fa-pencil' /> Detail
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <button onClick={() => { if (page > 1) { setPage(p => p - 1) } }}>Previous</button>
                        <span>{page}</span>
                        <button onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </section>
            </div >
        </div >
    );
};

export default KycManagement;