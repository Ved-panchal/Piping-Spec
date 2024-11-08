/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, TdHTMLAttributes } from 'react';
import { Table, Input, Button, Form, Select, message, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import showToast from '../../utils/toast';
import api from '../../utils/api/apiutils';
import { api as configApi } from "../../utils/api/config";
import { ApiError, Component, MaterialData } from '../../utils/interface';

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
        isAll:isAllMaterial,
      }
      const response = await api.post(configApi.API_URL.materials.getall,payload);
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
    const baseMaterialExists = materialData.some((item) => item.base_material === newBaseMaterial);
  
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
  
    if (baseMaterialExists) {
      message.error('This base material is already in use.');
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
        throw new Error('Failed to add material data.');
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
        setMaterialData(originalData);  // Revert to original data if update fails
        throw new Error('Failed to update material data.');
      }
    } catch (error) {
      handleApiError(error);
    }
  };
  

  const columns: ColumnsType<MaterialData> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Material',
      dataIndex: 'material_description',
      key: 'material_description',
      onCell: (record: MaterialData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'material_description',
        dataIndex: 'material_description',
      }),
    },
    {
        title: 'Client Code',
        dataIndex: 'c_code',
        key: 'c_code',
        onCell: (record: MaterialData): EditableCellProps => ({
          record,
          editable: editingKey === record.key && editingColumn === 'c_code',
          dataIndex: 'c_code',
        }),
      },
    {
      title: 'Base Material',
      dataIndex: 'base_material',
      key: 'base_material',
      onCell: (record: MaterialData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'base_material',
        dataIndex: 'base_material',
      }),
    },
  ];

  const handleApiError = (error:any) => {
    const apiError = error as ApiError;
    const errorMessage = apiError.response?.data?.error || 'An error occurred';
    showToast({ message: errorMessage, type: 'error' });
  };

  return (
    <div>
      <h1>Material Configuration</h1>
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
            placeholder="Code"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Material"
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
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
            placeholder="Base Material"
            value={newBaseMaterial}
            onChange={(e) => setNewBaseMaterial(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleAddMaterialData}
            loading={buttonLoading}
          >
            Add Material
          </Button>
        </Form.Item>
      </Form>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          pagination={false}
          dataSource={materialData}
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

export default MaterialConfiguration;
