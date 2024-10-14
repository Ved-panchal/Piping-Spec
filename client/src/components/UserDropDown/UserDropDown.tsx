import { useState } from 'react';
import showToast from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

interface userDropDown {
    username:string,
}

const UserDropDown = ({ username }:userDropDown) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('user');
    showToast({ message: 'Logged out successfully!', type: 'success' });
    setTimeout(() => {
        navigate('/');
    },300)
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="text-gray-700 hover:text-gray-900 focus:outline-none"
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
