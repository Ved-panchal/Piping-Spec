import { useEffect, useState } from 'react';
import { Select } from 'antd';
import showToast from '../../utils/toast';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';
import SizeRange from '../SizeRange/SizeRange';
import PMSCreation from '../PMSCreation/PMSCreation';
import { ApiError, Spec } from '../../utils/interface';

const { Option } = Select;

// Placeholder Components for PMS, SizingRange, and BranchTable
const PMS = ({ specId }: { specId?: string }) => <div className='text-black'><PMSCreation specId={specId!}/></div>;
const SizingRange = ({ specId }: { specId?: string }) => <div className='text-black'><SizeRange specId={specId!}/></div>;
const BranchTable = ({ specId }: { specId?: string }) => <div className='text-black'>Branch Table Component with Spec ID: {specId}</div>;

const PmsInputSelector = ({ projectId }: { projectId?: string }) => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('PMS');

  // Fetch specs data
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        if (!projectId) return;

        const response = await api.get(`${configApi.API_URL.specs.getAllSpecsByProject}/${projectId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (response && response.data && response.data.error && response.data.error.includes('expire')) {
          localStorage.clear();
          window.location.href = '/';
        }
        if (response && response.data && response.data.success) {
          setSpecs(response.data.specs);
        } else {
          showToast({ message: 'Failed to fetch specs.', type: 'error' });
        }
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.error || 'Error fetching specs.';
        showToast({ message: errorMessage, type: 'error' });
      }
    };

    fetchSpecs();
  }, [projectId]);

  // Handle spec change
  const handleSpecChange = (value: string) => {
    setSelectedSpec(value);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4">
      {/* Dropdown Selector */}
        <label htmlFor="specDropdown" className="text-white font-semibold">
          Select Spec:
        </label>
        <Select
          id="specDropdown"
          value={selectedSpec}
          onChange={handleSpecChange}
          placeholder="Select a spec"
          style={{ width: '180px' }}
          className="ml-3 text-base font-semibold text-black transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {specs.map((spec) => (
            <Option key={spec.id} value={spec.id}>
              {spec.specName}
            </Option>
          ))}
        </Select>
      

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-8 mt-4">
        <div
          className={`cursor-pointer py-2 px-4 rounded-lg transition-all duration-300
            ${activeTab === 'PMS' ? 'bg-black text-white' : 'bg-transparent text-gray-400'}`}
          onClick={() => handleTabChange('PMS')}
        >
          PMS
        </div>
        <div
          className={`cursor-pointer py-2 px-4 rounded-lg transition-all duration-300
            ${activeTab === 'Sizing Range' ? 'bg-black text-white' : 'bg-transparent text-gray-400'}`}
          onClick={() => handleTabChange('Sizing Range')}
        >
          Sizing Range
        </div>
        <div
          className={`cursor-pointer py-2 px-4 rounded-lg transition-all duration-300
            ${activeTab === 'Branch Table' ? 'bg-black text-white' : 'bg-transparent text-gray-400'}`}
          onClick={() => handleTabChange('Branch Table')}
        >
          Branch Table
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
        {activeTab === 'PMS' && <PMS specId={selectedSpec} />}
        {activeTab === 'Sizing Range' && <SizingRange specId={selectedSpec} />}
        {activeTab === 'Branch Table' && <BranchTable specId={selectedSpec} />}
      </div>
    </div>
  );
};

export default PmsInputSelector;
