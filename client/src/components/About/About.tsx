import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Award, UserCheck } from "lucide-react";
import Aboutsctimg from "../../assets/Aboutsctimg.jpg";

export default function AboutUsSection() {
  const navigate = useNavigate();

  const scrollToContact = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#ffffff] to-[rgb(195,218,255)] mx-auto px-6 py-10">
      {/* Header and content above */}
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        {/* Left: Image */}
        <div className="relative">
          <div className="w-full flex justify-center transition-transform duration-300 hover:scale-105">
            <img
              src={Aboutsctimg}
              alt="About Us"
              className="w-full max-w-[550px] rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>

        {/* Right: Text Content */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Founded in 2020, PipeAdmin was born out of a vision to address the unique administrative challenges faced by piping industries in Sharjah.
            We understand the complex processes within the piping sector and have built our software to address specific pain points.
          </p>

          <button
            onClick={scrollToContact}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Learn More About Us
          </button>
        </div>
      </div>

      {/* Stats grid below remains unchanged */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
          <div className="text-gray-600 text-sm font-medium">Piping Customers</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border">
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
          <div className="text-gray-600 text-sm font-medium">Years Experience</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border">
          <Award className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
          <div className="text-gray-600 text-sm font-medium">Customer Satisfaction</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border">
          <UserCheck className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
          <div className="text-gray-600 text-sm font-medium">Expert Team Members</div>
        </div>
      </div>
    </div>
  );
}
