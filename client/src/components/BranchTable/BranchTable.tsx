import React, { useState, useRef, useEffect } from 'react';
import { grid } from 'ldrs'
import { ApiError, SizeRange } from '../../utils/interface';
import showToast from '../../utils/toast';
import api from '../../utils/api/apiutils';
import {api as configApi} from "../../utils/api/config"

// Initialize the loader (required)
grid.register()

type Position = {
  top: number;
  left: number;
};

type Option = {
  value: string;
  label: string;
};

type SelectionChangeData = {
  runSize: number;
  branchSize: number;
  selectedOption: string;
};

type CustomSelectProps = {
  runSize: number;
  branchSize: number;
  onSelectionChange: (data: SelectionChangeData) => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  id: string;
  preselectedValue?: string; // Add preselectedValue as an optional prop
};

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  runSize, 
  branchSize, 
  onSelectionChange, 
  activeDropdown,
  setActiveDropdown,
  id,
  preselectedValue
}) => {
  
  const [selectedValue, setSelectedValue] = useState<string>(preselectedValue || '');
  const [dropdownPosition, setDropdownPosition] = useState<Position>({ top: 0, left: 0 });
  const [, setIsAbove] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown menu

  const options: Option[] = [
    { value: '', label: 'Select' },
    { value: 'TEE', label: 'T' },
    { value: 'WOL', label: 'W' },
    { value: 'SOL', label: 'S' },
    { value: 'TOL', label: 'O' },
    { value: 'P2P', label: 'P' },
    { value: 'P2R', label: 'R' },
    { value: 'HFC', label: 'H' },
    { value: 'SWL', label: 'L' },
    { value: 'INT', label: 'I' },
  ];

  const isOpen = activeDropdown === id;

  const updateDropdownPosition = () => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200; // Fixed height for dropdown
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition({
          top: rect.top + window.scrollY - dropdownHeight - 8,
          left: rect.left + window.scrollX
        });
        setIsAbove(true);
      } else {
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX
        });
        setIsAbove(false);
      }
    }
  };

  useEffect(() => {
    updateDropdownPosition();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        // Check if the click happened outside both button and dropdown
        if (
          buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
        ) {
          setActiveDropdown(null);
        }
      };

      document.addEventListener('pointerdown', handleClickOutside); // Use `pointerdown` for finer control
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [isOpen, setActiveDropdown]);

  const handleSelection = (value: string) => {
    const selectedOptionLabel = value ? options.find(opt => opt.value === value)?.label ?? 'Select' : 'Select';
    setSelectedValue(selectedOptionLabel);  // Update selected value
    setActiveDropdown(null); // Close the dropdown

    // Trigger the onSelectionChange callback
    onSelectionChange({
      runSize,
      branchSize,
      selectedOption: selectedOptionLabel
    });
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setActiveDropdown(isOpen ? null : id)}
        className="relative min-w-20 px-2 py-1 text-left bg-white border rounded-md shadow-sm text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {selectedValue || 'Select'}
        <span className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
          <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      
      {isOpen && dropdownPosition.top !== 0 && (
        <div 
          ref={dropdownRef} // Attach ref to dropdown
          className="fixed w-20 bg-white rounded-md shadow-lg border overflow-y-auto max-h-52 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" 
          style={{ 
            zIndex: 9999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelection(option.value)}
                className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BranchTable: React.FC<{ specId: string }> = ({ specId }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [runSizes, setRunSizes] = useState<number[]>([]);
  const [branchSizes, setBranchSizes] = useState<number[]>([]);
  const [tableWidth, setTableWidth] = useState("auto");
  const [branchDataMap, setBranchDataMap] = useState<Record<string, string>>({});
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!specId){
      showToast({message:"Select Spec ID First",type:"info"})
      return;
    }
    fetchSizeRange();
    fetchBranchData();
  }, [specId]);

  useEffect(() => {
    const updateTableWidth = () => {
      if (tableRef.current) {
        const containerWidth = tableRef.current.offsetWidth;
        const minWidth = Math.min(containerWidth, 1200);
        setTableWidth(`${minWidth}px`);
      }
    };

    updateTableWidth();
    window.addEventListener('resize', updateTableWidth);
    return () => window.removeEventListener('resize', updateTableWidth);
  }, [runSizes]);

  const fetchSizeRange = async () => {
    setLoading(true);
    try {
      const response = await api.post(configApi.API_URL.sizeranges.getall, { specId });
      if (response.data.success) {
        const sizeValues : number[] = response.data.sizeranges.map((range:SizeRange) => range.odValue);
        setRunSizes(sizeValues.sort((a, b) => a - b));
        setBranchSizes(sizeValues.sort((a, b) => a - b));
      } else {
        throw new Error('Failed to fetch Size Ranges.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to fetch Size Range.';
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBranchData = async () => {
    try {
      const response = await api.post(configApi.API_URL.branch.getall, { specId });
      if (response.data.success) {
        const dataMap: Record<string, string> = {};
  
        // Populate dataMap with branch data
        response.data.brancheData.forEach((item: any) => {
          const key = `${item.run_size}-${item.branch_size}`;
          dataMap[key] = item.comp_name;
        });
  
        setBranchDataMap(dataMap);
      } else {
        throw new Error('Failed to fetch branch data.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to fetch branch data.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };
  

// Adjust `handleSelectionChange` to make the `add-or-update` API call
const handleSelectionChange = async ({ runSize, branchSize, selectedOption }: SelectionChangeData) => {
  try {
    const branchData = {
      run_size: runSize,
      branch_size: branchSize,
      comp_name: selectedOption,
    };
    const response = await api.post(configApi.API_URL.branch.addOrUpdate, {
      specId: specId,
      branchData,
    });

    if (response.data.success) {
      showToast({ message: response.data.message, type: 'success' });
    } else {
      throw new Error(response.data.message || 'Failed to add or update branch.');
    }
  } catch (error) {
    const apiError = error as ApiError;
    const errorMessage = apiError.response?.data?.error || 'Failed to add or update branch.';
    showToast({ message: errorMessage, type: 'error' });
  }
};


  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <l-grid size="60" speed="1.5" color="black"></l-grid>
      </div>
    );
  }

  const Instructions: React.FC = () => {
    return (
      <div className="bg-gray-100 px-4 py-3 text-sm text-gray-500 flex items-center justify-center space-x-4">
        <span><strong>Component Mapping :</strong></span>
        <span>TEE: T</span>
        <span>WOL: W</span>
        <span>SOL: S</span>
        <span>TOL: O</span>
        <span>P2P: P</span>
        <span>P2R: R</span>
        <span>HFC: H</span>
        <span>SWL: L</span>
        <span>INT: I</span>
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center" ref={tableRef}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: tableWidth }}>
      <Instructions/>
        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {branchSizes.map((branchSize, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                >
                  <td 
                    className="sticky left-0 bg-gray-50 w-16 px-2 py-2 font-medium text-gray-700 border-r border-gray-100 text-center" 
                    style={{ zIndex: 40 }}
                  >
                    {branchSize}
                  </td>
                  {runSizes.map((runSize, colIndex) => {
                      const key = `${runSize}-${branchSize}`;
                      const preselectedValue = branchDataMap[key] || ''; // Get the preselected value if it exists
                      
                      return (
                        <td key={colIndex} className={`w-24 px-2 py-1.5 relative ${rowIndex - 1 < colIndex ? "bg-white" : "bg-gray-50/80"}`}>
                          {rowIndex - 1 >= colIndex ? (
                            <div className="flex items-center justify-center">
                              <span className="text-gray-400">×</span>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <CustomSelect 
                                id={`select-${rowIndex}-${colIndex}`}
                                runSize={runSize}
                                branchSize={branchSize}
                                onSelectionChange={handleSelectionChange}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                                preselectedValue={preselectedValue} // Pass preselectedValue here
                              />
                            </div>
                          )}
                        </td>
                      );
                    })}
                </tr>
              )).reverse()}
              <tr className="bg-gray-50">
                <td 
                  className="sticky left-0 bg-gray-50 w-16 px-2 py-2 border-r border-gray-100 text-center"
                  style={{ zIndex: 40 }}
                ></td>
                {runSizes.map((size, index) => (
                  <td 
                    key={index} 
                    className="w-24 px-2 py-2 font-medium text-gray-700 text-center"
                  >
                    {size}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BranchTable;