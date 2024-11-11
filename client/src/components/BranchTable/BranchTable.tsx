import React, { useState, useEffect } from 'react';
import { Table, Select, Spin } from 'antd';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from "../../utils/api/config";
import showToast from '../../utils/toast';
import { ApiError } from '../../utils/interface';

const BranchTable = ({ specId }: { specId: string }) => {
  const [runSizes, setRunSizes] = useState([]);
  const [branchSizes, setBranchSizes] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSizeRange();
  }, []);

  const fetchSizeRange = async () => {
    setLoading(true);
    try {
      const response = await api.post(configApi.API_URL.sizeranges.getall, { specId });
      if (response.data.success) {
        const sizeValues = response.data.sizeranges.map((range) => range.sizeValue);
        setRunSizes(sizeValues);
        setBranchSizes(sizeValues);
        generateGridData(sizeValues);
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

  const generateGridData = (sizeValues) => {
    const gridData = sizeValues.map((branchSize, rowIndex) => ({
      key: rowIndex,
      branchSize,
      ...sizeValues.reduce((acc, runSize, colIndex) => {
        acc[`col${colIndex}`] = branchSize > runSize ? 'greyed' : 'select';
        return acc;
      }, {}),
    }));
    setData(gridData);
  };

  const renderCell = (value) => {
    if (value === 'greyed') {
      return <div style={{ backgroundColor: '#ccc' }}>X</div>;
    }
    return (
      <Select
        options={[{ value: 'T' }, { value: 'W' }]} // Add more options as needed
        style={{ width: '100%' }}
        placeholder="Select"
      />
    );
  };

  const columns = [
    {
      title: (""
      ),
      dataIndex: 'branchSize',
      key: 'branchSize',
      fixed: 'left',
      render: (branchSize) => <div>{branchSize}</div>,
    },
    ...runSizes.map((runSize, colIndex) => ({
      title: runSize,
      dataIndex: `col${colIndex}`,
      key: `col${colIndex}`,
      render: (value, record, rowIndex) => renderCell(value, rowIndex, colIndex),
    })),
  ];

  return (
    <div>
      {loading ? (
        <Spin />
      ) : (
        <>
        <div className="flex">
          {/* Vertical "Branch PIPE Size" on the left */}
          <div className=" flex items-center w-6 mr-2">
            <div className=" ml-[-60px] text-center font-bold transform -rotate-90 whitespace-nowrap">
              Branch PIPE Size
            </div>
          </div>
      
          {/* Centered "Run PIPE Size" at the top */}
          <div className="w-full">
            <div className="text-center font-bold mb-4">Run PIPE Size</div>
            <Table
              dataSource={data}
              columns={columns}
              pagination={false}
              scroll={{ x: true }}
              bordered
            />
          </div>
        </div>
      </>
      
      )}
    </div>
  );
};

export default BranchTable;
