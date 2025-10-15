import { Link, Outlet, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/AuthContext/AuthContext.jsx';
import './NavigationBar.css';

export default function NavigationBar() {
    // const { user } = useAuth();
    const location = useLocation();
    console.log('NavigationBar', location.pathname);

    const menuItems = [
        { name: 'USER', icon: 'user', path: '/admin/user-management' },
        { name: 'TRANSACTION', icon: 'dollar', path: '/admin/transaction-management' },
        { name: 'POST', icon: 'clipboard', path: '/post-management' },
        { name: 'REPORT', icon: 'circle-exclamation', path: '/report-management' },
        { name: 'PROFILE', icon: 'circle-user', path: '/profile' },
    ];

    return (
        <>
            <div className={`navigation-bar-container simple-navigation-bar-container`}>
                <Link to='/admin'>
                    <div className='logo'>ChargeX</div>
                </Link>
                <div className='items'>
                    {menuItems.map((item, index) => (
                        <div key={index} className={`item ${location.pathname.includes(item.path) ? 'located' : ''}`}>
                            <Link to={`${item.path}`} className='management'>
                                <i className={`fa-solid fa-${item.icon}`}></i>
                                <span>{item.name}</span>
                                <i className='fa-solid fa-gear'></i>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <Outlet />
        </>
    )
}
