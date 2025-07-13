import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import showToast from '../../utils/toast';

const Navbar = ({
  openModal,
  setUsername,
  username,
}: {
  openModal: () => void;
  setUsername: (name: string) => void;
  username: string | null;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user')!);
    if (!token) {
      handleLogout(false);
    }
    if (user) {
      setUsername(user.name);
    }
  }, [username, setUsername]);

  const handleLogout = (showToastMessage = true) => {
    localStorage.clear();
    setUsername('');
    setIsDropdownOpen(false);
    navigate('/');
    if (showToastMessage) {
      showToast({ message: 'Logged out successfully!', type: 'success' });
    }
  };

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleServicesDropdown = () => {
    setIsServicesDropdownOpen(!isServicesDropdownOpen);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full fixed top-0 z-30 bg-white/80 backdrop-blur ">
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between relative">
        {/* Left: Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => scrollToSection('home-section')}
        >
          <Logo className="" />
          <p className="font-bold text-black text-lg">V Store</p>
        </div>

        {/* Center: Navigation Links */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6">
          <button
            onClick={() => scrollToSection('home-section')}
            className="text-black font-semibold hover:scale-105 hover:text-blue-800 transition-transform px-2"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('services-section')}
            className="text-black font-semibold hover:scale-105 hover:text-blue-800 transition-transform px-2"
          >
            What We Offer
          </button>
          <button
            onClick={() => scrollToSection('pricing-section')}
            className="text-black font-semibold hover:scale-105 hover:text-blue-800 transition-transform px-2"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('aboutus-section')}
            className="text-black font-semibold hover:scale-105 hover:text-blue-800 transition-transform px-2 whitespace-nowrap"
          >
            About Us
          </button>
          <button
            onClick={() => scrollToSection('contact-section')}
            className="text-black font-semibold hover:scale-105  hover:text-blue-800 transition-transform px-2"
          >
            Contact
          </button>
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
                        <img src="path-to-your-logo.png" alt="Piping Spec Logo" className="w-6 h-6" />
                        <span>Piping Spec Creation</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
        </div>

        {/* Right: Auth */}
        <div className="flex items-center space-x-4" ref={dropdownRef}>
          {username ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-gray-200 px-4 py-2 rounded-lg text-black hover:bg-gray-300"
              >
                Welcome, {username.split(' ')[0]}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
                  <button
                    onClick={() => handleLogout(true)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
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
      </nav>
    </header>
  );
};

export default Navbar;
