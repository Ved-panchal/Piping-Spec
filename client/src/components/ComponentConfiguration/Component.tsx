import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, Select, message, Spin, Checkbox } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from '../../utils/api/config'; // API config for URLs
import showToast from '../../utils/toast';

interface ComponentData {
  key: string;
  itemDescription: string;
  code: string;
  c_code: string;
  dimensionalStandards: string;
  ratingrequired: boolean;
}

interface Component {
  id: number;
  componentname: string;
  ratingrequired: boolean;
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

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: ComponentData;
  editable: boolean;
  dataIndex: keyof ComponentData;
  toggleCheckbox?: (checked: boolean) => void;
}

const ComponentConfiguration: React.FC = () => {
  const [componentData, setComponentData] = useState<ComponentData[]>([]);
  const [componentsList, setComponentsList] = useState<Component[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newClientCode, setNewClientCode] = useState('');
  const [newDimensionalStandards, setNewDimensionalStandards] = useState('');
  const [newRatingRequired, setNewRatingRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  useEffect(() => {
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
      setLoading(true);
      const response = await api.get(`${configApi.API_URL.components.data}/${componentId}`);
      if (response && response.data && response.data.success) {
        const fetchedData = response.data.componentDescs.map((item: ComponentData) => ({
          ...item,
          key: item.code,
        }));
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
    if (!newDescription || !newCode || !newClientCode || !newDimensionalStandards) {
      message.error('All fields are required.');
      return;
    }

    try {
      setButtonLoading(true);
      const newData = {
        key: Math.random().toString(36).substring(7),
        itemDescription: newDescription,
        code: newCode,
        c_code: newClientCode,
        dimensionalStandards: newDimensionalStandards,
        ratingrequired: newRatingRequired,
      };

      const payload = {
        componentId: selectedComponentId,
        componentDescs: [
          {
            code: newCode,
            c_code: newClientCode,
            itemDescription: newDescription,
            dimensionalStandards: newDimensionalStandards,
            ratingrequired: newRatingRequired,
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
        setNewDimensionalStandards('');
        setNewRatingRequired(false);
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

    return (
      <td {...restProps}>
        {editable ? (
          dataIndex === 'ratingrequired' ? (
            <Checkbox
              checked={record.ratingrequired}
              onChange={(e) => toggleCheckbox && toggleCheckbox(e.target.checked)}
            />
          ) : (
            <Input
              value={localInputValue}
              onChange={(e) => setLocalInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyPress={(e) => e.key === 'Enter' && handleBlur()}
              autoFocus
            />
          )
        ) : dataIndex === 'ratingrequired' ? (
          <Checkbox
            checked={record.ratingrequired}
            onChange={(e) => toggleCheckbox && toggleCheckbox(e.target.checked)}
          />
        ) : (
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

  const handleEditComponentData = async (key: string, field: keyof ComponentData, value: string | boolean) => {
    const originalData = [...componentData];
    const updatedData = componentData.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    );
    setComponentData(updatedData);

    const payload = {
      componentId: selectedComponentId,
      data: {
        key,
        [field]: value,
      },
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
      title: 'Dimensional Standards',
      dataIndex: 'dimensionalStandards',
      key: 'dimensionalStandards',
      onCell: (record: ComponentData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'dimensionalStandards',
        dataIndex: 'dimensionalStandards',
      }),
    },
    {
      title: 'Rating Required',
      dataIndex: 'ratingrequired',
      key: 'ratingrequired',
      render: (_, record) => (
        <Checkbox
          checked={record.ratingrequired}
          onChange={(e) =>
            handleEditComponentData(record.key, 'ratingrequired', e.target.checked)
          }
        />
      ),
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
          <Input
            placeholder="Dimensional Standards"
            value={newDimensionalStandards}
            onChange={(e) => setNewDimensionalStandards(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={newRatingRequired}
            onChange={(e) => setNewRatingRequired(e.target.checked)}
          >
            Rating Required
          </Checkbox>
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
