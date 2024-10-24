import { useEffect, useState } from 'react';
import { Select } from 'antd';
import showToast from '../../utils/toast';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config'; 

const { Option } = Select;

interface ApiError extends Error {
    response?: {
      data?: {
        error?: string;
      };
      status?: number;
    };
}

interface Spec {
    id: string;
    specName: string;
    rating: string;
    baseMaterial: string;
}

const PmsInputSelector = ({ projectId }: { projectId?: string }) => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string | undefined>(undefined); // Ant Design's Select works with undefined

  // Fetch specs data
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        if (!projectId) return;

        const response = await api.get(`${configApi.API_URL.specs.getAllSpecsByProject}/${projectId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

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

  return (
    <div className="relative flex items-center p-4">
      <label 
        htmlFor="specDropdown" 
        className="text-white font-semibold mr-4"
      >
        Select Spec:
      </label>
      <Select 
        id="specDropdown"
        value={selectedSpec}
        onChange={handleSpecChange}
        placeholder="Select a spec"
        style={{ width: '180px' }}
        className="text-base font-semibold text-black transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {specs.map((spec) => (
          <Option key={spec.id} value={spec.id}>
            {spec.specName}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default PmsInputSelector;
