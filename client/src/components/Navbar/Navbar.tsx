// import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';

const Navbar = () => {
//   const [, setCurrentPage] = useState("");
  const navigate = useNavigate(); // To navigate between pages

//   useEffect(() => {
//     setCurrentPage(window.location.pathname);
//   }, []);

  const menuItems = ["Home", "Pricing"];

  // Function to handle clicking on Pricing to scroll to the section
  const handlePricingClick = () => {
    if (window.location.pathname !== '/') {
      navigate('/');  // Navigate to the home page first if not there
    }
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);  // Slight delay for the page transition
  };

  return (
    <header className="bg-primary">
      <div className="w-screen">
        <nav className="bg-primary/50 text-secondary backdrop-blur fixed top-0 z-30 w-full px-7 flex items-center justify-between py-4">
          {/* Left Side: Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/">
              <div className="flex items-center cursor-pointer">
                <Logo className="!text-secondary" />
                <p className="font-bold text-secondary text-lg">V Store</p>
              </div>
            </Link>
          </div>

          <div className='flex items-center justify-between w-[40%]'>
            {/* Center: Menu Items */}
            <div className="hidden sm:flex gap-4">
              {menuItems.map((item, index) => (
                item === "Pricing" ? (
                  <button
                    key={index}
                    onClick={handlePricingClick}
                    className="text-secondary transform transition-transform duration-300 hover:scale-105 font-semibold rounded-sm px-2"
                  >
                    {item}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to="/"
                    className={`text-secondary transform transition-transform duration-300 hover:scale-105 font-semibold rounded-sm px-2 `}
                  >
                    {item}
                  </Link>
                )
              ))}
            </div>

            {/* Right Side: Sign Up Button */}
            <div className="flex items-center space-x-4">
              {/* Login Button */}
              <Link to="/signup">
                <button className="bg-gray-200 px-4 py-2 rounded-lg text-secondary hover:bg-gray-300">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
