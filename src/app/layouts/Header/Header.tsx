import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className='header-container'>
            <div className='logo'>MyLogo</div>
            <nav className='nav'>
                <Link to='/' className='nav-link'>
                    Home
                </Link>
                <Link to='/about' className='nav-link'>
                    About
                </Link>
                <Link to='/contact' className='nav-link'>
                    Contact
                </Link>
            </nav>
        </header>
    )
}

export default Header