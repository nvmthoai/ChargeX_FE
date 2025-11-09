import { useEffect, useState } from 'react';
import { fetchData, getQueryString, patchData } from '../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Pagination from '../../../components/Pagination/Pagination';
import SmallSpinner from '../../../components/SmallSpinner/SmallSpinner';
import './UserManagement.css';

const DefaultAvatar = '../../../../../public/lightning_thunder.png';

// const ICONS = {
//     add: <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M8 3.33331V12.6666' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' /><path d='M3.33331 8H12.6666' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' /></svg>,
//     search: <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' /><path d='M14 14L11.1 11.1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' /></svg>,
//     chevronDown: <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M4 6L8 10L12 6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' /></svg>,
//     edit: <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M6.99996 9.33333L9.33329 11.6667M8.74996 2.33333C8.97913 2.10416 9.29348 1.97278 9.62496 1.97278C9.78913 1.97278 9.95147 2.0049 10.1041 2.06733C10.2568 2.12976 10.3974 2.22141 10.5192 2.33666C10.7483 2.56583 10.8797 2.88018 10.8797 3.21166C10.8797 3.54314 10.7483 3.85749 10.5192 4.08666L4.08329 10.5225C3.96678 10.639 3.82626 10.7307 3.66914 10.7925L2.33329 11.2475L2.78829 9.91166C2.8501 9.75454 2.94175 9.61402 3.05829 9.4975L8.74996 2.33333Z' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' /></svg>,
//     lock: <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9.33333 6.41667V4.66667C9.33333 3.92029 9.03482 3.20598 8.49852 2.66968C7.96222 2.13338 7.24792 1.83334 6.5 1.83334C5.75208 1.83334 5.03778 2.13338 4.50148 2.66968C3.96518 3.20598 3.66667 3.92029 3.66667 4.66667V6.41667M2.33333 6.41667H10.6667C11.0203 6.41667 11.3594 6.55268 11.6095 6.80276C11.8595 7.05284 12 7.39185 12 7.75V10.8333C12 11.1915 11.8595 11.5305 11.6095 11.7806C11.3594 12.0307 11.0203 12.1667 10.6667 12.1667H2.33333C1.97971 12.1667 1.6407 12.0307 1.39062 11.7806C1.14054 11.5305 1 11.1915 1 10.8333V7.75C1 7.39185 1.14054 7.05284 1.39062 6.80276C1.6407 6.55268 1.97971 6.41667 2.33333 6.41667Z' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' /></svg>,
//     history: <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M2.91669 1H8.16669L11.0834 3.91667V13C11.0834 13.1533 11.0219 13.2996 10.9125 13.409C10.8031 13.5184 10.6567 13.58 10.5 13.5H2.91669C2.76002 13.5 2.61372 13.5184 2.5043 13.409C2.39488 13.2996 2.33335 13.1533 2.33335 13V1.58333C2.33335 1.42667 2.39488 1.28036 2.5043 1.17094C2.61372 1.06152 2.76002 1 2.91669 1Z' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' /><path d='M8.16669 1V3.91667H11.0834' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' /><path d='M4.66669 7H8.75002' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' /><path d='M4.66669 9.91666H8.75002' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' /></svg>,
// };

