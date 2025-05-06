import { useState, useEffect, useRef } from 'react';
import showToast from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

interface UserDropDownProps {
  username: string;
}

const UserDropDown: React.FC<UserDropDownProps> = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference to the dropdown
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('user');
    showToast({ message: 'Logged out successfully!', type: 'success' });
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  // Effect to close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the dropdownRef
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add event listener to detect clicks outside
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup the event listener when component unmounts
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="text-gray-700 font-semibold hover:text-gray-900 focus:outline-none"
      >
        Welcome, {username}
      </button>
      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
          <ul className="py-2">
            <li>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDropDown;
