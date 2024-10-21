import React, { useState, useEffect } from 'react';
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

const ScheduleConfiguration: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newSchDesc, setNewSchDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null); // Sorting order state
  const [formSubmitted, setFormSubmitted] = useState(false); // Flag to control validation

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
          key: schedule.id, // Using id as key for table row
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
    setFormSubmitted(true); // Set the flag to true when submitting the form

    if (!newCode || !newSchDesc) {
      message.error('Both Code and Description are required.');
      return;
    }

    try {
      if (!currentProjectId) {
        message.error('No current project ID available.');
        return;
      }

      const newSchedule: Schedule = {
        key: Math.random().toString(36).substring(7),
        sch1_sch2: newCode,
        code: newCode,
        schDesc: newSchDesc,
      };

      const payload = {
        projectId: currentProjectId,
        sch1_sch2: newSchedule.sch1_sch2,
        code: newSchedule.code,
        schDesc: newSchedule.schDesc,
      };

      const response = await api.post(configApi.API_URL.schedules.addorupdate, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data.success) {
        setSchedules([...schedules, newSchedule]);
        setNewCode('');
        setNewSchDesc('');
        setFormSubmitted(false); // Reset the flag after submission
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

    const currentSchedule = schedules.find((schedule) => schedule.key === key);
    if (!currentSchedule) {
      message.error('Schedule not found');
      return;
    }

    const updatedSchedules = schedules.map((schedule) =>
      schedule.key === key ? { ...schedule, code, schDesc } : schedule
    );
    setSchedules(updatedSchedules);
    setEditingKey(null);

    const payload = {
      projectId: currentProjectId,
      sch1_sch2,
      code,
      schDesc,
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
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to update schedule.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  const EditableCell: React.FC<any> = ({
    editable,
    children,
    record,
    dataIndex,
    ...restProps
  }) => {
    // Ensure record and dataIndex are valid before accessing
    const inputValue = record ? record[dataIndex] : '';
    const [localInputValue, setLocalInputValue] = useState(inputValue);
  
    const handleBlur = () => {
      if (dataIndex === 'code' || dataIndex === 'schDesc') {
        const sch1_sch2 = record?.sch1_sch2; // Optional chaining
        handleEditSchedule(
          record?.key,
          sch1_sch2,
          dataIndex === 'code' ? localInputValue : record?.code,
          dataIndex === 'schDesc' ? localInputValue : record?.schDesc
        );
      }
    };
  
    useEffect(() => {
      // Update local input value when record changes
      setLocalInputValue(inputValue);
    }, [inputValue]);
  
    return (
      <td {...restProps}>
        {editable ? (
          <Input
            value={localInputValue}
            onChange={(e) => setLocalInputValue(e.target.value)}
            onBlur={handleBlur}
            style={{ marginBottom: 8 }}
          />
        ) : (
          <div onDoubleClick={() => setEditingKey(record?.key)}>{children}</div>
        )}
      </td>
    );
  };
  

  const handleSort = (key: keyof Schedule) => {
    let sortedSchedules = [...schedules];
    if (sortOrder === 'ascend') {
      sortedSchedules = sortedSchedules.sort((a, b) => (a[key] > b[key] ? 1 : -1));
      setSortOrder('descend');
    } else {
      sortedSchedules = sortedSchedules.sort((a, b) => (a[key] < b[key] ? 1 : -1));
      setSortOrder('ascend');
    }
    setSchedules(sortedSchedules);
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
      editable: true,
      onCell: (record: Schedule) => ({
        record,
        editable: editingKey === record.key,
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
      editable: true,
      onCell: (record: Schedule) => ({
        record,
        editable: editingKey === record.key,
        dataIndex: 'schDesc',
      }),
    },
  ];

  useEffect(() => {
    fetchSchedules();
  }, [currentProjectId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Schedule Configuration</h2>
      <Form layout="inline" style={{ marginBottom: '20px', marginTop: '10px' }}>
        <Form.Item
          validateStatus={formSubmitted && !newCode ? 'error' : ''}
          help={formSubmitted && !newCode && 'Code is required.'}
        >
          <Input
            placeholder="Enter Code"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          validateStatus={formSubmitted && !newSchDesc ? 'error' : ''}
          help={formSubmitted && !newSchDesc && 'Description is required.'}
        >
          <Input
            placeholder="Enter Description"
            value={newSchDesc}
            onChange={(e) => setNewSchDesc(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleAddSchedule}>
            Add Schedule
          </Button>
        </Form.Item>
      </Form>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={schedules}
        columns={columns}
        pagination={false}
        loading={loading}
        rowClassName={'editable-row'}
        style={{ width: '100%', tableLayout: 'auto' }}
      />
    </div>
  );
};

export default ScheduleConfiguration;
