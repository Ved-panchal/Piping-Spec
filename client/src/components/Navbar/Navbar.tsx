import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import showToast from '../../utils/toast';

const Navbar = ({ openModal }: { openModal: () => void }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Check localStorage for username when the component mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')!);
    if (user) {
      setUsername(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    showToast({ message: 'Logged out successfully!', type: 'success' });
    setUsername(null); 
    setIsDropdownOpen(false);
    navigate('/');
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
                        onClick={handleLogout}
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
