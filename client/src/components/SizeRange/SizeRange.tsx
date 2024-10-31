import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Button, Form, message, Select, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';
import showToast from '../../utils/toast';
import { Trash2 } from 'lucide-react';
import deleteWithBody from '../../utils/api/DeleteAxios';
import ConfirmationModal from '../ConfirmationDeleteModal/CornfirmationModal';

const { Option } = Select;

interface OptionType {
  value: string;
  label: string;
}

interface SizeRange {
  key: number | string;
  sizeValue: string;
  sizeCode: string;
  scheduleValue: string;
  scheduleCode: string;
}

interface DeleteResponse {
  data: {
    success: boolean;
    message: string;
    error?: string;
  };
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

interface EditableCellProps extends TdHTMLAttributes<any> {
  record: SizeRange;
  editable: boolean;
  dataIndex: keyof SizeRange;
}

const SizeRange: React.FC<{ specId: string }> = ({ specId }) => {
  const [sizeRanges, setSizeRanges] = useState<SizeRange[]>([]);
  const [newSize, setNewSize] = useState<string | undefined>();
  const [newSchedule, setNewSchedule] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [btnloading, setBtnLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | number | null>(null);
  const [sizeOptions, setSizeOptions] = useState<OptionType[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<OptionType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sizeRangeToDelete, setSizeRangeToDelete] = useState<SizeRange | null>(null);

  useEffect(() => {
    if (!specId) {
      showToast({ message: "Please Select Spec First", type: "error" });
      return;
    }
    fetchSizeRange();
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId) {
      fetchSizeAndScheduleOptions(projectId);
    }
  }, [specId]);

  const fetchSizeAndScheduleOptions = async (projectId: string) => {
    try {
      const payload = { projectId };
      const sizeResponse = await api.post(configApi.API_URL.sizes.getall, payload);
      const scheduleResponse = await api.post(configApi.API_URL.schedules.getall, payload);

      if (sizeResponse.data.success && scheduleResponse.data.success) {
        const sizes = sizeResponse.data.sizes.map((size: any) => ({
          value: size.code,
          label: size.size1_size2,
        })).sort((a: { label: string; }, b: { label: any; }) => a.label.localeCompare(b.label));

        const schedules = scheduleResponse.data.schedules.map((schedule: any) => ({
          value: schedule.code,
          label: schedule.sch1_sch2,
        })).sort((a: { label: string; }, b: { label: any; }) => a.label.localeCompare(b.label));

        setSizeOptions(sizes);
        setScheduleOptions(schedules);
      } else {
        throw new Error('Failed to fetch options');
      }
    } catch (error) {
      showToast({ message: 'Failed to fetch dropdown options.', type: 'error' });
    }
  };

  const fetchSizeRange = async () => {
    try {
      setLoading(true);
      const response = await api.post(configApi.API_URL.sizeranges.getall, { specId });
      if (response.data.success) {
        console.log(response.data.sizeranges);
        const sizeRangesWithKey = response.data.sizeranges.map((range: any) => ({
          key: range.id,
          sizeValue: range.sizeValue,
          sizeCode: range.sizeCode,
          scheduleValue: range.scheduleValue,
          scheduleCode: range.scheduleCode,
        }));
        setSizeRanges(sizeRangesWithKey);
      } else {
        throw new Error('Failed to fetch Size Ranges.');
      }
    } catch (error) {
      showToast({ message: 'Failed to fetch Size Ranges.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSizeRange = async () => {
    if (!newSize || !newSchedule) {
      message.error('Size and Schedule are required.');
      return;
    }

    const newSizeRange: SizeRange = {
      key: Math.random().toString(36).substring(2),
      sizeValue: newSize,
      sizeCode: newSize,
      scheduleValue: newSchedule,
      scheduleCode: newSchedule,
    };

    const payload = {
      sizeCode: newSize,
      scheduleCode: newSchedule,
      specId,
    };

    setBtnLoading(true);
    try {
      const response = await api.post(configApi.API_URL.sizeranges.create, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        setSizeRanges((prev) => [...prev, newSizeRange]);
        setNewSize(undefined);
        setNewSchedule(undefined);
        message.success('Size range added successfully');
        fetchSizeRange();
      } else {
        throw new Error('Failed to add Size Range.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to add Size Range.';
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteSizeRange = async (key: number | string) => {
    try {
      await deleteWithBody<DeleteResponse>(`${configApi.API_URL.sizeranges.delete}`, { id: key });
      setSizeRanges((prev) => prev.filter((sizeRange) => sizeRange.key !== key));
      setIsModalOpen(false);
      message.success('Size range deleted successfully');
    } catch (error) {
      showToast({ message: 'Failed to delete size range.', type: 'error' });
    }
  };

  const handleEdit = async (key: number | string, dataIndex: keyof SizeRange, value: string) => {
    const updatedSizeRange = sizeRanges.find(range => range.key === key);
    if (updatedSizeRange) {
      const payload = {
        id: key,
        sizeCode: dataIndex === 'sizeValue' ? value : updatedSizeRange.sizeCode,
        scheduleCode: dataIndex === 'scheduleValue' ? value : updatedSizeRange.scheduleCode,
        specId,
      };

      try {
        const response = await api.put(configApi.API_URL.sizeranges.update, payload);
        if (response.data.success) {
          setSizeRanges(prev =>
            prev.map(range =>
              range.key === key ? { ...range, [dataIndex]: value } : range
            )
          );
          message.success('Size range updated successfully');
        } else {
          throw new Error('Failed to update Size Range.');
        }
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.error || 'Failed to update Size Range.';
        // showToast({ message: errorMessage, type: 'error' });
        throw new Error(errorMessage);
      }
    }
  };

  const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    children,
    record,
    dataIndex,
    ...restProps
  }) => {
    const [localInputValue, setLocalInputValue] = useState(record ? record[dataIndex] : "");
    const [initialValue, setInitialValue] = useState(localInputValue); // Store initial value
    const [isEditing, setIsEditing] = useState(false);
  
    // Sync local input value with record on record/dataIndex change
    useEffect(() => {
      if (record && record[dataIndex] !== localInputValue) {
        setLocalInputValue(record[dataIndex] as string);
      }
    }, [record, dataIndex]);
  
    const handleBlur = async () => {
      if (record && record.key && localInputValue !== initialValue) {
        try {
          await handleEdit(record.key, dataIndex, localInputValue as string);
          setInitialValue(localInputValue);
        } catch (error) {
          setLocalInputValue(initialValue);
          showToast({ message: 'Failed to update Size range.', type: 'error' });
        }
      }
      setIsEditing(false); // Exit edit mode
    };
  
    const handleDoubleClick = () => {
        console.log("Local value",localInputValue as string);
        console.log("initial value",initialValue as string);
      setEditingKey(record?.key);
      setIsEditing(true);
      setInitialValue(localInputValue);
    };
  
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleBlur();
      }
    };
  
    return (
      <td {...restProps}>
        {isEditing ? (
          dataIndex === 'sizeValue' || dataIndex === 'scheduleValue' ? (
            <Select
              value={localInputValue}
              onChange={(value) => setLocalInputValue(value)}
              onBlur={handleBlur}
              autoFocus
              style={{ width: '100%' }}
            >
              {(dataIndex === 'sizeValue' ? sizeOptions : scheduleOptions).map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          ) : (
            <Input
              value={localInputValue}
              onChange={(e) => setLocalInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              autoFocus
              style={{ width: '100%' }}
            />
          )
        ) : (
          <div onDoubleClick={handleDoubleClick}>
            {children}
          </div>
        )}
      </td>
    );
  };
  
  
  

  const columns: ColumnsType<SizeRange> = [
    {
      title: 'Size',
      dataIndex: 'sizeValue',
      key: 'sizeValue',
      onCell: (record: SizeRange): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        dataIndex: 'sizeValue',
      }),
    },
    {
      title: 'Schedule',
      dataIndex: 'scheduleValue',
      key: 'scheduleValue',
      onCell: (record: SizeRange): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        dataIndex: 'scheduleValue',
      }),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Trash2
          size={17}
          style={{ cursor: 'pointer', color: 'red' }}
          onClick={() => {
            setSizeRangeToDelete(record);
            setIsModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <h1>Size Range</h1>
      <Form layout="inline" style={{ marginBottom: '20px' }}>
        <Form.Item>
          <Select
            value={newSize}
            onChange={(value) => setNewSize(value)}
            placeholder="Select Size"
            style={{ width: '180px' }}
          >
            {sizeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Select
            value={newSchedule}
            onChange={(value) => setNewSchedule(value)}
            placeholder="Select Schedule"
            style={{ width: '180px' }}
          >
            {scheduleOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleAddSizeRange}
            loading={btnloading}
          >
            Add Size Range
          </Button>
        </Form.Item>
      </Form>
      <div >
            <Table
            components={{
                body: {
                    cell: EditableCell,
                    },
                }}
                dataSource={sizeRanges}
                columns={columns}
                pagination={false}
                loading={loading}
            />
        </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => sizeRangeToDelete && handleDeleteSizeRange(sizeRangeToDelete.key)}
        title="Confirm Delete"
        message={`Are you sure you want to delete size range: ${sizeRangeToDelete?.sizeValue}?`}
      />
    </div>
  );
};

export default SizeRange;