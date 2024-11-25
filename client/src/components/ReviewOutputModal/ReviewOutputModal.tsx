import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

// Type definitions
interface ReviewOutputModalProps {
  specId: string | null;
  onClose: () => void;
  isOpen: boolean;
  data: any[];
}

interface TableDataType {
  spec: string;
  compType: string;
  shortCode: string;
  itemCode: string;
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
  specId, 
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
      render: (value) => value.toFixed(2)
    },
    {
      title: 'Size 2 (Inch)',
      dataIndex: 'size2Inch',
      key: 'size2Inch',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value.toFixed(2)
    },
    {
      title: 'Size 1 (MM)',
      dataIndex: 'size1MM',
      key: 'size1MM',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value.toFixed(2)
    },
    {
      title: 'Size 2 (MM)',
      dataIndex: 'size2MM',
      key: 'size2MM',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value.toFixed(2)
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
        <button
          className="absolute top-1 right-1 text-gray-600 hover:text-gray-900 transition-colors z-10"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content', y: 'calc(90vh - 100px)' }}
          size="small"
          bordered
          tableLayout="fixed"
          className="w-full"
          rowKey={(record) => record.itemCode}
        />
      </div>
    </div>
  );
};

export default ReviewOutputModal;