/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Spin } from "antd";
import { Table, Input, Button, Form, message } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { Plus } from "lucide-react";

// Types for construction description data
interface ConstructionDesc {
  key: string;
  construction_desc: string;
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
  record: ConstructionDesc;
  editable: boolean;
  dataIndex: string;
}

const ConstructionDesc: React.FC = () => {
  const [constructionDescs, setConstructionDescs] = useState<ConstructionDesc[]>([]);
  const [newConstructionDesc, setNewConstructionDesc] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCCode, setNewCCode] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
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

  const fetchConstructionDescs = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const payload = {
        projectId: currentProjectId,
      };

      const response = await api.post(
        configApi.API_URL.constructiondesc.getAll,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data && response.data.success) {
        const constructionDescsWithKeys = response.data.constructionDescs.map((constructionDesc: any) => ({
          ...constructionDesc,
          key: constructionDesc.code || Math.random().toString(36).substring(7),
        }));
        setConstructionDescs(constructionDescsWithKeys);
      } else {
        showToast({ message: "Failed to fetch construction descriptions.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching construction descriptions.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddConstructionDesc = async () => {
    const duplicateFields: string[] = [];

    if (constructionDescs.some((constructionDesc) => constructionDesc.construction_desc === newConstructionDesc)) {
      duplicateFields.push("Construction Description");
    }
    if (constructionDescs.some((constructionDesc) => constructionDesc.code === newCode)) {
      duplicateFields.push("Code");
    }
    if (constructionDescs.some((constructionDesc) => constructionDesc.c_code === newCCode)) {
      duplicateFields.push("Client Code");
    }

    if (duplicateFields.length > 0) {
      message.error(`${duplicateFields.join(", ")} already in use.`);
      return;
    }
    
    if (!newConstructionDesc || !newCode || !newCCode) {
      message.error("Construction Description, Code, and Client Code are required.");
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

      const newConstructionDescRecord: ConstructionDesc = {
        key: Math.random().toString(36).substring(7),
        construction_desc: newConstructionDesc,
        code: newCode,
        c_code: newCCode,
        project_id: currentProjectId,
      };

      const payload = {
        payload: [
          {
            construction_desc: newConstructionDesc,
            code: newCode,
            c_code: newCCode,
            project_id: currentProjectId,
          },
        ],
      };

      const response = await api.post(
        configApi.API_URL.constructiondesc.addorupdate,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        setConstructionDescs([newConstructionDescRecord, ...constructionDescs]);
        setNewConstructionDesc("");
        setNewCode("");
        setNewCCode("");
        message.success("Construction Description added successfully");
      } else {
        throw new Error("Failed to add construction description.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to add construction description.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  const handleEditField = async (key: string, field: string, value: string) => {
    // Check for duplicates based on the field being edited
    if (field === 'construction_desc') {
      const duplicateConstructionDesc = constructionDescs.find(
        (constructionDesc) => constructionDesc.construction_desc === value && constructionDesc.key !== key
      );
      if (duplicateConstructionDesc) {
        message.error("Construction Description is already in use.");
        return;
      }
    } else if (field === 'c_code') {
      const duplicateConstructionDesc = constructionDescs.find(
        (constructionDesc) => constructionDesc.c_code === value && constructionDesc.key !== key
      );
      if (duplicateConstructionDesc) {
        message.error("Client Code is already in use.");
        return;
      }
      if (!codeRegex.test(value)) {
        message.error("Invalid client code");
        return;
      }
    }

    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentConstructionDesc = constructionDescs.find((constructionDesc) => constructionDesc.key === key);
    if (!currentConstructionDesc) {
      message.error("Construction Description not found");
      return;
    }

    // Check if value actually changed
    if (currentConstructionDesc[field as keyof ConstructionDesc] === value) {
      setEditingKey(null);
      setEditingColumn(null);
      return;
    }

    // Update local state immediately
    const updatedConstructionDescs = constructionDescs.map((constructionDesc) =>
      constructionDesc.key === key ? { ...constructionDesc, [field]: value } : constructionDesc
    );
    setConstructionDescs(updatedConstructionDescs);

    const payload = {
      payload: [{
        construction_desc: field === 'construction_desc' ? value : currentConstructionDesc.construction_desc,
        code: currentConstructionDesc.code,
        c_code: field === 'c_code' ? value : currentConstructionDesc.c_code,
        project_id: currentProjectId,
      }]
    };

    try {
      const response = await api.post(
        configApi.API_URL.constructiondesc.addorupdate,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        message.success(`${field === 'construction_desc' ? 'Construction Description' : 'Client Code'} updated successfully`);
        setEditingKey(null);
        setEditingColumn(null);
      } else {
        throw new Error(`Failed to update ${field}.`);
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || `Failed to update ${field}.`;
      showToast({ message: errorMessage, type: "error" });

      // Revert the change on error
      setConstructionDescs(
        constructionDescs.map((constructionDesc) =>
          constructionDesc.key === key
            ? { ...constructionDesc, [field]: editingOriginalValue }
            : constructionDesc
        )
      );
      setEditingKey(null);
      setEditingColumn(null);
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
          setEditingColumn(null);
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
        if (record && dataIndex) {
          handleEditField(record.key, dataIndex, inputValue);
        }
      }
    };

    const handleBlur = () => {
      if (record && dataIndex) {
        handleEditField(record.key, dataIndex, inputValue);
      }
    };

    const handleDoubleClick = () => {
      if (record?.key && dataIndex) {
        setEditingKey(record.key);
        setEditingColumn(dataIndex);
      }
    };

    return (
      <td {...restProps}>
        {editable && record ? (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            autoFocus
            size="small"
            bordered
          />
        ) : (
          <div 
            onDoubleClick={handleDoubleClick}
            style={{ cursor: 'pointer', padding: '4px 0' }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<ConstructionDesc> = [
    {
      title: <span>Code</span>,
      dataIndex: "code",
      key: "code",
    },
    {
      title: <span>Client Code</span>,
      dataIndex: "c_code",
      key: "c_code",
      onCell: (record: ConstructionDesc): EditableCellProps => ({
        record,
        dataIndex: "c_code",
        editable: editingKey === record.key && editingColumn === "c_code",
      }),
    },
    {
        title: <span>Construction Description</span>,
        dataIndex: "construction_desc",
        key: "construction_desc",
        onCell: (record: ConstructionDesc): EditableCellProps => ({
          record,
          dataIndex: "construction_desc",
          editable: editingKey === record.key && editingColumn === "construction_desc",
        }),
      },
  ];

  useEffect(() => {
    fetchConstructionDescs();
  }, [currentProjectId]);

  return (
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Construction Description Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-semibold">Construction Description <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter Construction Description"
                className="w-full"
                value={newConstructionDesc}
                onChange={(e) => setNewConstructionDesc(e.target.value)}
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
              Code and Client Code can only include A-Z, a-z, 0-9. Double-click to edit Construction Description and Client Code.
            </p>
            <Button
              type="primary"
              onClick={handleAddConstructionDesc}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Construction Description
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : constructionDescs.length === 0 ? (
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
            className="construction-desc-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={constructionDescs}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .construction-desc-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .construction-desc-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .construction-desc-table .ant-table-row:hover {
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

export default ConstructionDesc;