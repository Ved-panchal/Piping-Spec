/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Spin } from "antd";
import { Table, Input, Button, Form, message } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { Plus } from "lucide-react";

// Types for valve sub-type data
interface ValvSubType {
  key: string;
  valv_sub_type: string;
  code: string;
  c_code: string;
  project_id?: string;
  default?: boolean;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

interface EditableCellProps extends TdHTMLAttributes<any> {
  record: ValvSubType;
  editable: boolean;
  dataIndex: string;
}

const ValvSubType: React.FC = () => {
  const [valvSubTypes, setValvSubTypes] = useState<ValvSubType[]>([]);
  const [newValvSubType, setNewValvSubType] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCCode, setNewCCode] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Table loading
  const [editingOriginalValue, setEditingOriginalValue] = useState<string>("");
  const [buttonLoading, setButtonLoading] = useState(false); // Button loading

  const codeRegex = /^[A-Za-z0-9]+$/;

  useEffect(() => {
    const projectId = localStorage.getItem("currentProjectId");
    if (projectId) {
      setCurrentProjectId(projectId);
    } else {
      showToast({
        message: "No current project ID found in local storage.",
        type: "error",
      });
    }
  }, []);

  const fetchValvSubTypes = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const payload = {
        projectId: currentProjectId,
      };

