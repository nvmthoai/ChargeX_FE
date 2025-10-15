import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteData, fetchData, postData } from '../../../../mocks/CallingAPI';
// import ConfirmDialog from '../../../components/ConfirmDialog.jsx';
// import SimpleButton from '../../../components/SimpleButton.jsx';
// import { useAuth } from '../../../hooks/AuthContext/AuthContext.jsx';
// import Loading from '../../../layouts/Loading/Loading.jsx';
// import EditUserModal from './EditUserModal.jsx';
import '../ManagementStyle.css';

export default function UserManagement() {
    // const { user } = useAuth();
    const user = {
        role: 'Admin'
    }

    const [USERs, setUSERs] = useState([{
        id: 1,
        name: 'ABC',
        username: '',
        password: '',
        role: '',
        curatorId: null,
        email: '',
        point: 0,
        joinedDate: null,
        dayStreak: 0,
        highestDayStreak: 0,
        image: '',
        lastOnline: new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).split('T')[0],
        type: '',
    }, {
        id: 2,
        name: '123',
        username: '',
        password: '',
        role: '',
        curatorId: null,
        email: '',
        point: 0,
        joinedDate: null,
        dayStreak: 0,
        highestDayStreak: 0,
        image: '',
        lastOnline: new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).split('T')[0],
        type: '',
    }]);

    const [form, setForm] = useState({
        name: '',
        username: '',
        password: '',
        role: '',
        curatorId: null,
        email: '',
        point: 0,
        joinedDate: null,
        dayStreak: 0,
        highestDayStreak: 0,
        image: '',
        lastOnline: new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).split('T')[0],
        type: '',
    });
    const [editing, setEditing] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [Refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // const token = user?.token;
        const token = '';
        const fetchDataAPI = async () => {
            try {
                setLoading(true);
                const userData = await fetchData('listuser', token);
                console.log('userData', userData);
                setUSERs(userData);
            } catch (error) {
                setError("error");
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [user, Refresh]);

    // const handleChange = (e) => {
    //     setForm({ ...form, [e.target.name]: e.target.value });
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     // const token = user?.token;
    //     // const token = '';
    //     try {
    //         setLoading(true);
    //         // form.price = Math.abs(form.price);
    //         // const resultAddUser = await postData('api/user', form, token);
    //         // console.log('resultAddUser', resultAddUser);
    //         setForm({
    //             name: '',
    //             username: '',
    //             password: '',
    //             role: '',
    //             curatorId: null,
    //             email: '',
    //             point: 0,
    //             joinedDate: null,
    //             dayStreak: 0,
    //             highestDayStreak: 0,
    //             image: '',
    //             lastOnline: new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).split('T')[0],
    //             type: '',
    //         });
    //         setRefresh(p => p + 1);
    //     } catch (error) {
    //         setError("error");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleDeleteClick = (id) => {
    //     setSelectedId(id);
    //     setConfirm(true);
    // };

    // const handleDelete = async () => {
    //     // const token = user?.token;
    //     // const token = '';
    //     try {
    //         setLoading(true);
    //         // const resultDeleteUser = await deleteData(`api/user/${selectedId}`, token);
    //         // console.log('resultDeleteUser', resultDeleteUser);
    //         setRefresh(p => p + 1);
    //         setConfirm(false);
    //     } catch (error) {
    //         setError(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const openEditModal = (data) => { setEditing(data); };
    // const closeEditModal = () => { setEditing(null); };

    // if (loading) return <Loading Size={'Large'} />
    if (loading) return <div>Loading</div>
    if (!error) return <div>Error</div>
    return (
        <div className='usermanagement-container management-container admin-container'>
            <div className='title'>User Management</div>
            <form
                // onSubmit={handleSubmit}
                className='add-form'
            >
                {/* <input name='name' placeholder='Name' value={form.name} onChange={handleChange} required />
                <input name='image' placeholder='Image URL' value={form.image} onChange={handleChange} required />
                <input name='price' placeholder='Price' value={form.price} onChange={handleChange} required /> */}
                {/* <SimpleButton
                    width={'80px'}
                    height={'40px'}
                    radius={'8px'}
                    textcolor={'#28a745'}
                    bgcolor={'#eee'}
                    active={false}
                    onToggle={handleSubmit}
                >
                    <div className='text'>ADD</div>
                </SimpleButton> */}
                {/* <SimpleButton
                    width={'80px'}
                    height={'40px'}
                    radius={'8px'}
                    textcolor={'#007bff'}
                    bgcolor={'#eee'}
                    active={false}
                    onToggle={() => setRefresh(p => p + 1)}
                >
                    <div className='text'>Refresh</div>
                </SimpleButton> */}
            </form>

            <div className='table-container user-table'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>ID</th>
                            <th>Avatar</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th><i className='fa-solid fa-fire'></i></th>
                            <th><i className='fa-solid fa-lightbulb'></i></th>
                            <th>Role</th>
                            <th>Type</th>
                            {/* <th>Curator</th> */}
                            {/* <th>Highest Streak</th> */}
                            {/* <th>Joined</th> */}
                            {/* <th>Last Online</th> */}
                            {/* <th>Username</th> */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {USERs.map((data, i) => (
                            <tr key={data.id} className={`${data.role == 'Admin' ? 'tr-admin' : (data.role == 'Disable' ? 'tr-disable' : '')}`}>
                                <td className='fit-td'><div className='index'>#{i + 1}</div></td>
                                <td className='fit-td'><div className='id'>{data.id}</div></td>
                                <td className='fit-td'><img src={data.image} alt={data.name} className='avatar convex' /></td>
                                <td><div className='name'>{data.name}</div></td>
                                <td><div className='email'>{data.email}</div></td>
                                <td><div className='daystreak'>{data.role == 'Student' ? data.dayStreak : <i className='no-data'>No data</i>}</div></td>
                                <td><div className='point'>{(data.role == 'Student' || data.role == 'Parent') ? data.point : <i className='no-data'>No data</i>}</div></td>
                                <td><div className='role'>{data.role}</div></td>
                                <td><div className={`type ${data.type == 'VIP' ? 'gold' : ''}`}>{data.type}</div></td>
                                {/* <td><div className='curator'>{data.curatorId}</div></td> */}
                                {/* <td><div className='highestdaystreak'>{data.highestDayStreak}</div></td> */}
                                {/* <td className='fit-td'><div className='joineddate'>{data.joinedDate}</div></td> */}
                                {/* <td className='fit-td'><div className='lastonline'>{data.lastOnline}</div></td> */}
                                {/* <td><div className='username'>{data.username}</div></td> */}
                                <td className='fit-td'>
                                    <div className='btn-box'>
                                        <div className='show-btn'>
                                            {/* <SimpleButton
                                                width={'76px'}
                                                height={'32px'}
                                                radius={'8px'}
                                                textcolor={'#888'}
                                                bgcolor={'#eee'}
                                                active={false}
                                                onToggle={() => setSelectedId(p => p == data.id ? null : data.id)}
                                            >
                                                <i className={`fa-solid fa-${selectedId == data.id ? 'xmark' : 'ellipsis'}`}></i>
                                            </SimpleButton> */}
                                            {selectedId == data.id &&
                                                <div className='hidden-btn'>
                                                    {/* <SimpleButton
                                                        width={'32px'}
                                                        height={'32px'}
                                                        radius={'8px'}
                                                        textcolor={'#007bff'}
                                                        bgcolor={'#eee'}
                                                        active={false}
                                                    >
                                                        <i className='fa-solid fa-magnifying-glass'></i>
                                                    </SimpleButton> */}
                                                    {/* <SimpleButton
                                                        width={'32px'}
                                                        height={'32px'}
                                                        radius={'8px'}
                                                        textcolor={'#fb8b24'}
                                                        bgcolor={'#eee'}
                                                        active={false}
                                                        onToggle={() => openEditModal(data)}
                                                    >
                                                        <i className='fa-solid fa-pencil'></i>
                                                    </SimpleButton> */}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* {editing && (
                <EditUserModal
                    userprop={editing}
                    onClose={closeEditModal}
                    setRefresh={setRefresh}
                    USERs={USERs}
                />
            )} */}

            {/* {confirm && (
                <ConfirmDialog
                    title={'Delete Confirmation'}
                    message={'Are you sure you want to delete this user?'}
                    button={'DELETE'}
                    color={'#dc3545'}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(false)}
                />
            )} */}
        </div>
    )
}
