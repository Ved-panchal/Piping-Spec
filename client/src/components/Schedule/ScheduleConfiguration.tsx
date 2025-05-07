import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, message, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from '../../utils/api/config'; // API config for URLs
import showToast from '../../utils/toast';
import { ApiError, Schedule } from '../../utils/interface';
import { Plus } from 'lucide-react';

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: Schedule;
  editable: boolean;
  dataIndex: keyof Schedule;
}

const ScheduleConfiguration: React.FC = () => {
  // Sample data for development
  const sampleSchedules: Schedule[] = [
    { key: "1", code: "10", sch1_sch2: "10", c_code: "C10", schDesc: "Sch.10", arrange_od: "10" },
    { key: "2", code: "S1", sch1_sch2: "10S", c_code: "CS1", schDesc: "Sch.10S", arrange_od: "11" },
    { key: "3", code: "20", sch1_sch2: "20", c_code: "C20", schDesc: "Sch.20", arrange_od: "20" },
    { key: "4", code: "30", sch1_sch2: "30", c_code: "C30", schDesc: "Sch.30", arrange_od: "30" },
    { key: "5", code: "HV", sch1_sch2: "HVY", c_code: "CHV", schDesc: "HVY", arrange_od: "40" },
    { key: "6", code: "40", sch1_sch2: "40", c_code: "C40", schDesc: "Sch.40", arrange_od: "40" },
    { key: "7", code: "ST", sch1_sch2: "STD", c_code: "CST", schDesc: "Sch.STD", arrange_od: "50" },
  ];

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newCCode, setNewCCode] = useState('');
  const [newSchDesc, setNewSchDesc] = useState('');
  const [newSch, setNewSch] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

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
        setSchedules([newSchedule, ...schedules]);
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
            size="small"
            bordered
          />
        ) : (
          <div 
            onDoubleClick={() => {
              setEditingKey(record?.key);
              setEditingColumn(dataIndex);
            }}
            style={{ cursor: 'pointer', padding: '4px 0' }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<Schedule> = [
    {
      title: <span>Code</span>,
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: <span>Schedule 1/ Schedule 2</span>,
      dataIndex: 'sch1_sch2',
      key: 'sch1_sch2',
    },
    {
      title: <span>Client Code</span>,
      dataIndex: 'c_code',
      key: 'c_code',
      onCell: (record: Schedule): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'c_code',
        dataIndex: 'c_code',
      }),
    },
    {
      title: <span>Description</span>,
      dataIndex: 'schDesc',
      key: 'schDesc',
      onCell: (record: Schedule): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'schDesc',
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
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Schedule Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-4 gap-3">
            <Form.Item
              label={<span className="font-semibold">Schedule <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Schedule 1/Schedule 2 Enter schedule"
                className="w-full"
                value={newSch}
                onChange={(e) => setNewSch(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter code"
                className="w-full"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Client Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter client code"
                className="w-full"
                value={newCCode}
                onChange={(e) => setNewCCode(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Description <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter description"
                className="w-full"
                value={newSchDesc}
                onChange={(e) => setNewSchDesc(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>
          
          <div className="flex flex-row-reverse mt-6 mb-4">
            <Button
              type="primary"
              onClick={handleAddSchedule}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Schedule
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-400">
            <div className="text-center mb-3">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>No data</p>
          </div>
        ) : (
          <Table
            className="schedule-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={schedules}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .schedule-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .schedule-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .schedule-table .ant-table-row:hover {
          background-color: #f5f5f5;
        }
        .ant-form-item {
          margin-bottom: 0;
        }
        .ant-form-item-label {
          font-weight: normal;
          padding-bottom: 2px;
        }
        .ant-form-item-label > label {
          color: #333;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ScheduleConfiguration;