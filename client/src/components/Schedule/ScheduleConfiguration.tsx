import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from '../../utils/api/config'; // API config for URLs
import showToast from '../../utils/toast';

interface Schedule {
  key: string;
  sch1_sch2: string;
  code: string;
  schDesc: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: Schedule;
  editable: boolean;
  dataIndex: keyof Schedule;
}

const ScheduleConfiguration: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newSchDesc, setNewSchDesc] = useState('');
  const [newSch, setNewSch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null); // Track the column being edited
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [, setFormSubmitted] = useState(false);

  useEffect(() => {
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId) {
      setCurrentProjectId(projectId);
    } else {
      showToast({ message: 'No current project ID found in local storage.', type: 'error' });
    }
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const payload = {
        projectId: currentProjectId,
      };

      const response = await api.post(configApi.API_URL.schedules.getall, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data && response.data.success) {
        const schedulesWithKeys = response.data.schedules.map((schedule: any) => ({
          ...schedule,
          key: schedule.id,
        }));
        setSchedules(schedulesWithKeys);
      } else {
        showToast({ message: 'Failed to fetch schedules.', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Error fetching schedules.';
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    setFormSubmitted(true);

    if (!newCode || !newSchDesc || !newSch) {
      message.error('Schedule, Code and Description are required.');
      return;
    }

    try {
      if (!currentProjectId) {
        message.error('No current project ID available.');
        return;
      }

      const newSchedule: Schedule = {
        key: Math.random().toString(36).substring(7),
        sch1_sch2: newSch,
        code: newCode,
        schDesc: newSchDesc,
      };

      const payload = {
        projectId: currentProjectId,
        schedules: [
          {
            sch1_sch2: newSchedule.sch1_sch2,
            code: newSchedule.code,
            schDesc: newSchedule.schDesc,
          },
        ],
      };

      const response = await api.post(configApi.API_URL.schedules.addorupdate, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data.success) {
        setSchedules([...schedules, newSchedule]);
        setNewCode('');
        setNewSchDesc('');
        setNewSch('');
        setFormSubmitted(false);
        message.success('Schedule added successfully');
      } else {
        throw new Error('Failed to add schedule.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to add schedule.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleEditSchedule = async (key: string, sch1_sch2: string, code: string, schDesc: string) => {
    if (!code || !schDesc) {
      message.error('Code and Description cannot be empty.');
      return;
    }

    if (!currentProjectId) {
      message.error('No current project ID available.');
      return;
    }

    const originalSchedules = [...schedules];
    const updatedSchedules = schedules.map((schedule) =>
      schedule.key === key ? { ...schedule, code, schDesc } : schedule
    );
    setSchedules(updatedSchedules);
    setEditingKey(null);
    setEditingColumn(null); // Clear the editing column state

    const payload = {
      projectId: currentProjectId,
      schedules: [
        {
          sch1_sch2,
          code,
          schDesc,
        },
      ],
    };

    try {
      const response = await api.post(`${configApi.API_URL.schedules.addorupdate}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data.success) {
        message.success('Schedule updated successfully');
      } else {
        throw new Error('Failed to update schedule.');
      }
    } catch (error) {
      setSchedules(originalSchedules);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to update schedule.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    children,
    record,
    dataIndex,
    ...restProps
  }) => {
    const inputValue = record ? record[dataIndex] : '';
    const [localInputValue, setLocalInputValue] = useState(inputValue);
  
    const handleBlur = () => {
      if (localInputValue === inputValue) {
        setEditingKey(null);
        setEditingColumn(null);
        return;
      }
  
      if (dataIndex === 'code' || dataIndex === 'schDesc') {
        const sch1_sch2 = record?.sch1_sch2;
        handleEditSchedule(
          record?.key,
          sch1_sch2,
          dataIndex === 'code' ? localInputValue : record?.code,
          dataIndex === 'schDesc' ? localInputValue : record?.schDesc
        );
      }
    };
  
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleBlur();
      }
    };
  
    useEffect(() => {
      setLocalInputValue(inputValue);
    }, [inputValue]);
  
    return (
      <td {...restProps}>
        {editable ? (
          <Input
            value={localInputValue}
            onChange={(e) => setLocalInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            style={{ marginBottom: 8 }}
          />
        ) : (
          <div onDoubleClick={() => {
            setEditingKey(record?.key);
            setEditingColumn(dataIndex);
          }}>
            {children}
          </div>
        )}
      </td>
    );
  };
  

  const columns: ColumnsType<Schedule> = [
    {
      title: (
        <div onDoubleClick={() => handleSort('sch1_sch2')}>
          Schedule 1/ Schedule 2
        </div>
      ),
      dataIndex: 'sch1_sch2',
      key: 'sch1_sch2',
    },
    {
      title: (
        <div onDoubleClick={() => handleSort('code')}>
          Code
        </div>
      ),
      dataIndex: 'code',
      key: 'code',
      onCell: (record: Schedule): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'code', // Only allow editing on the selected cell
        dataIndex: 'code',
      }),
    },
    {
      title: (
        <div onDoubleClick={() => handleSort('schDesc')}>
          Description
        </div>
      ),
      dataIndex: 'schDesc',
      key: 'schDesc',
      onCell: (record: Schedule): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'schDesc', // Only allow editing on the selected cell
        dataIndex: 'schDesc',
      }),
    },
    
  ];

  useEffect(() => {
    fetchSchedules();
  }, [currentProjectId]);

  const handleSort = (columnKey: keyof Schedule) => {
    if (sortOrder === 'ascend') {
      setSortOrder('descend');
    } else {
      setSortOrder('ascend');
    }
    setSchedules((prevSchedules) =>
      [...prevSchedules].sort((a, b) =>
        sortOrder === 'ascend'
          ? a[columnKey].localeCompare(b[columnKey])
          : b[columnKey].localeCompare(a[columnKey])
      )
    );
  };

  return (
    <div>
      <h1>Schedule Configuration</h1>

      {/* Form section */}
      <Form layout="inline" style={{ marginBottom: '20px', marginTop: '10px' }}>
        <Form.Item style={{ marginRight: '10px' }}>
          <Input
            value={newSch}
            onChange={(e) => setNewSch(e.target.value)}
            placeholder="Schedule 1/Schedule 2 Enter schedule"
            style={{ width: '180px' }} // Adjust width to match the required size
          />
        </Form.Item>

        <Form.Item style={{ marginRight: '10px' }}>
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Enter code"
            style={{ width: '180px' }} // Adjust width to match the required size
          />
        </Form.Item>

        <Form.Item style={{ marginRight: '10px' }}>
          <Input
            value={newSchDesc}
            onChange={(e) => setNewSchDesc(e.target.value)}
            placeholder="Enter description"
            style={{ width: '180px' }} // Adjust width to match the required size
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleAddSchedule}>
            Add Schedule
          </Button>
        </Form.Item>
      </Form>


      {/* Table section */}
      <Table
        dataSource={schedules}
        columns={columns}
        loading={loading}
        pagination={false}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
      />
    </div>
  );
};

export default ScheduleConfiguration;
