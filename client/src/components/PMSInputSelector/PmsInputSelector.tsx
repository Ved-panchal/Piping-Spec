import { useEffect, useState } from 'react';
import { Select } from 'antd';
import showToast from '../../utils/toast';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';
import SizeRange from '../SizeRange/SizeRange';
import PMSCreation from '../PMSCreation/PMSCreation';
import BranchTable from "../BranchTable/BranchTable";
import { ApiError, Spec } from '../../utils/interface';

const { Option } = Select;

// Placeholder Components
const PMS = ({ specId } : { specId?: string }) => <div className="text-black"><PMSCreation specId={specId!}/></div>;
const SizingRange = ({ specId } : { specId?: string }) => <div className="text-black"><SizeRange specId={specId!}/></div>;
const BranchTableConfig = ({ specId } : { specId?: string }) => <div className="text-black"><BranchTable specId={specId!}/></div>;

const PmsInputSelector = ({ projectId } : { projectId?: string }) => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState(undefined);
  const [activeTab, setActiveTab] = useState('PMS');
  const [loading, setLoading] = useState(false);

  // Fetch specs data
  useEffect(() => {
    const fetchSpecs = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        const response = await api.get(`${configApi.API_URL.specs.getAllSpecsByProject}/${projectId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response && response.data && response.data.error && response.data.error.includes('expire')) {
          localStorage.clear();
          window.location.href = '/';
        }
        
        if (response && response.data && response.data.success) {
          setSpecs(response.data.specs);
          if (response.data.specs.length > 0) {
            setSelectedSpec(response.data.specs[0].id);
          }
        } else {
          showToast({ message: 'Failed to fetch specs.', type: 'error' });
        }
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.error || 'Error fetching specs.';
        showToast({ message: errorMessage, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSpecs();
  }, [projectId]);

  return (
    <div className="w-full bg-gray-50">
      <div className="px-4 py-2 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">Spec:</span>
            <Select
              value={selectedSpec}
              onChange={(value) => setSelectedSpec(value)}
              placeholder="Select a spec"
              style={{ width: '180px' }}
              className="text-sm"
              loading={loading}
              disabled={specs.length === 0}
            >
              {specs.map((spec) => (
                <Option key={spec.id} value={spec.id}>
                  {spec.specName}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Tab Navigation - More compact and professional */}
      <div className="flex border-b border-gray-200 bg-white">
        {['PMS', 'Sizing Range', 'Branch Table'].map((tab) => (
          <div
            key={tab}
            className={`cursor-pointer py-2 px-4 font-medium text-sm transition-all duration-200
              ${activeTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Tab Content - White background with subtle shadow */}
      <div className="bg-white">
        {selectedSpec ? (
          <>
            {activeTab === 'PMS' && <PMS specId={selectedSpec} />}
            {activeTab === 'Sizing Range' && <SizingRange specId={selectedSpec} />}
            {activeTab === 'Branch Table' && <BranchTableConfig specId={selectedSpec} />}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Please select a spec to continue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PmsInputSelector;