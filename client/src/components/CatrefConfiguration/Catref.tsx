import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Form, Select, message, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import showToast from '../../utils/toast';
import api from '../../utils/api/apiutils';
import { api as configApi } from "../../utils/api/config";
import { ApiError, Component } from '../../utils/interface';

// Extend the interface to match the CatRef data structure
export interface EditableCellProps extends React.TdHTMLAttributes<unknown> {
  record: CatRefData;
  editable: boolean;
  dataIndex: keyof CatRefData;
}

// Update the interface in your utils/interface.ts to match this
interface CatRefData {
  id?: number;
  key: string;
  component_id: number;
  project_id?: string | null;
  item_short_desc: string;
  rating: string;
  concatenate: string;
  catalog: string;
}

const CatRefConfiguration: React.FC = () => {
  const [catRefData, setCatRefData] = useState<CatRefData[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>();
  const [componentsList, setComponentsList] = useState<Component[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);

  // New state for input fields
  const [newItemShortDesc, setNewItemShortDesc] = useState('');
  const [newRating, setNewRating] = useState('');
  const [newCatalog, setNewCatalog] = useState('');

  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  const generateConcatenate = (itemShortDesc: string, rating: string): string => {
    const formattedRating = rating || 'null';
    return `${itemShortDesc}-${formattedRating}`;
  };

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

  const fetchCatRefData = async (componentId: number) => {
    try {
      setLoading(true);

      const payload = {
        projectId: currentProjectId,
        componentId,
      };
      const response = await api.post(configApi.API_URL.catrefs.getall, payload);
      
      if (response && response.data && response.data.success) {
        const fetchedData = response.data.catRefs.map((item: CatRefData) => ({
          ...item,
          rating: item.rating === null ? "" : item.rating,
          key: item.concatenate || Math.random().toString(36).substring(7),
        }));
        setCatRefData(fetchedData);
      } else {
        showToast({ message: 'Failed to fetch CatRef data.', type: 'error' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (componentId: number) => {
    // Reset input fields
    setNewItemShortDesc('');
    setNewRating('');
    setNewCatalog('');

    setSelectedComponentId(componentId);
    fetchCatRefData(componentId);
  };

  const handleAddCatRefData = async () => {
    // Validate input fields
    if (!newItemShortDesc || !newCatalog) {
        message.error('Item Short Desc and Catalog fields are required.');
        return;
      }
    // Generate concatenate field
    const newConcatenate = generateConcatenate(newItemShortDesc, newRating);

    const concanateExists = catRefData.some((item) => 
        item.concatenate === newConcatenate
      );

    // Check for duplicates
    const descExists = catRefData.some((item) => 
      item.item_short_desc === newItemShortDesc && 
      item.concatenate === newConcatenate
    );

    if (descExists || concanateExists) {
      message.error('This CatRef already exists.');
      return;
    }

    try {
      setButtonLoading(true);

      const newData: CatRefData = {
        key: Math.random().toString(36).substring(7),
        component_id: selectedComponentId!,
        project_id: currentProjectId,
        item_short_desc: newItemShortDesc,
        rating: newRating || "null", 
        concatenate: newConcatenate,
        catalog: newCatalog,
      };

      const payload = {
        componentId: selectedComponentId,
        catRefs: [newData],
      };

      const response = await api.post(configApi.API_URL.catrefs.addorupdate, payload);

      if (response && response.data.success) {
        setCatRefData((prevData) => [newData, ...prevData]);
        
        // Reset input fields
        setNewItemShortDesc('');
        setNewRating('');
        setNewCatalog('');

        message.success('CatRef data added successfully');
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
          // For item_short_desc or rating, regenerate concatenate
          if (dataIndex === 'item_short_desc' || dataIndex === 'rating') {
            const updatedConcatenate = generateConcatenate(
              dataIndex === 'item_short_desc' ? localInputValue : record.item_short_desc,
              dataIndex === 'rating' ? localInputValue : record.rating
            );
            
            handleEditCatRefData(record.key, 'concatenate', updatedConcatenate);
          }
          
          handleEditCatRefData(record.key, dataIndex, localInputValue);
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

  const handleEditCatRefData = async (
    key: string,
    field: keyof CatRefData,
    value: string
  ) => {
    const originalData = [...catRefData];
    const updatedData = catRefData.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    );

    const catRefToUpdate = updatedData.find((item) => item.key === key);
    if (!catRefToUpdate) return;

    

    // Check for duplicate entries when editing item_short_desc or rating
    if (field === 'item_short_desc' || field === 'rating') {
        const newConcatenate = generateConcatenate(
          field === 'item_short_desc' ? value : catRefToUpdate.item_short_desc,
          field === 'rating' ? value : catRefToUpdate.rating
        );
  
        const descExists = catRefData.some((item) => 
          item.concatenate === newConcatenate && 
          item.key !== key
        );
  
        if (descExists) {
          message.error('This CatRef already exists.');
          return;
        }
  
        catRefToUpdate.concatenate = newConcatenate;
      }
  
      setCatRefData(updatedData);

      const payload = {
        componentId: selectedComponentId,
        catRefs: [
          {
            item_short_desc: catRefToUpdate.item_short_desc,
            rating: catRefToUpdate.rating || 'null',
            concatenate: catRefToUpdate.concatenate,
            catalog: catRefToUpdate.catalog,
            project_id: catRefToUpdate.project_id,
          },
        ],
      };

    try {
      const response = await api.post(configApi.API_URL.catrefs.addorupdate, payload);

      if (response && response.data.success) {
        message.success('CatRef data updated successfully');
      } else {
        setCatRefData(originalData);  // Revert to original data if update fails
        throw new Error('Failed to update CatRef data.');
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: ColumnsType<CatRefData> = [
    {
      title: 'Item Short Desc',
      dataIndex: 'item_short_desc',
      key: 'item_short_desc',
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'item_short_desc',
        dataIndex: 'item_short_desc',
      }),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'rating',
        dataIndex: 'rating',
      }),
    },
    {
      title: 'Concatenate',
      dataIndex: 'concatenate',
      key: 'concatenate',
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'concatenate',
        dataIndex: 'concatenate',
      }),
    },
    {
      title: 'Catalog',
      dataIndex: 'catalog',
      key: 'catalog',
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === 'catalog',
        dataIndex: 'catalog',
      }),
    },
  ];

  const handleApiError = (error: any) => {
    const apiError = error as ApiError;
    const errorMessage = apiError.response?.data?.error || 'An error occurred';
    showToast({ message: errorMessage, type: 'error' });
  };

  return (
    <div>
      <h1>CatRef Configuration</h1>
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
            placeholder="Item Short Desc"
            value={newItemShortDesc}
            onChange={(e) => setNewItemShortDesc(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Rating"
            value={newRating}
            onChange={(e) => setNewRating(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Catalog"
            value={newCatalog}
            onChange={(e) => setNewCatalog(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleAddCatRefData}
            loading={buttonLoading}
          >
            Add CatRef
          </Button>
        </Form.Item>
      </Form>
        <Table
          columns={columns}
          pagination={false}
          dataSource={catRefData}
          loading={loading}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
        />
    </div>
  );
};

export default CatRefConfiguration;