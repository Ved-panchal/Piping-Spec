import React, { useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';

// Type definitions
interface ReviewOutputModalProps {
  // specId: string | null;
  onClose: () => void;
  isOpen: boolean;
  data: any[];
}

interface TableDataType {
  spec: string;
  compType: string;
  shortCode: string;
  itemCode: string;
  cItemCode:string;
  itemLongDesc: string;
  itemShortDesc: string;
  size1Inch: number;
  size2Inch: number;
  size1MM: number;
  size2MM: number;
  sch1: string;
  sch2: string;
  rating: string;
  unitWt: number;
  gType: string;
  sType: string;
  catRef: string;
}

const ReviewOutputModal: React.FC<ReviewOutputModalProps> = ({  
  onClose, 
  isOpen,
  data 
}) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Review Output");
    XLSX.writeFile(workbook, "review_output.xlsx");
  };

  const columns: ColumnsType<TableDataType> = [
    {
      title: 'Spec',
      dataIndex: 'spec',
      key: 'spec',
      width: 100,
      fixed: 'left',
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Comp Type',
      dataIndex: 'compType',
      key: 'compType',
      width: 120,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Short Code',
      dataIndex: 'shortCode',
      key: 'shortCode',
      width: 100,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Client Item Code',
      dataIndex: 'cItemCode',
      key: 'cItemCode',
      width: 120,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Item Long Desc',
      dataIndex: 'itemLongDesc',
      key: 'itemLongDesc',
      width: 200,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Item Short Desc',
      dataIndex: 'itemShortDesc',
      key: 'itemShortDesc',
      width: 150,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Size 1 (Inch)',
      dataIndex: 'size1Inch',
      key: 'size1Inch',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'Size 2 (Inch)',
      dataIndex: 'size2Inch',
      key: 'size2Inch',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'Size 1 (MM)',
      dataIndex: 'size1MM',
      key: 'size1MM',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'Size 2 (MM)',
      dataIndex: 'size2MM',
      key: 'size2MM',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'SCH 1',
      dataIndex: 'sch1',
      key: 'sch1',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'SCH 2',
      dataIndex: 'sch2',
      key: 'sch2',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Unit Wt',
      dataIndex: 'unitWt',
      key: 'unitWt',
      width: 80,
      className: 'font-semibold text-xs',
      render: (value) => value.toFixed(2)
    },
    {
      title: 'G Type',
      dataIndex: 'gType',
      key: 'gType',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'S Type',
      dataIndex: 'sType',
      key: 'sType',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Cat Ref',
      dataIndex: 'catRef',
      key: 'catRef',
      width: 100,
      ellipsis: true,
      className: 'font-semibold text-xs'
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-[98vw] max-w-[100vw] max-h-[90vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Review Output</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportToExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="mr-2" size={20} />
              Export to Excel
            </button>
            <button
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content', y: 'calc(90vh - 150px)' }}
          size="small"
          bordered
          tableLayout="fixed"
          className="w-full"
          rowKey={(record) => record.itemCode}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default ReviewOutputModal;