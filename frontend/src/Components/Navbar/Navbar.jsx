import React, {useContext, useState, useRef, useEffect} from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import logo from '../Assets/Frontend_Assets/logo.png'  
import cart_icon from '../Assets/Frontend_Assets/cart_icon.png'
import profile_icon from '../Assets/Frontend_Assets/user.png'
import { ShopContext } from '../../Context/ShopContext'
import nav_dropdown_icon from '../Assets/Frontend_Assets/nav_dropdown.png'

const Navbar = () => {
    const location = useLocation();
    const [menu, setMenu] = useState("shop");
    const { getTotalCartItems } = useContext(ShopContext);
    const menuRef = useRef();
    
    useEffect(() => {
        const path = location.pathname;
        switch(path) {
            case '/':
                setMenu("shop");
                break;
            case '/mens':
                setMenu("mens");
                break;
            case '/womens':
                setMenu("womens");
                break;
            case '/kids':
                setMenu("kids");
                break;
            case '/transactions':
                setMenu("transactions");
                break;
            default:
                break;
        }
    }, [location]);

    const dropdown_toggle = (e) => {
        menuRef.current.classList.toggle('nav-menu-visible');
        e.target.classList.toggle('open');
    }

    const handleLogoClick = () => {
        setMenu("shop");
    }

    const isShopPage = () => {
        const shopPages = ['/', '/mens', '/womens', '/kids'];
        return shopPages.includes(location.pathname);
    }

    const isTransactionsPage = () => {
        return location.pathname === '/transactions';
    }

    return (
        <div className="navbar">
            <Link 
                to='/' 
                className="navbar-logo"
                onClick={handleLogoClick}
            >
                <img src={logo} alt="Logo" />
                <p>THRDS.</p>
            </Link>
            <img 
                className="nav-dropdown" 
                onClick={dropdown_toggle} 
                src={nav_dropdown_icon} 
                alt="Menu" 
            />
            <ul ref={menuRef} className="navbar-links">
                <li>
                    <Link to='/' onClick={() => setMenu("shop")}>Shop</Link> 
                    {isShopPage() && menu === "shop" ? <hr/> : <></>}
                </li>
                <li>
                    <Link to='/mens' onClick={() => setMenu("mens")}>Men</Link> 
                    {isShopPage() && menu === "mens" ? <hr/> : <></>}
                </li>
                <li>
                    <Link to='/womens' onClick={() => setMenu("womens")}>Women</Link>  
                    {isShopPage() && menu === "womens" ? <hr/> : <></>}
                </li>
                <li>
                    <Link to='/kids' onClick={() => setMenu("kids")}>Kids</Link>  
                    {isShopPage() && menu === "kids" ? <hr/> : <></>}
                </li>
                {localStorage.getItem('auth-token') && (
                    <li>
                        <Link to='/transactions' onClick={() => setMenu("transactions")}>My Orders</Link>  
                        {isTransactionsPage() && menu === "transactions" ? <hr/> : <></>}
                    </li>
                )}
            </ul>
                <div className="navbar-login-cart">
                {localStorage.getItem('auth-token') ? (
                    <>
                        <button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to='/login'> 
                        <button>Login</button> 
                    </Link>
                )}
                <Link to='/cart'> 
                    <img src={cart_icon} alt="Cart" />
                </Link>
                <div className="navbar-cart-count">{getTotalCartItems()}</div>
                {localStorage.getItem('auth-token') && (
                    <Link to='/userprofile' className="profile-link">
                        <img src={profile_icon} alt="Profile" className="navbar-profile-icon" />
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Navbar