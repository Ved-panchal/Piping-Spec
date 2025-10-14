import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, Select, message, Spin, Checkbox } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from '../../utils/api/config'; // API config for URLs
import showToast from '../../utils/toast';
import { Plus, Edit2 } from 'lucide-react';
import { ApiError, Component, ComponentDesc } from '../../utils/interface';

const { Option } = Select;

const GTypeList = [
  'CAP', 'COUP', 'CROS', 'ELBO', 'FLAN', 'FTUB', 'GASK', 'OLET', 'PCOM', 'REDU', 'TEE', 'TUBE', 'UNIO', 'VALV'
];

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: ComponentDesc;
  editable: boolean;
  dataIndex: keyof ComponentDesc;
  toggleCheckbox?: (checked: boolean) => void;
}

const ComponentConfiguration: React.FC = () => {
  const [ComponentDesc, setComponentDesc] = useState<ComponentDesc[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>();
  const [componentsList, setComponentsList] = useState<Component[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newClientCode, setNewClientCode] = useState('');
  const [newGType, setNewGType] = useState<string | undefined>(undefined);
  const [newSType, setNewSType] = useState('');
  const [newShortCode, setNewShortCode] = useState('');
  const [newSKey, setNewSkey] = useState('');
  const [newRatingRequired, setNewRatingRequired] = useState(false);
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

  const fetchComponentDesc = async (componentId: number) => {
    try {
      const payload = {
        componentId: componentId,
        projectId: currentProjectId,
      }
      setLoading(true);
      const response = await api.post(configApi.API_URL.components.data, payload);
      if (response && response.data && response.data.success) {
        const fetchedData = response.data.componentDescs.map((item: ComponentDesc) => ({
          ...item,
          key: item.code,
        }));
        setComponentDesc(fetchedData);
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
    setNewDescription('');
    setNewCode('');
    setNewClientCode('');
    setNewGType(undefined);
    setNewSType('');
    setNewShortCode('');
    setNewRatingRequired(false);
    setSelectedComponentId(componentId);
    fetchComponentDesc(componentId);
  };

  const handleAddComponentDesc = async () => {
    if (!newDescription || !newCode || !newClientCode || !newGType || !newSType || !newShortCode) {
      message.error('All fields are required.');
      return;
    }
  
    // Check if the code or c_code already exists in the ComponentDesc
    const codeExists = ComponentDesc.some((item) => item.code === newCode);
    const clientCodeExists = ComponentDesc.some((item) => item.c_code === newClientCode);
    const clientDescExists = ComponentDesc.some((item) => item.itemDescription === newDescription);
    const clientShortCodeExists = ComponentDesc.some((item) => item.short_code === newShortCode);
  
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
        skey: newSKey,
        ratingrequired: newRatingRequired,
      };
  
      const payload = {
        componentId: selectedComponentId?.toString(),
        componentDescs: [
          {
            project_id: currentProjectId,
            code: newCode,
            c_code: newClientCode,
            itemDescription: newDescription,
            g_type: newGType,
            s_type: newSType,
            short_code: newShortCode,
            skey: newSKey,
            ratingrequired: newRatingRequired,
          },
        ],
      };
  
      const response = await api.post(configApi.API_URL.components.addorupdate, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response && response.data.success) {
        setComponentDesc((prevData) => [newData, ...prevData]);
        setNewDescription('');
        setNewCode('');
        setNewClientCode('');
        setNewGType(undefined);
        setNewSType('');
        setNewShortCode('');
        setNewSkey('');
        setNewRatingRequired(false);
        message.success('Component data added successfully');
      } else {
        message.error(response.data.message)
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
    ...restProps
  }) => {
    const initialInputValue = record ? String(record[dataIndex]) : '';
    const [localInputValue, setLocalInputValue] = useState<string>(initialInputValue);
  
    const handleBlur = () => {
      if (localInputValue !== initialInputValue) {
        handleEditComponentDesc(record.key, dataIndex as keyof ComponentDesc, localInputValue);
      }
      setEditingKey(null);
      setEditingColumn(null);
    };
  
    const handleSelectChange = (value: string) => {
      setLocalInputValue(value);
      handleEditComponentDesc(record.key, dataIndex as keyof ComponentDesc, value);
      setEditingKey(null);
      setEditingColumn(null);
    };

    const handleCheckboxChange = (checked: boolean) => {
      handleEditComponentDesc(record.key, dataIndex as keyof ComponentDesc, checked);
      setEditingKey(null);
      setEditingColumn(null);
    };
  
    return (
      <td {...restProps}>
        {editable ? (
          dataIndex === 'g_type' ? (
            <Select
              value={localInputValue}
              onChange={handleSelectChange}
              onBlur={handleBlur}
              autoFocus
              style={{ width: '100%' }}
              size="small"
              bordered
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            >
              {GTypeList.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          ) : dataIndex === 'ratingrequired' ? (
            <Checkbox
              checked={record.ratingrequired}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              autoFocus
            />
          ) : (
            <Input
              value={localInputValue}
              onChange={(e) => setLocalInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyPress={(e) => e.key === 'Enter' && handleBlur()}
              autoFocus
              size="small"
              bordered
            />
          )
        ) : (
          <div
            onDoubleClick={() => {
              setEditingKey(record.key);
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

  const handleEditComponentDesc = async (
    key: string,
    field: keyof ComponentDesc,
    value: string | boolean
  ) => {
    const originalData = [...ComponentDesc];
    const updatedData = ComponentDesc.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    );
  
    const componentToUpdate = updatedData.find((item) => item.key === key);
    if (!componentToUpdate) return;
  
    // Validation: Check if the updated code or c_code is already in use
    const codeExists = ComponentDesc.some((item) => item.code === value && item.key !== key);
    const clientCodeExists = ComponentDesc.some((item) => item.c_code === value && item.key !== key);
    const clientDescExists = ComponentDesc.some((item) => item.itemDescription === value && item.key !== key);
    const clientShortCodeExists = ComponentDesc.some((item) => item.short_code === value && item.key !== key);
  
    if (field === 'code' && codeExists) {
      message.error('This code is already in use.');
      return;
    }
    
    if (field === 'c_code' && clientCodeExists) {
      message.error('This client code is already in use.');
      return;
    }

    if (field === 'itemDescription' && clientDescExists){
      message.error('This description is already in use.');
      return;
    }

    if (field === 'short_code' && clientShortCodeExists){
      message.error('This Short Code is already in use.');
      return;
    }
  
    setComponentDesc(updatedData);
  
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
          ratingrequired: componentToUpdate.ratingrequired,
          skey: componentToUpdate.skey,
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
        setComponentDesc(originalData);
        throw new Error('Failed to update component data.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to update component data.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };
  
  const columns: ColumnsType<ComponentDesc> = [
    {
      title: <span>Code</span>,
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: <span>Component Description</span>,
      dataIndex: 'itemDescription',
      key: 'itemDescription',
      onCell: (record: ComponentDesc): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'itemDescription',
        dataIndex: 'itemDescription',
      }),
    },
    {
      title: <span>Client Code</span>,
      dataIndex: 'c_code',
      key: 'c_code',
      onCell: (record: ComponentDesc): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'c_code',
        dataIndex: 'c_code',
      }),
    },
    {
      title: <span>G Type</span>,
      dataIndex: 'g_type',
      key: 'g_type',
      onCell: (record: ComponentDesc): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'g_type',
        dataIndex: 'g_type',
      }),
    },
    {
      title: <span>S Type</span>,
      dataIndex: 's_type',
      key: 's_type',
      onCell: (record: ComponentDesc): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 's_type',
        dataIndex: 's_type',
      }),
    },
    {
      title: <span>Short Code</span>,
      dataIndex: 'short_code',
      key: 'short_code',
      onCell: (record: ComponentDesc): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'short_code',
        dataIndex: 'short_code',
      }),
    },
    {
      title: <span>Skey</span>,
      dataIndex: 'skey',
      key: 'skey',
      onCell: (record: ComponentDesc): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'skey',
        dataIndex: 'skey',
      }),
    },
    {
      title: <span>Rating Required</span>,
      dataIndex: 'ratingrequired',
      key: 'ratingrequired',
      width: 120,
      render: (value: boolean) => (
        <Checkbox checked={value} disabled />
      ),
      onCell: (record: ComponentDesc): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'ratingrequired',
        dataIndex: 'ratingrequired',
      }),
    },
    {
      title: <span>Actions</span>,
      key: 'action',
      width: 80,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            type="text"
            style={{ padding: 4 }}
            onClick={() => {
              setEditingKey(record.key);
              setEditingColumn('itemDescription');
            }}
          >
            <Edit2 size={16} color="#1890ff" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "0", maxWidth: "100%" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Component Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-6 gap-3 mb-3">
            <Form.Item
              label={<span className="font-semibold">Component <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Select
                placeholder="Select a component"
                className="w-full"
                onChange={handleComponentChange}
                size="middle"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {componentsList.map((component) => (
                  <Option key={component.id} value={component.id}>
                    {component.componentname}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Description <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-4"
            >
              <Input
                placeholder="Enter Description"
                className="w-full"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-6 gap-3 mb-3">
            <Form.Item
              label={<span className="font-semibold">Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Code"
                className="w-full"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Client Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Client Code"
                className="w-full"
                value={newClientCode}
                onChange={(e) => setNewClientCode(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">G Type <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Select
                placeholder="Select G Type"
                className="w-full"
                value={newGType}
                onChange={(value) => setNewGType(value)}
                size="middle"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {GTypeList.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-6 gap-3">
            <Form.Item
              label={<span className="font-semibold">S Type <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter S Type"
                className="w-full"
                value={newSType}
                onChange={(e) => setNewSType(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Short Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Short Code"
                className="w-full"
                value={newShortCode}
                onChange={(e) => setNewShortCode(e.target.value)}
                size="middle"
              />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Skey <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Skey"
                className="w-full"
                value={newSKey}
                onChange={(e) => setNewSkey(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-6 gap-3 mt-3">
            <Form.Item
              label={<span className="font-semibold">Rating Required ?</span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Checkbox
                checked={newRatingRequired}
                onChange={(e) => setNewRatingRequired(e.target.checked)}
              >
                
              </Checkbox>
            </Form.Item>

            <div className="col-span-4 flex items-end justify-end">
              <Button
                type="primary"
                onClick={handleAddComponentDesc}
                loading={buttonLoading}
                className="bg-blue-500 text-white"
                icon={<Plus size={14} className="mr-1" />}
              >
                Add Data
              </Button>
            </div>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : ComponentDesc.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-400">
            <div className="text-center mb-3">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>No data, please select component</p>
          </div>
        ) : (
          <Table
            dataSource={ComponentDesc}
            columns={columns}
            rowKey="key"
            pagination={false}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            size="small"
            className="component-table"
          />
        )}
      </div>

      <style>{`
        .component-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .component-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .component-table .ant-table-row:hover {
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

export default ComponentConfiguration;