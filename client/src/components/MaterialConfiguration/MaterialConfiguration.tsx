/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, Select, message, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import showToast from '../../utils/toast';
import api from '../../utils/api/apiutils';
import { api as configApi } from "../../utils/api/config";
import { ApiError, Component, MaterialData } from '../../utils/interface';
import { Plus } from 'lucide-react';

export interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: MaterialData;
  editable: boolean;
  dataIndex: keyof MaterialData;
}

const MaterialConfiguration: React.FC = () => {
  const [materialData, setMaterialData] = useState<MaterialData[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>();
  const [componentsList, setComponentsList] = useState<Component[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newClientCode, setNewClientCode] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newBaseMaterial, setNewBaseMaterial] = useState('');
  const [isAllMaterial,] = useState(false);
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
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComponentsList();
  }, []);

  const fetchMaterialData = async (componentId: number) => {
    try {
      setLoading(true);

      const payload = {
        projectId: currentProjectId,
        componentId,
        isAll: isAllMaterial,
      }
      const response = await api.post(configApi.API_URL.materials.getall, payload);
      if (response && response.data && response.data.success) {
        const fetchedData = response.data.materials.map((item: MaterialData) => ({
          ...item,
          key: item.code,
        }));
        setMaterialData(fetchedData);
      } else {
        showToast({ message: 'Failed to fetch material data.', type: 'error' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (componentId: number) => {
    setNewCode('');
    setNewClientCode('');
    setNewMaterial('');
    setNewBaseMaterial('');
    setSelectedComponentId(componentId);
    fetchMaterialData(componentId);
  };

  const handleAddMaterialData = async () => {
    if (!newCode || !newClientCode || !newMaterial || !newBaseMaterial) {
      message.error('All fields are required.');
      return;
    }
  
    const codeExists = materialData.some((item) => item.code === newCode);
    const clientCodeExists = materialData.some((item) => item.c_code === newClientCode);
    const descriptionExists = materialData.some((item) => item.material_description === newMaterial);
  
    if (codeExists) {
      message.error('This code is already in use.');
      return;
    }
  
    if (clientCodeExists) {
      message.error('This client code is already in use.');
      return;
    }
  
    if (descriptionExists) {
      message.error('This material description is already in use.');
      return;
    }
  
    try {
      setButtonLoading(true);
  
      const newData = {
        key: Math.random().toString(36).substring(7),
        code: newCode,
        c_code: newClientCode,
        material_description: newMaterial,
        base_material: newBaseMaterial,
      };
  
      const payload = {
        componentId: selectedComponentId,
        projectId: currentProjectId,
        materials: [
          {
            code: newCode,
            c_code: newClientCode,
            material_description: newMaterial,
            base_material: newBaseMaterial,
          },
        ],
      };
  
      const response = await api.post(configApi.API_URL.materials.addorupdate, payload);
  
      if (response && response.data.success) {
        setMaterialData((prevData) => [newData, ...prevData]);
        setNewCode('');
        setNewClientCode('');
        setNewMaterial('');
        setNewBaseMaterial('');
        message.success('Material data added successfully');
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      handleApiError(error);
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
        handleEditMaterialData(record.key, dataIndex as keyof MaterialData, localInputValue);
      }
      setEditingKey(null);
      setEditingColumn(null);
    };

    return (
      <td {...restProps}>
        {editable ? (
          <Input
            value={localInputValue}
            onChange={(e) => setLocalInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyPress={(e) => e.key === 'Enter' && handleBlur()}
            autoFocus
            size="small"
            bordered
          />
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

  const handleEditMaterialData = async (
    key: string,
    field: keyof MaterialData,
    value: string
  ) => {
    const originalData = [...materialData];
    const updatedData = materialData.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    );
  
    const materialToUpdate = updatedData.find((item) => item.key === key);
    if (!materialToUpdate) return;
  
    // Validation: Check if the updated code, c_code, material_description, or base_material is already in use
    const codeExists = materialData.some((item) => item.code === value && item.key !== key);
    const clientCodeExists = materialData.some((item) => item.c_code === value && item.key !== key);
    const descriptionExists = materialData.some((item) => item.material_description === value && item.key !== key);
    const baseMaterialExists = materialData.some((item) => item.base_material === value && item.key !== key);
  
    if (field === 'code' && codeExists) {
      message.error('This code is already in use.');
      return;
    }
  
    if (field === 'c_code' && clientCodeExists) {
      message.error('This client code is already in use.');
      return;
    }
  
    if (field === 'material_description' && descriptionExists) {
      message.error('This description is already in use.');
      return;
    }
  
    if (field === 'base_material' && baseMaterialExists) {
      message.error('This base material is already in use.');
      return;
    }
  
    setMaterialData(updatedData);
  
    const payload = {
      componentId: selectedComponentId,
      projectId: currentProjectId,
      materials: [
        {
          code: materialToUpdate.code,
          c_code: materialToUpdate.c_code,
          material_description: materialToUpdate.material_description,
          base_material: materialToUpdate.base_material,
        },
      ],
    };
  
    try {
      const response = await api.post(configApi.API_URL.materials.addorupdate, payload);
  
      if (response && response.data.success) {
        message.success('Material data updated successfully');
      } else {
        setMaterialData(originalData);
        throw new Error('Failed to update material data.');
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: ColumnsType<MaterialData> = [
    {
      title: <span>Code</span>,
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: <span>Material</span>,
      dataIndex: 'material_description',
      key: 'material_description',
      onCell: (record: MaterialData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'material_description',
        dataIndex: 'material_description',
      }),
    },
    {
      title: <span>Client Code</span>,
      dataIndex: 'c_code',
      key: 'c_code',
      onCell: (record: MaterialData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'c_code',
        dataIndex: 'c_code',
      }),
    },
    {
      title: <span>Base Material</span>,
      dataIndex: 'base_material',
      key: 'base_material',
      onCell: (record: MaterialData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'base_material',
        dataIndex: 'base_material',
      }),
    },
  ];

  const handleApiError = (error: any) => {
    const apiError = error as ApiError;
    const errorMessage = apiError.response?.data?.error || 'An error occurred';
    showToast({ message: errorMessage, type: 'error' });
  };

  return (
    <div style={{ padding: "0", maxWidth: "100%" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Material Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-4 gap-3 mb-3">
            <Form.Item
              label={<span className="font-semibold">Component <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Select
                placeholder="Select a component"
                className="w-full"
                onChange={handleComponentChange}
                size="middle"
                options={componentsList.map((component) => ({
                  value: component.id,
                  label: component.componentname,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
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
              className="mb-0"
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
              label={<span className="font-semibold">Base Material <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter Base Material"
                className="w-full"
                value={newBaseMaterial}
                onChange={(e) => setNewBaseMaterial(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mb-2">
            <Form.Item
              label={<span className="font-semibold">Material <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter Material Description"
                className="w-full"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>
          
          <div className="flex flex-row-reverse justify-start mt-4 mb-2">
            <Button
              type="primary"
              onClick={handleAddMaterialData}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Material
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : materialData.length === 0 ? (
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
            className="material-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={materialData}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .material-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .material-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .material-table .ant-table-row:hover {
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

export default MaterialConfiguration;