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
};

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  runSize, 
  branchSize, 
  onSelectionChange, 
  activeDropdown,
  setActiveDropdown,
  id 
}) => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [dropdownPosition, setDropdownPosition] = useState<Position>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const options: Option[] = [
    { value: '', label: 'Select' },
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  const isOpen = activeDropdown === id;

  const updateDropdownPosition = () => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
  };

  useEffect(() => {
    updateDropdownPosition();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        requestAnimationFrame(updateDropdownPosition);
      };

      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveDropdown]);

  const handleSelection = (value: string) => {
    setSelectedValue(value);
    setActiveDropdown(null);
    onSelectionChange({
      runSize,
      branchSize,
      selectedOption: value ? options.find(opt => opt.value === value)?.label ?? 'Select' : 'Select'
    });
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setActiveDropdown(isOpen ? null : id)}
        className="relative min-w-20 px-2 py-1 text-left bg-white border rounded-md shadow-sm text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {selectedValue ? options.find(opt => opt.value === selectedValue)?.label : 'Select'}
        <span className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
          <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      
      {isOpen && dropdownPosition.top != 0 && (
        <div 
          className="fixed w-20 bg-white rounded-md shadow-lg border" 
          style={{ 
            zIndex: 9999,
            top: `${dropdownPosition.top + 2}px`,
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
  const [loading, setLoading] = useState(true);
  const [runSizes, setRunSizes] = useState<number[]>([]);
  const [branchSizes, setBranchSizes] = useState<number[]>([]);
  const [tableWidth, setTableWidth] = useState("auto");
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSizeRange();
  }, [specId]);

  useEffect(() => {
    const updateTableWidth = () => {
      if (tableRef.current) {
        const containerWidth = tableRef.current.offsetWidth;
        const minWidth = Math.min(containerWidth, 1200); // Max width of 1200px
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
        const sizeValues = response.data.sizeranges.map((range:SizeRange) => range.sizeValue);
        setRunSizes(sizeValues);
        setBranchSizes(sizeValues);
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

  const handleSelectionChange = ({ runSize, branchSize, selectedOption }: SelectionChangeData) => {
    console.log({
      runSize,
      branchSize,
      selectedOption
    });
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <l-grid size="60" speed="1.5" color="black"></l-grid>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center" ref={tableRef}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: tableWidth }}>
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
                  {runSizes.map((runSize, colIndex) => (
                    <td
                      key={colIndex}
                      className={`w-24 px-2 py-1.5 relative ${
                        rowIndex-1 < colIndex 
                          ? "bg-white" 
                          : "bg-gray-50/80"
                      }`}
                    >
                      {rowIndex-1 >= colIndex ? (
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
                          />
                        </div>
                      )}
                    </td>
                  ))}
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