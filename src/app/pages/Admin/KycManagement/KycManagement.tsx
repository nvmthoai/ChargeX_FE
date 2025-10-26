import { useEffect, useState } from 'react';
import { fetchData, getQueryString } from '../../../../mocks/CallingAPI';
import Pagination from '../../../components/Pagination/Pagination';
import './KycManagement.css';

const KycManagement = () => {

    const [KYCs, setKYCs] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                setLoading(true);
                const PageKycsResponse = await fetchData(`/kyc-profiles${getQueryString({ page: page, limit: 10, status: selectedStatus, level: selectedLevel })}`, token);
                console.log('PageKycsResponse', PageKycsResponse);
                setKYCs(PageKycsResponse.data);
            } catch (error) {
                console.error(error);
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh, page, selectedStatus, selectedLevel]);

    if (loading) return <div className='admin-container'>Loading</div>
    if (error) return <div className='admin-container'>Error</div>
    return (
        <div className='admin-container'>
            <div className='inner-container user-management-container'>

                <header className='main-header'>
                    <h1>Kyc Management</h1>
                </header>

                <div className='controls'>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Find by name or email...' />
                    </div>
                    <form>
                        <select id='formsetSelectedStatus' value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            {/* FIX=== */}
                            <option value=''>-- Status --</option>
                            <option value='pending'>Pending</option>
                            <option value='approved'>Approved</option>
                            <option value='rejected'>Rejected</option>
                        </select>
                        <select id='formSelectedLevel' value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                            {/* FIX=== */}
                            <option value=''>-- Level --</option>
                            <option value='basic'>Basic</option>
                            <option value='advanced'>Advanced</option>
                        </select>
                    </form>
                    <button className='btn btn-secondary' onClick={() => setRefresh(p => p + 1)}>
                        Refresh
                    </button>
                    <button className='btn btn-secondary'>
                        Sort
                    </button>
                </div>

                <section className='customer-table-container'>
                    <table className='customer-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>AVATAR</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {KYCs?.data?.map((kyc: any, index: any) => (
                                <tr key={kyc.kycProfileId}>
                                    <td>{index + 1 + (page - 1) * 10}</td>
                                    <td>
                                        <div className='avatar'>
                                            <img src={`${kyc.user.image}`} alt='avatar' />
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
                </section>

                <Pagination
                    currentPage={page}
                    totalPages={KYCs?.totalPages}
                    onPageChange={setPage}
                />
            </div >
        </div >
    );
};

export default KycManagement;