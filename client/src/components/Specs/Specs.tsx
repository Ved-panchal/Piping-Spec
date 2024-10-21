import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    // On page load or refresh, check if the projectId exists in local storage
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
        <div className="flex h-[90vh] bg-gray-50 p-6 rounded-lg shadow-lg relative">
            {/* Left Panel - Navigation */}
            <div className="w-1/10 bg-gray-800 p-4 flex flex-col justify-between h-full rounded-l-lg">
                {['Component 1', 'Component 2', 'Component 3', 'Component 4', 'Component 5', 'Component 6'].map((label, index) => (
                    <div
                        key={index}
                        onClick={() => handleNavClick(index)}
                        className={`cursor-pointer p-3 rounded-lg text-center font-medium select-none
                            ${activeComponent === index ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-800 text-gray-300'}
                            hover:bg-gray-700 hover:text-white transition-colors duration-300 ease-in-out transform hover:scale-105`}
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Right Panel - Main Content */}
            <div className="w-9/10 bg-white p-6 border-l-2 border-gray-200">
                {activeComponent === 0 && <div className="text-lg text-gray-700">Content for Component 1</div>}
                {activeComponent === 1 && <div className="text-lg text-gray-700">Content for Component 2</div>}
                {activeComponent === 2 && <div className="text-lg text-gray-700">Content for Component 3</div>}
                {activeComponent === 3 && <div className="text-lg text-gray-700">Content for Component 4</div>}
                {activeComponent === 4 && <div className="text-lg text-gray-700">Content for Component 5</div>}
                {activeComponent === 5 && <div className="text-lg text-gray-700">Content for Component 6</div>}
            </div>
        </div>
    );
}

export default Specs;
