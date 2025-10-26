import { useEffect, useState } from 'react';
import { fetchData, getQueryString, patchData } from '../../../../mocks/CallingAPI';
import Pagination from '../../../components/Pagination/Pagination';
import SmallSpinner from '../../../components/SmallSpinner/SmallSpinner';
import './KycManagement.css';

const DefaultAvatar = '../../../../../public/lightning_thunder.png';

const KycManagement = () => {

    const [KYCs, setKYCs] = useState<Record<string, any>>({});
    const [selectedKyc, setSelectedKyc] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSortBy, setSelectedSortBy] = useState('');
    const [selectedSortOrder, setSelectedSortOrder] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [changeStatusLoading, setChangeStatusLoading] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                console.log(`/kyc-profiles${getQueryString({ page: page, limit: 10, status: selectedStatus, level: selectedLevel, sortBy: selectedSortBy, sortOrder: selectedSortOrder })}`);
                const PageKycsResponse = await fetchData(`/kyc-profiles${getQueryString({ page: page, limit: 10, status: selectedStatus, level: selectedLevel, sortBy: selectedSortBy, sortOrder: selectedSortOrder })}`, token);
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
    }, [refresh, page, selectedStatus, selectedLevel, selectedSortBy, selectedSortOrder]);

    const changeStatus = async ({ index, id, value }: any) => {
        console.log('=F= changeStatus');

        setChangeStatusLoading(index);
        const token = localStorage.getItem('token') || '';
        const KycData = {
            status: value,
            note: 'You are ' + value
        }
        try {
            const PatchKycResponse = await patchData(`/kyc-profiles/${id}/status`, KycData, token);
            console.log('PatchKycResponse', PatchKycResponse);
        } catch (error) {
            console.error(error);
            setError('Error');
        } finally {
            setChangeStatusLoading(-1);
            setRefresh(p => p + 1);
        }
        return;
    }

    if (loading) return <div className='admin-container'>Loading</div>
    if (error) return <div className='admin-container'>Error</div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container kyc-management-container'>

                <header className='main-header'>
                    {/* FIX==popup */}
                    <h1>Kyc Management {selectedKyc?.user?.email || 'null'}</h1>
                </header>

                <div className='controls'>
                    {/* FIX==search input */}
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
                        <select id='formsetSelectedSortBy' value={selectedSortBy} onChange={(e) => setSelectedSortBy(e.target.value)}>
                            <option value=''>-- Sort --</option>
                            <option value='createdAt'>Created</option>
                            <option value='updatedAt'>Updated</option>
                        </select>
                        <select id='formSelectedSortOrder' value={selectedSortOrder} onChange={(e) => setSelectedSortOrder(e.target.value)}>
                            <option value=''>-- Sort Order --</option>
                            <option value='ASC'>ASC</option>
                            <option value='DESC'>DESC</option>
                        </select>
                    </form>
                    <button className='btn btn-secondary' onClick={() => setRefresh(p => p + 1)}>
                        Refresh
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
                                                <img src={`${kyc.user?.avatar || DefaultAvatar}`} alt='avatar' />
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
                                            <img src={`${kyc.user?.img || DefaultAvatar}`} alt='avatar' />
                                        </div>
                                    </td>
                                    <td>
                                        {changeStatusLoading == index ? <SmallSpinner />
                                            :
                                            (kyc.status == 'pending' ?
                                                <form>
                                                    <select id='formIsActive' value={kyc.status} onChange={(e) => changeStatus({ index: index, id: kyc.kycProfileId, value: e.target.value })}>
                                                        <option value={'pending'}>Pending</option>
                                                        <option value={'approved'}>Approved</option>
                                                        <option value={'rejected'}>Rejected</option>
                                                    </select>
                                                </form>
                                                :
                                                <div className={`kyc-status ${kyc.status}`}>{kyc.status}</div>
                                            )
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