import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '/assets/hero-image.jpg';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

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

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100); // trigger animation after mount
  }, []);

  return (
    <section
      id="home-section"
      className="w-full min-h-screen flex items-center bg-gradient-to-r from-[#ffffff] to-[rgb(195,218,255)] px-6 md:px-12 py-16"
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left: Text Content */}
        <div
          className={`w-full lg:w-1/2 text-center lg:text-left transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Streamline Your <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Piping Industry</span> Administration
          </h1>
          <p className="text-md text-gray-600 mb-8">
           Powerful admin tools designed specifically for piping industries in Sharjah. Simplify processes, reduce errors, and make data-driven decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={() => scrollToSection('services-section')}
              className="bg-blue-600 text-white px-3 py-2 text-md rounded-md font-medium hover:bg-blue-700 transition-transform duration-300 hover:scale-105 "
            >
              Explore Features
            </button>
            <button
              onClick={() => scrollToSection('pricing-section')}
              className="bg-gray-200 text-black px-3 py-2 text-md rounded-md font-medium hover:bg-gray-400 transition-transform duration-300 hover:scale-105"
            >
              Pricing
            </button>
          </div>
        </div>

        {/* Right: Image */}
        <div
          className={`w-full lg:w-1/2 flex justify-center transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <img
            src={heroImg}
            alt="V Store Hero"
            className="w-full max-w-[550px] h-auto object-contain rounded-lg shadow-2xl dark:shadow-black dark:shadow-[20px_35px_60px_-15px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105 outline-none border-none"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
