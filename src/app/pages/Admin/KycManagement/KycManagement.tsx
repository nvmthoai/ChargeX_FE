import { useEffect, useState } from 'react';
import { fetchData, getQueryString } from '../../../../mocks/CallingAPI';
import Pagination from '../../../components/Pagination/Pagination';
import './KycManagement.css';

const KycManagement = () => {

    const [KYCs, setKYCs] = useState<Record<string, any>>({});
    const [selectedKyc, setSelectedKyc] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [changeStatusLoading, setChangeStatusLoading] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                console.log(`/kyc-profiles${getQueryString({ page: page, limit: 10, status: selectedStatus, level: selectedLevel })}`);
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

    const changeStatus = (index: any, value: any) => {// Fix===
        console.log('=F= changeStatus');
        console.log('index', index);
        setChangeStatusLoading(index);
        console.log('value', value);

        // setChangeStatusLoading(-1);
        // setRefresh(p => p + 1);
        return;
    }

    if (loading) return <div className='admin-container'>Loading</div>
    if (error) return <div className='admin-container'>Error</div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container kyc-management-container'>

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
                            <option value=''>-- Status --</option>
                            <option value='pending'>Pending</option>
                            <option value='approved'>Approved</option>
                            <option value='rejected'>Rejected</option>
                        </select>
                        <select id='formSelectedLevel' value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
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
                                <th>CUSTOMER</th>
                                <th>EMAIL</th>
                                <th>CREATED</th>
                                <th>IMAGE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {KYCs?.data?.map((kyc: any, index: any) => (
                                <tr key={kyc.kycProfileId}>
                                    <td>{index + 1 + (page - 1) * 10}</td>
                                    <td>
                                        <div className='customer-name-cell'>
                                            <div className='avatar'>
                                                <img src={`${kyc.user?.avatar || 'https://www.svgrepo.com/show/200115/lightning-thunder.svg'}`} alt='avatar' />
                                            </div>
                                            <div className='customer-info'>
                                                <span className='name'>{kyc.user?.fullName}</span>
                                                <span className='role'>{kyc.user?.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='email'>
                                            <span>{kyc.user?.email}</span>
                                            {kyc.user?.emailVerified && <i className='fa-solid fa-circle-check' title='Verified' />}
                                        </div>
                                    </td>
                                    <td>{new Date(kyc.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className='kyc-img'>
                                            <img src={`${kyc.user?.img || 'https://www.svgrepo.com/show/200115/lightning-thunder.svg'}`} alt='avatar' />
                                        </div>
                                    </td>
                                    <td>
                                        {changeStatusLoading == index ? <i className='fa-solid fa-spinner' />
                                            :
                                            <form>
                                                <select id='formIsActive' value={kyc.status} onChange={(e) => changeStatus(index, e.target.value)}>
                                                    <option value={'pending'}>Pending</option>
                                                    <option value={'approved'}>Approved</option>
                                                    <option value={'rejected'}>Rejected</option>
                                                </select>
                                            </form>
                                        }
                                    </td>
                                    <td>
                                        <div className='action-buttons'>
                                            <button onClick={() => setSelectedKyc(kyc)}>
                                                <span>Detail</span>
                                                <i className='fa-solid fa-pencil' />
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