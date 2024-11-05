import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, Select, message, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from '../../utils/api/config'; // API config for URLs
import showToast from '../../utils/toast';

interface ComponentData {
  key: string;
  itemDescription: string;
  code: string;
  c_code: string;
  g_type: string;
  s_type: string;
  short_code: string;
}

interface Component {
  id: number;
  componentname: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

const GTypeList = [
  'CAP', 'COUP', 'CROS', 'ELBO', 'FLAN', 'FTUB', 'GASK', 'OLET', 'PCOM', 'REDU', 'TEE', 'TUBE', 'UNIO'
];

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: ComponentData;
  editable: boolean;
  dataIndex: keyof ComponentData;
  toggleCheckbox?: (checked: boolean) => void;
}

const ComponentConfiguration: React.FC = () => {
  const [componentData, setComponentData] = useState<ComponentData[]>([]);
  const [currentProjectId,setCurrentProjectId] = useState<string>();
  const [componentsList, setComponentsList] = useState<Component[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newClientCode, setNewClientCode] = useState('');
  const [newGType, setNewGType] = useState('G Type');
  const [newSType, setNewSType] = useState('');
  const [newShortCode, setNewShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  useEffect(() => {
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId) {
      setCurrentProjectId(projectId);
    } else {
      showToast({
        message: "No current project ID found in local storage.",
        type: "error",
      });
    }
    const fetchComponentsList = async () => {
      try {
        setLoading(true);
        const response = await api.get(configApi.API_URL.components.list);
        if (response && response.data && response.data.success) {
          setComponentsList(response.data.components);
        } else {
          showToast({ message: 'Failed to fetch components list.', type: 'error' });
        }
      } catch (error) {
        const apiError = error as ApiError; 
        const errorMessage = apiError.response?.data?.error || 'Error fetching components list.';
        showToast({ message: errorMessage, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchComponentsList();
  }, []);

  const fetchComponentData = async (componentId: number) => {
    try {
      const payload = {
        componentId: componentId,
        projectId: currentProjectId,
      }
      setLoading(true);
      const response = await api.post(configApi.API_URL.components.data,payload);
      if (response && response.data && response.data.success) {
        const fetchedData = response.data.componentDescs.map((item: ComponentData) => ({
          ...item,
          key: item.code,
        }));
        console.log('fetched',fetchedData);
        setComponentData(fetchedData);
      } else {
        showToast({ message: 'Failed to fetch component data.', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Error fetching component data.';
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (componentId: number) => {
    setSelectedComponentId(componentId);
    fetchComponentData(componentId);
  };

  const handleAddComponentData = async () => {
    if (!newDescription || !newCode || !newClientCode || !newGType || !newSType || !newShortCode) {
      message.error('All fields are required.');
      return;
    }
  
    // Check if the code or c_code already exists in the componentData
    const codeExists = componentData.some((item) => item.code === newCode);
    const clientCodeExists = componentData.some((item) => item.c_code === newClientCode);
    const clientDescExists = componentData.some((item) => item.itemDescription === newDescription);
    const clientShortCodeExists = componentData.some((item) => item.short_code === newShortCode);
  
    if (codeExists) {
      message.error('This code is already in use.');
      return;
    }
    
    if (clientCodeExists) {
      message.error('This client code is already in use.');
      return;
    }

    if (clientDescExists){
      message.error('This description is already in use.');
      return;
    }
    if (clientShortCodeExists){
      message.error('This Short Code is already in use.');
      return;
    }

  
    try {
      setButtonLoading(true);
      const newData = {
        key: Math.random().toString(36).substring(7),
        itemDescription: newDescription,
        code: newCode,
        c_code: newClientCode,
        g_type: newGType,
        s_type: newSType,
        short_code: newShortCode,
      };
  
      const payload = {
        componentId: selectedComponentId?.toString(),
        componentDescs: [
          {
            project_id:currentProjectId,
            code: newCode,
            c_code: newClientCode,
            itemDescription: newDescription,
            g_type: newGType,
            s_type: newSType,
            short_code: newShortCode,
          },
        ],
      };
  
      const response = await api.post(configApi.API_URL.components.addorupdate, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response && response.data.success) {
        setComponentData((prevData) => [newData, ...prevData]);
        setNewDescription('');
        setNewCode('');
        setNewClientCode('');
        setNewGType('G Type');
        setNewSType('');
        setNewShortCode('');
        message.success('Component data added successfully');
      } else {
        throw new Error('Failed to add component data.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to add component data.';
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setButtonLoading(false);
    }
  };

  const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    children,
    record,
    dataIndex,
    toggleCheckbox,
    ...restProps
  }) => {
    const initialInputValue = record ? String(record[dataIndex]) : '';
    const [localInputValue, setLocalInputValue] = useState<string>(initialInputValue);
  
    const handleBlur = () => {
      if (localInputValue !== initialInputValue) {
        handleEditComponentData(record.key, dataIndex as keyof ComponentData, localInputValue);
      }
      setEditingKey(null);
      setEditingColumn(null);
    };
  
    const handleSelectChange = (value: string) => {
      setLocalInputValue(value);
      handleEditComponentData(record.key, dataIndex as keyof ComponentData, value);
      setEditingKey(null);
      setEditingColumn(null);
    };
  
    return (
      <td {...restProps}>
        {editable ? (
          dataIndex === 'g_type' ? (
            // Render Select component for 'g_type' field with GTypeList options
            <Select
              value={localInputValue}
              onChange={handleSelectChange}
              onBlur={handleBlur}
              autoFocus
              style={{ width: '100%' }}
            >
              {GTypeList.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          ) : (
            // Render Input component for other fields
            <Input
              value={localInputValue}
              onChange={(e) => setLocalInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyPress={(e) => e.key === 'Enter' && handleBlur()}
              autoFocus
            />
          )
        ) : (
          // Render cell content when not in edit mode
          <div
            onDoubleClick={() => {
              setEditingKey(record.key);
              setEditingColumn(dataIndex);
            }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const handleEditComponentData = async (
    key: string,
    field: keyof ComponentData,
    value: string | boolean
  ) => {
    const originalData = [...componentData];
    const updatedData = componentData.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    );
  
    const componentToUpdate = updatedData.find((item) => item.key === key);
    if (!componentToUpdate) return;
  
    // Validation: Check if the updated code or c_code is already in use
    const codeExists = componentData.some((item) => item.code === value && item.key !== key);
    const clientCodeExists = componentData.some((item) => item.c_code === value && item.key !== key);
    const clientDescExists = componentData.some((item) => item.itemDescription === value && item.key !== key);
    const clientShortCodeExists = componentData.some((item) => item.short_code === value && item.key !== key);
  
    if (field === 'code' && codeExists) {
      message.error('This code is already in use.');
      return;
    }
    
    if (field === 'c_code' && clientCodeExists) {
      message.error('This client code is already in use.');
      return;
    }

    if (field ==='itemDescription' && clientDescExists){
      message.error('This description is already in use.');
      return;
    }

    if (field ==='short_code' && clientShortCodeExists){
      message.error('This Short Code is already in use.');
      return;
    }
  
    setComponentData(updatedData);
    console.log('updated data: ',updatedData);
    console.log('Component to update: ',componentToUpdate);
  
    const payload = {
      componentId: selectedComponentId?.toString(),
      componentDescs: [
        {
          project_id: currentProjectId,
          code: componentToUpdate.code,
          c_code: componentToUpdate.c_code,
          itemDescription: componentToUpdate.itemDescription,
          g_type: componentToUpdate.g_type,
          s_type: componentToUpdate.s_type,
          short_code: componentToUpdate.short_code,
        },
      ],
    };
  
    try {
      const response = await api.post(configApi.API_URL.components.addorupdate, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response && response.data.success) {
        message.success('Component data updated successfully');
      } else {
        setComponentData(originalData);
        throw new Error('Failed to update component data.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to update component data.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };
  

  const columns: ColumnsType<ComponentData> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Component Description',
      dataIndex: 'itemDescription',
      key: 'itemDescription',
      onCell: (record: ComponentData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'itemDescription',
        dataIndex: 'itemDescription',
      }),
    },
    {
      title: 'Client Code',
      dataIndex: 'c_code',
      key: 'c_code',
      onCell: (record: ComponentData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'c_code',
        dataIndex: 'c_code',
      }),
    },
    {
      title: 'G Type',
      dataIndex: 'g_type',
      key: 'g_type',
      onCell: (record: ComponentData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'g_type',
        dataIndex: 'g_type',
      }),
    },
    {
      title: 'S Type',
      dataIndex: 's_type',
      key: 's_type',
      onCell: (record: ComponentData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 's_type',
        dataIndex: 's_type',
      }),
    },
    {
      title: 'Short Code',
      dataIndex: 'short_code',
      key: 'short_code',
      onCell: (record: ComponentData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'short_code',
        dataIndex: 'short_code',
      }),
    },
  ];

  return (
    <div>
      <h1>Component Configuration</h1>
      <Form layout="inline" style={{ marginBottom: '20px', marginTop: '10px' }}>
        <Form.Item>
          <Select
            placeholder="Select a component"
            style={{ width: '10rem', marginBottom: '1rem' }}
            onChange={handleComponentChange}
            options={componentsList.map((component) => ({
              value: component.id,
              label: component.componentname,
            }))}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Code"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Client Code"
            value={newClientCode}
            onChange={(e) => setNewClientCode(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Select
            placeholder="Select a G Type"
            style={{ width: '10rem', marginBottom: '1rem' }}
            value={newGType}
            onChange={(value) => setNewGType(value)}
            options={GTypeList.map((type) => ({ value: type, label: type }))}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="S Type"
            value={newSType}
            onChange={(e) => setNewSType(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Short Code"
            value={newShortCode}
            onChange={(e) => setNewShortCode(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleAddComponentData}
            loading={buttonLoading}
          >
            Add Data
          </Button>
        </Form.Item>
      </Form>

      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={componentData}
          columns={columns}
          rowKey="key"
          pagination={false}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
        />
      )}
    </div>
  );
};

export default ComponentConfiguration;
