import React, { useState, useRef, useEffect } from 'react';
import { grid } from 'ldrs'
import { ApiError, Size, SizeRange } from '../../utils/interface';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const options: Option[] = [
    { value: 'T', label: 'T' },
    { value: 'W', label: 'W' },
    { value: 'S', label: 'S' },
    { value: 'O', label: 'O' },
    { value: 'P', label: 'P' },
    { value: 'R', label: 'R' },
    { value: 'H', label: 'H' },
    { value: 'L', label: 'L' },
    { value: 'I', label: 'I' },
  ];

  const filteredOptions = options.filter(option => 
    option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isOpen = activeDropdown === id;

  const updateDropdownPosition = () => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200;
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
    if (isOpen) {
      searchInputRef.current?.focus();
      updateDropdownPosition();
      const handleScroll = () => {
        updateDropdownPosition();
      };

      let element = buttonRef.current?.parentElement;
      while (element) {
        element.addEventListener('scroll', handleScroll, true);
        element = element.parentElement;
      }

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);

      // Focus search input when dropdown opens

      return () => {
        let element = buttonRef.current?.parentElement;
        while (element) {
          element.removeEventListener('scroll', handleScroll, true);
          element = element.parentElement;
        }
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    } else {
      setSearchTerm(''); // Clear search when dropdown closes
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
        ) {
          setActiveDropdown(null);
        }
      };

      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [isOpen, setActiveDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setActiveDropdown(null);
    } else if (e.key === 'Enter') {
      if (filteredOptions.length > 0) {
        handleSelection(filteredOptions[0].value);
      } else if (searchTerm.trim() !== '') {
        handleSelection(searchTerm.trim());
      }
    }
  };

  const handleSelection = (value: string) => {
    const selectedOptionLabel = value ? options.find(opt => opt.value === value)?.label ?? value : 'Select';
    setSelectedValue(selectedOptionLabel);
    setActiveDropdown(null);
    setSearchTerm('');

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
          ref={dropdownRef}
          className="fixed w-20 bg-white rounded-md shadow-lg border overflow-hidden"
          style={{ 
            zIndex: 9999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="p-1 border-b">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown} // Add keydown listener
              className="w-full px-1 py-0.5 text-sm border rounded focus:outline-none focus:border-blue-500"
              placeholder="Search..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelection(option.value)}
                className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {option.label}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-2 py-1 text-sm text-gray-500">
                No matches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const BranchTable: React.FC<{ specId: string }> = ({ specId }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [,setSizes] = useState<Size[]>([]);
  const [matchingSizes,setMatchingSizes] = useState<Size[]>([]);
  const [runSizes, setRunSizes] = useState<number[]>([]);
  const [branchSizes, setBranchSizes] = useState<number[]>([]);
  const [tableWidth, setTableWidth] = useState("auto");
  const [branchDataMap, setBranchDataMap] = useState<Record<string, string>>({});
  const [isSizeInInches, setIsSizeInInches] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!specId){
      showToast({message:"Select Spec ID First",type:"info"})
      return;
    }
    const projectId = localStorage.getItem("currentProjectId");
    fetchSizes(projectId!);
    // fetchSizeRange();
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


  const fetchSizes = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await api.post(configApi.API_URL.sizes.getall, {
        projectId,
      });

      if (response?.data?.success) {
        const sizesWithKeys = response.data.sizes
          .map((size: Size) => ({
            ...size,
            key: size.code,
            c_code: size.c_code,
            size_mm:size.size_mm
          }))
          .sort((a: { size_mm: number }, b: { size_mm: number }) => a.size_mm - b.size_mm);
          // console.log(sizesWithKeys);
          fetchSizeRange(sizesWithKeys);
        setSizes(sizesWithKeys);
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({
        message: apiError.response?.data?.error || "Error fetching sizes.",
        type: "error",
      });
    }
  };

  const parseInchSize = (sizeInch:string) => {
    // Handle whole numbers and fractions
    if (sizeInch.includes('/')) {
      const [whole, frac] = sizeInch.split(' ');
      const [numerator, denominator] = frac ? frac.split('/') : whole.split('/');
      return whole && frac 
        ? parseInt(whole) + parseInt(numerator) / parseInt(denominator)
        : parseInt(numerator) / parseInt(denominator);
    }
    return parseFloat(sizeInch);
  };

  const fetchSizeRange = async (sizesWithKeys:Size[]) => {
    try {
      const response = await api.post(configApi.API_URL.sizeranges.getall, { specId });
      if (response.data.success) {
        const sizeValues : string[] = response.data.sizeranges.map((range:SizeRange) => range.odValue);
        setMatchingSizes(sizesWithKeys.filter(size => sizeValues.includes(size.size_mm)))
        // console.log(sizeValues)
        setRunSizes(
          sizeValues
            .map(value => parseFloat(value))
            .filter(value => !isNaN(value))
            .sort((a, b) => a - b)
        );
        
        setBranchSizes(
          sizeValues
            .map(value => parseFloat(value))
            .filter(value => !isNaN(value))
            .sort((a, b) => a - b)
        );
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
        response.data.brancheData.forEach((item: {run_size:number,branch_size:number,comp_name:string}) => {
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
  
// Toggle switch handler
const handleSizeToggle = () => {
  setIsSizeInInches(!isSizeInInches);
 
  if (!isSizeInInches) {
    // Switch to Inches
    const inchSizes = matchingSizes.map(size => parseInchSize(size.size_inch.replace('"', ''))).sort((a, b) => a - b);
    setRunSizes(inchSizes);
    setBranchSizes(inchSizes);
  } else {
    // Switch back to OD
    const odSizes = matchingSizes.map(size => parseFloat(size.size_mm)).sort((a, b) => a - b);
    setRunSizes(odSizes);
    setBranchSizes(odSizes);
  }
 }; 


const handleSelectionChange = async ({ runSize, branchSize, selectedOption }: SelectionChangeData) => {
  try {

    if(selectedOption === "Select"){
      return;
    }
    // Find the OD value from matchingSizes based on the current size
    const runSizeOD = isSizeInInches 
      ? matchingSizes.find(size => parseInchSize(size.size_inch.replace('"', '')) === runSize)?.size_mm 
      : runSize;
    
    const branchSizeOD = isSizeInInches 
      ? matchingSizes.find(size => parseInchSize(size.size_inch.replace('"', '')) === branchSize)?.size_mm 
      : branchSize;

    const branchData = {
      run_size: runSizeOD,
      branch_size: branchSizeOD,
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

  

  // Size Toggle Component
  const SizeToggle: React.FC = () => {
    return (
      <div className="flex justify-end mb-2 mr-1  items-center">
        <span className="mr-2 text-sm text-gray-600">
          {isSizeInInches ? 'Inches' : 'MM'}
        </span>
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isSizeInInches}
            onChange={handleSizeToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center" ref={tableRef}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: tableWidth }}>
        <SizeToggle/>
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