      const response = await api.post(
        configApi.API_URL.valvsubtype.getAll,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data && response.data.success) {
        const valvSubTypesWithKeys = response.data.valvSubTypes.map((valvSubType: any) => ({
          ...valvSubType,
          key: valvSubType.code || Math.random().toString(36).substring(7),
        }));
        setValvSubTypes(valvSubTypesWithKeys);
      } else {
        showToast({ message: "Failed to fetch valve sub-types.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching valve sub-types.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddValvSubType = async () => {
    const duplicateFields: string[] = [];

    if (valvSubTypes.some((valvSubType) => valvSubType.valv_sub_type === newValvSubType)) {
      duplicateFields.push("Valve Sub Type");
    }
    if (valvSubTypes.some((valvSubType) => valvSubType.code === newCode)) {
      duplicateFields.push("Code");
    }
    if (valvSubTypes.some((valvSubType) => valvSubType.c_code === newCCode)) {
      duplicateFields.push("Client Code");
    }

    if (duplicateFields.length > 0) {
      message.error(`${duplicateFields.join(", ")} already in use.`);
      return;
    }
    
    if (!newValvSubType || !newCode || !newCCode) {
      message.error("Valve Sub Type, Code, and Client Code are required.");
      return;
    }
    
    if (!codeRegex.test(newCode)) {
      message.error("Code can only include A-Z, a-z, and 0-9");
      return;
    }
    
    if (!codeRegex.test(newCCode)) {
      message.error("Client Code can only include A-Z, a-z, and 0-9");
      return;
    }

    try {
      setButtonLoading(true); // Set button loading to true
      if (!currentProjectId) {
        message.error("No current project ID available.");
        return;
      }

      const newValvSubTypeRecord: ValvSubType = {
        key: Math.random().toString(36).substring(7),
        valv_sub_type: newValvSubType,
        code: newCode,
        c_code: newCCode,
        project_id: currentProjectId,
      };

      const payload = {
        payload: [
          {
            valv_sub_type: newValvSubType,
            code: newCode,
            c_code: newCCode,
            project_id: currentProjectId,
          },
        ],
      };

      const response = await api.post(
        configApi.API_URL.valvsubtype.addorupdate,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        setValvSubTypes([newValvSubTypeRecord, ...valvSubTypes]);
        setNewValvSubType("");
        setNewCode("");
        setNewCCode("");
        message.success("Valve Sub Type added successfully");
      } else {
        throw new Error("Failed to add valve sub-type.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to add valve sub-type.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  const handleEditField = async (key: string, field: string, value: string) => {
    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentValvSubType = valvSubTypes.find((valvSubType) => valvSubType.key === key);
    if (!currentValvSubType) {
      message.error("Valve Sub Type not found");
      return;
    }

    // Check if value hasn't changed
    const currentValue = field === 'valv_sub_type' ? currentValvSubType.valv_sub_type : currentValvSubType.c_code;
    if (currentValue === value) {
      setEditingKey(null);
      setEditingField(null);
      return;
    }

    // Validate based on field type
    if (field === 'c_code') {
      const duplicateValvSubType = valvSubTypes.find(
        (valvSubType) => valvSubType.c_code === value && valvSubType.key !== key
      );
    
      if (duplicateValvSubType) {
        message.error("Client Code is already in use.");
        return;
      }
      
      if (!codeRegex.test(value)) {
        message.error("Invalid client code. Only A-Z, a-z, and 0-9 are allowed.");
        return;
      }
    } else if (field === 'valv_sub_type') {
      const duplicateValvSubType = valvSubTypes.find(
        (valvSubType) => valvSubType.valv_sub_type === value && valvSubType.key !== key
      );
    
      if (duplicateValvSubType) {
        message.error("Valve Sub Type is already in use.");
        return;
      }

      if (!value.trim()) {
        message.error("Valve Sub Type cannot be empty.");
        return;
      }
    }

    // Update local state optimistically
    const updatedValvSubTypes = valvSubTypes.map((valvSubType) =>
      valvSubType.key === key ? { ...valvSubType, [field]: value } : valvSubType
    );
    setValvSubTypes(updatedValvSubTypes);

    const payload = {
      payload: [{
        valv_sub_type: field === 'valv_sub_type' ? value : currentValvSubType.valv_sub_type,
        code: currentValvSubType.code,
        c_code: field === 'c_code' ? value : currentValvSubType.c_code,
        project_id: currentProjectId,
      }]
    };

    try {
      const response = await api.post(
        configApi.API_URL.valvsubtype.addorupdate,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        const fieldName = field === 'valv_sub_type' ? 'Valve Sub Type' : 'Client Code';
        message.success(`${fieldName} updated successfully`);
        setEditingKey(null);
        setEditingField(null);
      } else {
        throw new Error(`Failed to update ${field}.`);
      }
    } catch (error) {
      const apiError = error as ApiError;
      const fieldName = field === 'valv_sub_type' ? 'valve sub type' : 'client code';
      const errorMessage =
        apiError.response?.data?.error || `Failed to update ${fieldName}.`;
      showToast({ message: errorMessage, type: "error" });

      // Revert changes on error
      setValvSubTypes(
        valvSubTypes.map((valvSubType) =>
          valvSubType.key === key
            ? { ...valvSubType, [field]: editingOriginalValue }
            : valvSubType
        )
      );
      setEditingKey(null);
      setEditingField(null);
    }
  };

  const EditableCell: React.FC<any> = ({
    editable,
    children,
    record,
    dataIndex,
    ...restProps
  }) => {
    const [inputValue, setInputValue] = useState(record?.[dataIndex] || "");

    useEffect(() => {
      if (editable && record) {
        setEditingOriginalValue(record[dataIndex]);
        setInputValue(record[dataIndex]);
      }
    }, [editable, record?.[dataIndex], dataIndex]);

    useEffect(() => {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditingKey(null);
          setEditingField(null);
          return;
        }
      };
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (record) {
          handleEditField(record.key, dataIndex, inputValue);
        }
      }
    };

    const handleDoubleClick = () => {
      if (dataIndex !== 'code') { // Don't allow editing of code field
        setEditingKey(record?.key);
        setEditingField(dataIndex);
      }
    };

    return (
      <td {...restProps}>
        {editable && record ? (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => handleEditField(record.key, dataIndex, inputValue)}
            onKeyPress={handleKeyPress}
            autoFocus
            size="small"
            bordered
          />
        ) : (
          <div 
            onDoubleClick={handleDoubleClick}
            style={{ 
              cursor: dataIndex !== 'code' ? 'pointer' : 'default', 
              padding: '4px 0',
              backgroundColor: dataIndex === 'code' ? '#f5f5f5' : 'transparent'
            }}
            title={dataIndex !== 'code' ? 'Double-click to edit' : 'Read-only field'}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<ValvSubType> = [
      {
          title: <span>Code</span>,
          dataIndex: "code",
          key: "code",
        },
        {
            title: <span>Client Code</span>,
            dataIndex: "c_code",
            key: "c_code",
            onCell: (record: ValvSubType): EditableCellProps => ({
                record,
                editable: editingKey === record.key && editingField === 'c_code',
                dataIndex: "c_code",
            }),
        },
        {
          title: <span>Valve Sub Type</span>,
          dataIndex: "valv_sub_type",
          key: "valv_sub_type",
          onCell: (record: ValvSubType): EditableCellProps => ({
            record,
            editable: editingKey === record.key && editingField === 'valv_sub_type',
            dataIndex: "valv_sub_type",
          }),
        },
  ];

  useEffect(() => {
    fetchValvSubTypes();
  }, [currentProjectId]);

  return (
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Valve Sub Type Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-semibold">Valve Sub Type <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter Valve Sub Type"
                className="w-full"
                value={newValvSubType}
                onChange={(e) => setNewValvSubType(e.target.value)}
                size="middle"
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
                value={newCCode}
                onChange={(e) => setNewCCode(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>
          
          <div className="mt-6 mb-1 flex justify-between items-center">
            <p className="text-gray-500 text-xs">
              Code and Client Code can only include A-Z, a-z, 0-9. Double-click on Client Code or Valve Sub Type to edit.
            </p>
            <Button
              type="primary"
              onClick={handleAddValvSubType}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Valve Sub Type
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : valvSubTypes.length === 0 ? (
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
            className="valv-subtype-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={valvSubTypes}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .valv-subtype-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .valv-subtype-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .valv-subtype-table .ant-table-row:hover {
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

export default ValvSubType;