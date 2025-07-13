import React from 'react';
import {
  FaBoxes,
  FaProjectDiagram,
  FaFileAlt,
  FaUsersCog,
  FaShieldAlt,
  FaChartBar,
  FaMoneyBillWave,
  FaClipboardCheck,
} from 'react-icons/fa';

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

const features: Feature[] = [
  {
    title: 'Inventory Management',
    description:
      'Track materials, equipment, and resources with precision. Prevent stockouts and overstock situations.',
    icon: <FaBoxes size={32} className="text-blue-600" />,
  },
  {
    title: 'Project Tracking',
    description:
      'Monitor all your piping projects from inception to completion with detailed progress tracking.',
    icon: <FaProjectDiagram size={32} className="text-blue-600" />,
  },
  {
    title: 'Document Management',
    description:
      'Centralize all your technical specifications, contracts, and compliance documentation.',
    icon: <FaFileAlt size={32} className="text-blue-600" />,
  },
  {
    title: 'Workforce Management',
    description:
      'Schedule and manage your specialized workforce efficiently based on project requirements.',
    icon: <FaUsersCog size={32} className="text-blue-600" />,
  },
  {
    title: 'Compliance Tracking',
    description:
      'Stay compliant with UAE regulations and industry standards with automated reminders.',
    icon: <FaShieldAlt size={32} className="text-blue-600" />,
  },
  {
    title: 'Performance Analytics',
    description:
      'Get insights into your operations with customizable analytics and reporting dashboards.',
    icon: <FaChartBar size={32} className="text-blue-600" />,
  },
  {
    title: 'Financial Management',
    description:
      'Track costs, budgets, and generate detailed financial reports for each project.',
    icon: <FaMoneyBillWave size={32} className="text-blue-600" />,
  },
  {
    title: 'Quality Assurance',
    description:
      'Implement quality control processes with inspection checklists and defect tracking.',
    icon: <FaClipboardCheck size={32} className="text-blue-600" />,
  },
];

const FeatureSection: React.FC = () => {
  return (
    <section
      id="services-section"
      className="py-2 px-6 md:px-12 bg-gradient-to-r from-[#ffffff] to-[rgb(195,218,255)]"
    >
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Comprehensive Solutions for Piping Industry
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our administrative software provides specialized tools designed specifically for the unique needs of piping industry professionals in Sharjah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ title, description, icon }) => (
          <div
            key={title}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:shadow-gray-500/50 transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
          >
            <div className="mb-4">{icon}</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
