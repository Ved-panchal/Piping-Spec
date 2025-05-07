import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingConfiguration from '../Rating/RatingConfiguration';
import ScheduleConfiguration from '../Schedule/ScheduleConfiguration';
import SizeConfiguration from '../Size/SizeConfiguration';
import SpecsCreation from '../SpecsCreation/SpecsCreation';
import PmsInputSelector from '../PMSInputSelector/PmsInputSelector';
import ComponentConfiguration from '../ComponentConfiguration/Component';
import MaterialConfiguration from '../MaterialConfiguration/MaterialConfiguration';
import CatRefConfiguration from '../CatrefConfiguration/Catref';
import ConfigurationIcon from "../../assets/Configuration.png";

// Icons
const PmsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
// const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a1.75 1.75 0 00-1.75 1.75v.5a1.75 1.75 0 01-1.75 1.75h-.5A1.75 1.75 0 004 9.75v4.5A1.75 1.75 0 005.75 16h.5a1.75 1.75 0 011.75 1.75v.5A1.75 1.75 0 009.75 20h4.5a1.75 1.75 0 001.75-1.75v-.5a1.75 1.75 0 011.75-1.75h.5A1.75 1.75 0 0020 14.25v-4.5A1.75 1.75 0 0018.25 8h-.5a1.75 1.75 0 01-1.75-1.75v-.5A1.75 1.75 0 0014.25 4h-4.5z" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
// const PaymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

interface SpecsProps {
  projectId?: string;
}

const Specs: React.FC<SpecsProps> = ({ projectId }) => {
  const [showPmsSelector, setShowPmsSelector] = useState(true);
  const [activeConfigComponent, setActiveConfigComponent] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      localStorage.setItem('currentProjectId', projectId);
    }
  }, [projectId]);

  useEffect(() => {
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (!storedProjectId) {
      navigate('/services/pipingspec-creation');
    }
  }, [navigate]);

  const handleNavClick = (index: number) => {
    setShowPmsSelector(false);
    setActiveConfigComponent(index);
  };
  
  const handlePmsSelectorClick = () => {
    setShowPmsSelector(true);
  };

  const toggleConfigDropdown = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  const pmsInputSelectorComponent = <PmsInputSelector projectId={projectId} />;

  const configItems = [
    { title: 'Spec Configuration', component: <SpecsCreation /> },
    { title: 'Component Configuration', component: <ComponentConfiguration /> },
    { title: 'Size Configuration', component: <SizeConfiguration /> },
    { title: 'Schedule Configuration', component: <ScheduleConfiguration /> },
    { title: 'Rating Configuration', component: <RatingConfiguration /> },
    { title: 'Material Configuration', component: <MaterialConfiguration /> },
    { title: 'Catref Configuration', component: <CatRefConfiguration /> }
  ];

  return (
    <div className="flex min-h-[80vh] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r border-gray-200 flex flex-col">
        {/* <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-600">Piping Specs</h1>
        </div> */}
        <nav className="flex-1 mt-2 overflow-y-auto">
          <ul className="space-y-2 px-4">
            <li>
              <button
                className={`flex items-center w-full p-2 rounded-md transition ${
                  showPmsSelector ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-100'
                }`}
                onClick={handlePmsSelectorClick}
              >
                <PmsIcon />
                <span className="ml-3 text-sm font-medium">PMS Input Selector</span>
              </button>
            </li>
            <li>
              <button
                className="flex items-center justify-between w-full p-2 text-gray-700 rounded-md hover:bg-blue-100 transition"
                onClick={toggleConfigDropdown}
              >
                <div className="flex items-center">
                  <img src={ConfigurationIcon} height={22} width={22} />
                  <span className="ml-3 text-sm font-medium">Configuration</span>
                </div>
                {isConfigOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </button>
              {isConfigOpen && (
                <ul className="mt-2 space-y-1 ml-6">
                  {configItems.map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleNavClick(index)}
                        className={`w-full text-left px-2 py-2 text-sm rounded-md ${
                          !showPmsSelector && activeConfigComponent === index
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-blue-100'
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white p-6 rounded-lg shadow-sm h-[84vh]">
          {showPmsSelector ? pmsInputSelectorComponent : configItems[activeConfigComponent].component}
        </div>
      </main>
    </div>
  );
};

export default Specs;