const UserManagement = () => {
    const [USERs, setUSERs] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [selectedEmailVerified, setSelectedEmailVerified] = useState('');
    const [selectedIsActive, setSelectedIsActive] = useState('');
    const [selectedIsDelete, setSelectedIsDelete] = useState('');
    const [selectedSortBy, setSelectedSortBy] = useState('');
    const [selectedOrder, setSelectedOrder] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [changeEmailVerifiedLoading, setChangeEmailVerifiedLoading] = useState(-1);
    const [changeIsActiveLoading, setChangeIsActiveLoading] = useState(-1);
    const [changeIsDeleteLoading, setChangeIsDeleteLoading] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [popupProps, setPopupProps] = useState<Record<string, any>>({});

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                const AllUsersResponse = await fetchData(`/users${getQueryString({ page: 1, limit: 1000 })}`, token);
                console.log('AllUsersResponse', AllUsersResponse);

                console.log(`/users${getQueryString({ page: page, limit: 10, emailVerified: selectedEmailVerified, isActive: selectedIsActive, isDelete: selectedIsDelete, sortBy: selectedSortBy, order: selectedOrder })}`);
                const PageUsersResponse = await fetchData(`/users${getQueryString({ page: page, limit: 10, emailVerified: selectedEmailVerified, isActive: selectedIsActive, isDelete: selectedIsDelete, sortBy: selectedSortBy, order: selectedOrder })}`, token);
                console.log('PageUsersResponse', PageUsersResponse);
                setUSERs(PageUsersResponse.data);
            } catch (error) {
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh, page, selectedEmailVerified, selectedIsActive, selectedIsDelete, selectedSortBy, selectedOrder]);

    const handleCheckboxChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const value = e.target.checked ? 'true' : 'false';
        setter(value);
    };

    const changeEmailVerified = async ({ index, id, value }: any) => {
        console.log('=F= changeEmailVerified');

        setChangeEmailVerifiedLoading(index);
        const token = localStorage.getItem('token') || '';
        const EmailVerifieData = {
            emailVerified: value == 'true' ? true : false
        }
        try {
            const PatchUserResponse = await patchData(`/users/${id}`, EmailVerifieData, token);
            console.log('PatchUserResponse', PatchUserResponse);
        } catch (error) {
            console.error(error);
            setError('Error');
        } finally {
            setChangeEmailVerifiedLoading(-1);
            setRefresh(p => p + 1);
        }
        return;
    }

    const changeIsActive = async ({ index, id, value }: any) => {
        console.log('=F= changeStatus');

        setChangeIsActiveLoading(index);
        const token = localStorage.getItem('token') || '';
        const IsActiveData = {
            isActive: value == 'true' ? true : false
        }
        try {
            const PatchUserResponse = await patchData(`/users/${id}`, IsActiveData, token);
            console.log('PatchUserResponse', PatchUserResponse);
        } catch (error) {
            console.error(error);
            setError('Error');
        } finally {
            setChangeIsActiveLoading(-1);
            setRefresh(p => p + 1);
        }
        return;
    }

    const changeIsDelete = ({ index, id, value }: any) => {// Fix===api isDelete
        console.log('=F= changeStatus');
        console.log('index', index);
        setChangeIsDeleteLoading(index);
        console.log('id', id);
        console.log('value', value);

        // setChangeIsDeleteLoading(-1);
        // setRefresh(p => p + 1);
        return;
    }

    if (loading) return <div className='admin-container'>Loading</div>
    if (error) return <div className='admin-container'>Error</div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container user-management-container'>

                <header className='main-header'>
                    <h1>User Management</h1>
                    <button className='btn btn-primary'>
                        <i className='fa-solid fa-plus' />
                        Add more account
                    </button>
                </header>

                <div className='controls'>
                    {/* FIX==search input */}
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Find by name or email...' />
                    </div>
                    <form>
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
                    </form>
                    <button className='btn btn-secondary' onClick={() => setRefresh(p => p + 1)}>
                        Refresh
                    </button>
                </div>

                <section className='admin-table-container'>
                    <table className='admin-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>CUSTOMER</th>
                                <th>EMAIL</th>
                                <th>PHONE NUMBER</th>
                                <th>ASIGN</th>
                                {/* <th>POST</th> */}
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {USERs?.data?.map((customer: any, index: any) => (
                                <tr key={customer.userId}>
                                    <td>{index + 1 + (page - 1) * 10}</td>
                                    <td>
                                        <div className='customer-name-cell'>
                                            <div className='avatar'>
                                                <img src={`${customer.avatar || DefaultAvatar}`} alt='avatar' />
                                            </div>
                                            <div className='customer-info'>
                                                <span className='name'>{customer.fullName}</span>
                                                <span className='role'>{customer.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='email'>
                                            <span>{customer.email}</span>
                                            {customer.emailVerified && <i className='fa-solid fa-circle-check' title='Verified' />}
                                            <span>
                                                {changeEmailVerifiedLoading == index ? <SmallSpinner />
                                                    :
                                                    <form>
                                                        <select id='formEmailVerified' value={customer.emailVerified ? 'true' : 'false'} onChange={(e) => changeEmailVerified({ index: index, id: customer.userId, value: e.target.value })}>
                                                            <option value={'true'}>Verified</option>
                                                            <option value={'false'}>Unverified</option>
                                                        </select>
                                                    </form>
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td>{customer.phone}</td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                    {/* <td>
                                        <span className='badge'>{customer.posts} posts</span>
                                    </td> */}
                                    <td>
                                        {/* <span className={`status ${customer.isActive ? '' : 'inactive'}`}>
                                            {customer.isActive ? 'Active' : (customer.isDelete ? 'Deleted' : 'Inactive')}
                                            {customer.isDelete && <i className='fa-solid fa-user-slash' title='Deleted' />}
                                        </span> */}
                                        {changeIsActiveLoading == index ? <SmallSpinner />
                                            :
                                            <form>
                                                <select id='formIsActive' value={customer.isActive ? 'true' : 'false'} onChange={(e) => changeIsActive({ index: index, id: customer.userId, value: e.target.value })}>
                                                    <option value={'true'}>Active</option>
                                                    <option value={'false'}>Inactive</option>
                                                </select>
                                            </form>
                                        }
                                        {/* {changeIsDeleteLoading == index ? <SmallSpinner />
                                            :
                                            <form>
                                                <select id='formIsDelete' value={customer.isDelete ? 'true' : 'false'} onChange={(e) => changeIsDelete(index, e.target.value, true)}>
                                                    <option value={'true'}>Delete</option>
                                                    <option value={'false'}>Restore</option>
                                                </select>
                                            </form>
                                        } */}
                                    </td>
                                    <td>
                                        <div className='action-buttons'>
                                            {/* <button>
                                                <span>Detail</span>
                                                <i className='fa-solid fa-pencil' />
                                            </button> */}
                                            {changeIsDeleteLoading == index ? <SmallSpinner />
                                                : (customer.isDelete ?
                                                    <button onClick={() => setPopupProps({ index: index, id: customer.id, value: false })}>
                                                        <span>Restore</span>
                                                        <i className='fa-solid fa-unlock' />
                                                    </button>
                                                    :
                                                    <button onClick={() => setPopupProps({ index: index, id: customer.id, value: true })}>
                                                        <span>Delete</span>
                                                        <i className='fa-solid fa-lock' />
                                                    </button>
                                                )
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {page == 2 &&
                                [...Array(10 - USERs?.data?.length)]?.map((_, i) => (
                                    <tr key={i}>
                                        <td><div className='no-user'></div></td>
                                        <td><div className='no-user'></div></td>
                                        <td><div className='no-user'></div></td>
                                        <td><div className='no-user'></div></td>
                                        <td><div className='no-user'></div></td>
                                        <td><div className='no-user'></div></td>
                                        <td><div className='no-user'></div></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </section>

                <Pagination
                    currentPage={page}
                    totalPages={USERs?.totalPages}
                    onPageChange={setPage}
                />

                {popupProps && Object.keys(popupProps).length > 0 && (
                    <ConfirmDialog
                        title={'DELETE CONFIRMATION'}
                        message={'Are you sure you want to delete this customer?'}
                        confirm={'DELETE'}
                        cancel={'CANCEL'}
                        color={'#dc354580'}
                        onConfirm={() => { changeIsDelete(popupProps), setPopupProps({}) }}
                        onCancel={() => setPopupProps({})}
                    />
                )}
            </div>
        </div>
    );
};

export default UserManagement;