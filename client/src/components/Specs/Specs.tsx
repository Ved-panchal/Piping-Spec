import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingConfiguration from '../Rating/RatingConfiguration';
import ScheduleConfiguration from '../Schedule/ScheduleConfiguration';
import SizeConfiguration from '../Size/SizeConfiguration';
import SpecsCreation from '../SpecsCreation/SpecsCreation';
import PmsInputSelector from '../PMSInputSelector/PmsInputSelector';
import ComponentConfiguration from '../ComponentConfiguration/Component';

interface SpecsProps {
    projectId?: string;
}

const Specs: React.FC<SpecsProps> = ({ projectId }) => {
    const [activeComponent, setActiveComponent] = useState<number>(0);
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
        setActiveComponent(index);
    };

    return (
        <div className="flex h-[90vh] bg-[#304D6D] p-6 rounded-lg shadow-lg relative">
            {/* Left Panel - Navigation */}
            <div className="w-56 bg-gray-800 p-4 flex flex-col justify-between min-h-[40vh] h-[78vh] rounded-lg m-2">
                {['PMS Input Selector','Spec Configuration', 'Component Configuration', 'Size Configuration', 'Schedule Configuration', 'Rating Configuration', 'Material Configuration'].map((label, index) => (
                    <div
                        key={index}
                        onClick={() => handleNavClick(index)}
                        className={`cursor-pointer p-3 rounded-lg text-left font-medium select-none
                            ${activeComponent === index ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-800 text-gray-300'}
                            hover:bg-gray-700 hover:text-white transition-colors duration-300 ease-in-out transform hover:scale-105`}
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Right Panel - Main Content */}
            <div className="w-full bg-transparent p-6 border-l-2 border-[#1d3650] rounded-md scrollable-container">
                {activeComponent === 0 && <div className="text-lg text-white"><PmsInputSelector projectId={projectId}/></div>}
                {activeComponent === 1 && <div className="text-lg text-white"><SpecsCreation/></div>}
                {activeComponent === 2 && <div className="text-lg text-white"><ComponentConfiguration/></div>}
                {activeComponent === 3 && <div className="text-lg text-white"><SizeConfiguration/></div>}
                {activeComponent === 4 && <div className="text-lg text-white"><ScheduleConfiguration/></div>}
                {activeComponent === 5 && <div className="text-lg text-white"><RatingConfiguration/></div>}
                {activeComponent === 6 && <div className="text-lg text-white">Content for Component 6</div>}
            </div>

        </div>
    );
}

export default Specs;
