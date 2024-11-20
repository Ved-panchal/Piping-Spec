import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, message,Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from '../../utils/api/config'; // API config for URLs
import showToast from '../../utils/toast';
import { ApiError, Schedule } from '../../utils/interface';

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: Schedule;
  editable: boolean;
  dataIndex: keyof Schedule;
}

const ScheduleConfiguration: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newCCode, setNewCCode] = useState('');
  const [newSchDesc, setNewSchDesc] = useState('');
  const [newSch, setNewSch] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
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
        const schedulesWithKeys = response.data.schedules.map((schedule: Schedule) => ({
          ...schedule,
          key: schedule.code,
          c_code: schedule.c_code,
        })).sort((a:{arrange_od:number}, b:{arrange_od:number}) => a.arrange_od - b.arrange_od);
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
  
    const duplicateSch = schedules.find(schedule => schedule.sch1_sch2 === newSch);
    const duplicateCode = schedules.find((schedule) => schedule.code === newCode);
    const duplicateCCode = schedules.find((schedule) => schedule.c_code === newCCode);
    const duplicateSchDesc = schedules.find((schedule) => schedule.schDesc === newSchDesc);
  
    if (duplicateSch) {
      message.error('Schedule already exists.');
      return;
    }
  
    if (duplicateCode) {
      message.error('Code already exists.');
      return;
    }
  
    if (duplicateCCode) {
      message.error('Client Code already exists.');
      return;
    }
  
    if (duplicateSchDesc) {
      message.error('Description already exists.');
      return;
    }
  
    if (!newCode || !newCCode || !newSchDesc || !newSch) {
      message.error('Schedule, Code, Client Code, and Description are required.');
      return;
    }
  
    try {
      if (!currentProjectId) {
        message.error('No current project ID available.');
        return;
      }
      setButtonLoading(true);
  
      const maxArrangeOd = Math.max(...schedules.map(schedule => parseInt(schedule.arrange_od) ||0));
      const nextArrangeOd = maxArrangeOd + 1;
  
      const newSchedule: Schedule = {
        key: Math.random().toString(36).substring(7),
        sch1_sch2: newSch,
        code: newCode,
        c_code: newCCode,
        schDesc: newSchDesc,
        arrange_od: nextArrangeOd.toString(),
      };
  
      const payload = {
        projectId: currentProjectId,
        schedules: [
          {
            sch1_sch2: newSchedule.sch1_sch2,
            code: newSchedule.code,
            c_code: newSchedule.c_code,
            schDesc: newSchedule.schDesc,
            arrange_od: parseInt(newSchedule.arrange_od),
          },
        ],
      };
  
      const response = await api.post(configApi.API_URL.schedules.addorupdate, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response && response.data.success) {
        setSchedules([newSchedule, ...schedules]); // Add new schedule to the list
        setNewCode('');
        setNewCCode('');
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
    } finally {
      setButtonLoading(false);
    }
  };
  

  const handleEditSchedule = async (key: string, sch1_sch2: string, c_code: string, schDesc: string) => {
    const duplicateCCode = schedules.find((schedule) => schedule.c_code === c_code && schedule.key !== key);
    const duplicateSchDesc = schedules.find((schedule) => schedule.schDesc === schDesc && schedule.key !== key);
  
    if (duplicateCCode) {
      message.error('Client Code already exists.');
      return;
    }
  
    if (duplicateSchDesc) {
      message.error('Description already exists.');
      return;
    }
  
    if (!c_code || !schDesc) {
      message.error('Client Code and Description cannot be empty.');
      return;
    }
  
    if (!currentProjectId) {
      message.error('No current project ID available.');
      return;
    }
  
    const originalSchedules = [...schedules];
    const currentSchedule = schedules.find(schedule => schedule.key === key);
    if (!currentSchedule) {
      message.error('Schedule not found.');
      return;
    }
  
    const updatedSchedules = schedules.map((schedule) =>
      schedule.key === key ? { ...schedule, c_code, schDesc } : schedule
    );
    setSchedules(updatedSchedules);
    setEditingKey(null);
    setEditingColumn(null);
  
    const payload = {
      projectId: currentProjectId,
      schedules: [
        {
          sch1_sch2,
          code: key,
          c_code,
          schDesc,
          arrange_od: currentSchedule.arrange_od,
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
  
    useEffect(() => {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditingKey(null);
          return;
        }
      };
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }, []);

    const handleBlur = () => {
      if (localInputValue === inputValue) {
        setEditingKey(null);
        setEditingColumn(null);
        return;
      }
  
      if (dataIndex === 'c_code' || dataIndex === 'schDesc') {
        const sch1_sch2 = record?.sch1_sch2;
        handleEditSchedule(
          record?.key,
          sch1_sch2,
          dataIndex === 'c_code'? localInputValue : record?.c_code,
          dataIndex === 'schDesc' ? localInputValue : record?.schDesc,
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
            autoFocus
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
        <div onDoubleClick={() => handleSort('code')}>
          Code
        </div>
      ),
      dataIndex: 'code',
      key: 'code',
    },
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
          Client Code
        </div>
      ),
      dataIndex: 'c_code',
      key: 'c_code',
      onCell: (record: Schedule): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'c_code', // Only allow editing on the selected cell
        dataIndex: 'c_code',
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
            onKeyPress={(e) => e.key === "Enter" && handleAddSchedule()}
          />
        </Form.Item>

        <Form.Item style={{ marginRight: '10px' }}>
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Enter code"
            style={{ width: '180px' }} // Adjust width to match the required size
            onKeyPress={(e) => e.key === "Enter" && handleAddSchedule()}
          />
        </Form.Item>

        <Form.Item style={{ marginRight: '10px' }}>
          <Input
            value={newCCode}
            onChange={(e) => setNewCCode(e.target.value)}
            placeholder="Enter client code"
            style={{ width: '180px' }} // Adjust width to match the required size
            onKeyPress={(e) => e.key === "Enter" && handleAddSchedule()}
          />
        </Form.Item>

        <Form.Item style={{ marginRight: '10px' }}>
          <Input
            value={newSchDesc}
            onChange={(e) => setNewSchDesc(e.target.value)}
            placeholder="Enter description"
            style={{ width: '180px' }} // Adjust width to match the required size
            onKeyPress={(e) => e.key === "Enter" && handleAddSchedule()}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleAddSchedule} disabled={buttonLoading}>
            {
              buttonLoading ? <Spin /> : "Add Schedule"
            }
          </Button>
        </Form.Item>
      </Form>


      {/* Table section */}
      <Table
      className='select-none'
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
