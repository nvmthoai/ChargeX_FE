import { useState, useEffect } from 'react';
import './UserManagement.css';

const ICONS = {
    add: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.33331 8H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    search: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    chevronDown: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    edit: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.99996 9.33333L9.33329 11.6667M8.74996 2.33333C8.97913 2.10416 9.29348 1.97278 9.62496 1.97278C9.78913 1.97278 9.95147 2.0049 10.1041 2.06733C10.2568 2.12976 10.3974 2.22141 10.5192 2.33666C10.7483 2.56583 10.8797 2.88018 10.8797 3.21166C10.8797 3.54314 10.7483 3.85749 10.5192 4.08666L4.08329 10.5225C3.96678 10.639 3.82626 10.7307 3.66914 10.7925L2.33329 11.2475L2.78829 9.91166C2.8501 9.75454 2.94175 9.61402 3.05829 9.4975L8.74996 2.33333Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    lock: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.33333 6.41667V4.66667C9.33333 3.92029 9.03482 3.20598 8.49852 2.66968C7.96222 2.13338 7.24792 1.83334 6.5 1.83334C5.75208 1.83334 5.03778 2.13338 4.50148 2.66968C3.96518 3.20598 3.66667 3.92029 3.66667 4.66667V6.41667M2.33333 6.41667H10.6667C11.0203 6.41667 11.3594 6.55268 11.6095 6.80276C11.8595 7.05284 12 7.39185 12 7.75V10.8333C12 11.1915 11.8595 11.5305 11.6095 11.7806C11.3594 12.0307 11.0203 12.1667 10.6667 12.1667H2.33333C1.97971 12.1667 1.6407 12.0307 1.39062 11.7806C1.14054 11.5305 1 11.1915 1 10.8333V7.75C1 7.39185 1.14054 7.05284 1.39062 6.80276C1.6407 6.55268 1.97971 6.41667 2.33333 6.41667Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    history: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.91669 1H8.16669L11.0834 3.91667V13C11.0834 13.1533 11.0219 13.2996 10.9125 13.409C10.8031 13.5184 10.6567 13.58 10.5 13.5H2.91669C2.76002 13.5 2.61372 13.5184 2.5043 13.409C2.39488 13.2996 2.33335 13.1533 2.33335 13V1.58333C2.33335 1.42667 2.39488 1.28036 2.5043 1.17094C2.61372 1.06152 2.76002 1 2.91669 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8.16669 1V3.91667H11.0834" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.66669 7H8.75002" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.66669 9.91666H8.75002" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const UserManagement = () => {

    const mockCustomers = [
        {
            id: 1,
            initial: 'T',
            name: 'Trần Thị Bình',
            role: 'Khách hàng',
            email: 'binh.tran@email.com',
            phone: '0901234567',
            regDate: '15/12/2024',
            bookings: 12,
            status: 'Hoạt động',
            statusClass: 'active',
            avatarClass: 'avatar-t'
        },
        {
            id: 2,
            initial: 'L',
            name: 'Lê Minh Cường',
            role: 'Khách hàng',
            email: 'cuong.le@email.com',
            phone: '0912345678',
            regDate: '20/2/2024',
            bookings: 8,
            status: 'Hoạt động',
            statusClass: 'active',
            avatarClass: 'avatar-l'
        },
        {
            id: 3,
            initial: 'P',
            name: 'Phạm Thu Hà',
            role: 'Khách hàng',
            email: 'ha.pham@email.com',
            phone: '0934567899',
            regDate: '10/3/2024',
            bookings: 3,
            status: 'Không hoạt động',
            statusClass: 'inactive',
            avatarClass: 'avatar-p'
        },
        {
            id: 4,
            initial: 'V',
            name: 'Võ Đình Nam',
            role: 'Khách hàng',
            email: 'nam.vo@email.com',
            phone: '0934567990',
            regDate: '25/3/2024',
            bookings: 15,
            status: 'Hoạt động',
            statusClass: 'active',
            avatarClass: 'avatar-v'
        },
    ];

    const [USERs, setUSERs] = useState([{
        id: 1,
        initial: 'T',
        name: 'Trần Thị Bình',
        role: 'Khách hàng',
        email: 'binh.tran@email.com',
        phone: '0901234567',
        regDate: '15/12/2024',
        bookings: 12,
        status: 'Hoạt động',
        statusClass: 'active',
        avatarClass: 'avatar-t'
    }]);

    useEffect(() => {
        setUSERs(mockCustomers);
    }, [])

    return (
        <div className='admin-container'>
            <div className="inner-container user-management-container">

                <header className="main-header">
                    <h1>User Management</h1>
                    <button className="btn btn-primary">
                        {ICONS.add}
                        Add more account
                    </button>
                </header>

                <div className="controls">
                    <div className="search-bar">
                        <span className="icon">{ICONS.search}</span>
                        <input type="text" placeholder="Tìm kiếm tên hoặc email..." />
                    </div>
                    <button className="btn btn-secondary">
                        Lọc theo trạng thái
                    </button>
                    <button className="btn btn-secondary btn-export">
                        Xuất danh sách
                        <span className="icon">{ICONS.chevronDown}</span>
                    </button>
                </div>

                <section className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-title">Total buyer</span>
                        <span className="stat-value">3</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Total seller</span>
                        <span className="stat-value">1</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">New user</span>
                        <span className="stat-value">12</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Average post/user</span>
                        <span className="stat-value">10</span>
                    </div>
                </section>

                <section className="customer-table-container">
                    <table className="customer-table">
                        <thead>
                            <tr>
                                <th>TÊN</th>
                                <th>EMAIL</th>
                                <th>SỐ ĐIỆN THOẠI</th>
                                <th>NGÀY ĐĂNG KÝ</th>
                                <th>SỐ LẦN ĐẶT</th>
                                <th>TRẠNG THÁI</th>
                                <th>HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {USERs.map(customer => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="customer-name-cell">
                                            <div className={`avatar ${customer.avatarClass}`}>
                                                {customer.initial}
                                            </div>
                                            <div className="customer-info">
                                                <span className="name">{customer.name}</span>
                                                <span className="role">{customer.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.regDate}</td>
                                    <td>
                                        <span className="booking-badge">{customer.bookings} lần</span>
                                    </td>
                                    <td>
                                        <span className={`status ${customer.statusClass}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn">
                                                {ICONS.edit} Sửa
                                            </button>
                                            <button className="action-btn">
                                                {ICONS.lock} Khóa
                                            </button>
                                            <button className="action-btn">
                                                {ICONS.history} Lịch sử
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};

export default UserManagement;