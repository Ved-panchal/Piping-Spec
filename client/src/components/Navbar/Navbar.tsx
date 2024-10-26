import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';  // Import Cookies from js-cookie
import Logo from '../Logo/Logo';
import showToast from '../../utils/toast';

const Navbar = ({ openModal }: { openModal: () => void }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in cookies
    const token = Cookies.get('token');
    console.log(token);
    if (!token) {
      handleLogout(false);
    } else {
      const user = JSON.parse(localStorage.getItem('user')!);
      if (user) {
        setUsername(user.name);
      }
    }
  }, []);

  const handleLogout = (showToastMessage = true) => {
    localStorage.removeItem('user');
    Cookies.remove('token'); 
    setUsername(null);
    setIsDropdownOpen(false);
    navigate('/');

    // Only show the toast if the action is manual (e.g., from a button click)
    if (showToastMessage) {
      showToast({ message: 'Logged out successfully!', type: 'success' });
    }
  };

  const handlePricingClick = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); 
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleServicesDropdown = () => {
    setIsServicesDropdownOpen(!isServicesDropdownOpen);
  };

  // Handle outside click for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isServicesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isServicesDropdownOpen]);

  return (
    <header className="">
      <div className="w-screen">
        <nav className="text-black backdrop-blur fixed top-0 z-30 w-full px-7 flex items-center justify-between py-4">
          {/* Left Side: Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/">
              <div className="flex items-center cursor-pointer">
                <Logo className="" />
                <p className="font-bold text-black text-lg">V Store</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-between w-[40%]">
            {/* Center: Menu Items */}
            <div className="hidden sm:flex gap-4">
              <Link
                to="/"
                className="text-black transform transition-transform duration-300 hover:scale-105 font-semibold rounded-sm px-2"
              >
                Home
              </Link>
              <button
                onClick={handlePricingClick}
                className="text-black transform transition-transform duration-300 hover:scale-105 font-semibold rounded-sm px-2"
              >
                Pricing
              </button>

              {/* Conditionally render Services Dropdown if the user is logged in */}
              {username && (
                <div className="relative" ref={servicesDropdownRef}>
                  <button
                    onClick={toggleServicesDropdown}
                    className="text-black transform transition-transform duration-300 hover:scale-105 font-semibold rounded-sm px-2"
                  >
                    Services
                  </button>
                  {isServicesDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md z-10">
                      <Link
                        to="/services/pipingspec-creation"
                        className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 flex items-center space-x-2"
                      >
                        {/* Placeholder for your logo */}
                        <img src="path-to-your-logo.png" alt="Piping Spec Logo" className="w-6 h-6" />
                        <span>Piping Spec Creation</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Auth/Login/Logout */}
            <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
              {username ? (
                <div>
                  <button
                    onClick={toggleDropdown}
                    className="bg-gray-200 px-4 py-2 rounded-lg text-black hover:bg-gray-300"
                  >
                    Welcome, {username.split(' ')[0]}
                  </button>
                  
                  {/* Dropdown for Logout */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10">
                      <button
                        onClick={() => handleLogout(true)} // Manual logout with toast
                        className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="bg-gray-200 px-4 py-2 rounded-lg text-black hover:bg-gray-300"
                  onClick={openModal}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
