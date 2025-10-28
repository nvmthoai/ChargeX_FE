import { useEffect, useState } from 'react';
import { fetchData, getQueryString } from '../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Pagination from '../../../components/Pagination/Pagination';
// import SmallSpinner from '../../../components/SmallSpinner/SmallSpinner';
import './TransactionManagement';

export default function TransactionManagement() {

    const [PAYMENTs, setPAYMENTs] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    // const [selectedEmailVerified, setSelectedEmailVerified] = useState('');
    // const [selectedIsActive, setSelectedIsActive] = useState('');
    // const [selectedIsDelete, setSelectedIsDelete] = useState('');
    // const [selectedSortBy, setSelectedSortBy] = useState('');
    // const [selectedOrder, setSelectedOrder] = useState('');
    const [refresh, setRefresh] = useState(0);
    // const [changeEmailVerifiedLoading, setChangeEmailVerifiedLoading] = useState(-1);
    // const [changeIsActiveLoading, setChangeIsActiveLoading] = useState(-1);
    // const [changeIsDeleteLoading, setChangeIsDeleteLoading] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const [popupProps, setPopupProps] = useState<Record<string, any>>({});

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                console.log(`/payments${getQueryString({ page: page, limit: 10 })}`);
                const PagePaymentsResponse = await fetchData(`/payments${getQueryString({ page: page, limit: 10 })}`, token);
                console.log('PagePaymentsResponse', PagePaymentsResponse);
                setPAYMENTs(PagePaymentsResponse.data);
            } catch (error) {
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh, page]);
    // }, [refresh, page, selectedEmailVerified, selectedIsActive, selectedIsDelete, selectedSortBy, selectedOrder]);

    if (loading) return <div className='admin-container'>Loading</div>
    // if (error) return <div className='admin-container'>Error</div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container transaction-management-container'>

                <header className='main-header'>
                    <h1>Transaction Management</h1>
                </header>

                <div className='controls'>
                    {/* FIX==search input */}
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Find by name or email...' />
                    </div>
                    {/* <form>
                        <label className={`checkbox-item ${selectedEmailVerified ? '' : 'disabled'}`}>
                            <input type='checkbox' checked={selectedEmailVerified === 'true'} onChange={(e) => handleCheckboxChange(e, setSelectedEmailVerified)} />
                            Email Verified
                            <button type='button' onClick={() => setSelectedEmailVerified('')}><i className='fa-solid fa-xmark' /></button>
                        </label>
                        <label className={`checkbox-item ${selectedIsActive ? '' : 'disabled'}`}>
                            <input type='checkbox' checked={selectedIsActive === 'true'} onChange={(e) => handleCheckboxChange(e, setSelectedIsActive)} />
                            Active
                            <button type='button' onClick={() => setSelectedIsActive('')}><i className='fa-solid fa-xmark' /></button>
                        </label>
                        <label className={`checkbox-item ${selectedIsDelete ? '' : 'disabled'}`}>
                            <input type='checkbox' checked={selectedIsDelete === 'true'} onChange={(e) => handleCheckboxChange(e, setSelectedIsDelete)} />
                            Deleted
                            <button type='button' onClick={() => setSelectedIsDelete('')}><i className='fa-solid fa-xmark' /></button>
                        </label>
                        <select id='formsetSelectedSortBy' value={selectedSortBy} onChange={(e) => setSelectedSortBy(e.target.value)}>
                            <option value=''>-- Sort --</option>
                            <option value='createdAt'>Created</option>
                            <option value='updatedAt'>Updated</option>
                        </select>
                        <select id='formSelectedOrder' value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}>
                            <option value=''>-- Order --</option>
                            <option value='ASC'>ASC</option>
                            <option value='DESC'>DESC</option>
                        </select>
                    </form> */}
                    <button className='btn btn-secondary' onClick={() => setRefresh(p => p + 1)}>
                        Refresh
                    </button>
                    <button className='btn btn-secondary btn-export'>
                        <span>Export list</span>
                        <i className='fa-solid fa-chevron-down' />
                    </button>
                </div>

                <section className='admin-table-container'>
                    <table className='admin-table'>
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
                            {PAYMENTs?.data?.map((pay: any, index: any) => (
                                <tr key={pay.paymentId}>
                                    <td>{index + 1 + (page - 1) * 10}</td>
                                    <td>
                                        <div className='customer-name-cell'>
                                            <div className='customer-info'>
                                                <span className='name'>{pay.user?.fullName}</span>
                                                <span className='role'>{pay.user?.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='email'>
                                            <span>{pay.user?.email}</span>
                                            {pay.user?.emailVerified && <i className='fa-solid fa-circle-check' title='Verified' />}
                                        </div>
                                    </td>
                                    <td>{new Date(pay.createdAt).toLocaleDateString()}</td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>
                                        {/* <div className='action-buttons'>
                                            <button>
                                                <span>Detail</span>
                                                <i className='fa-solid fa-pencil' />
                                            </button>
                                        </div> */}
                                    </td>
                                </tr>
                            ))}
                            {page == 2 &&
                                [...Array(10 - (PAYMENTs?.data?.length || 0))]?.map((_, i) => (
                                    <tr key={i}>
                                        <td><div className='no-payment'></div></td>
                                        <td><div className='no-payment'></div></td>
                                        <td><div className='no-payment'></div></td>
                                        <td><div className='no-payment'></div></td>
                                        <td><div className='no-payment'></div></td>
                                        <td><div className='no-payment'></div></td>
                                        <td><div className='no-payment'></div></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </section>

                <Pagination
                    currentPage={page}
                    totalPages={PAYMENTs?.totalPages}
                    onPageChange={setPage}
                />

                {error && (
                    <ConfirmDialog
                        title={'THERE IS AN ERROR'}
                        message={'An error is occured. Please try again later.'}
                        confirm={'OKAY'}
                        cancel={''}
                        color={'#dc354580'}
                        onConfirm={() => setError('')}
                        onCancel={() => setError('')}
                    />
                )}
            </div>
        </div>
    )
}
