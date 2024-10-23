import React, { useState, useEffect } from "react";
import { Table, Input, Button, Form, message } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";

// Types for size data
interface Size {
  key: string;
  size1_size2: string;
  code: string;
  size_inch: string;
  size_mm: number;
  od: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

const SizeConfiguration: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newSize1_2,setNewSize1_2] = useState("");
  const [newSizeCode, setNewSizeCode] = useState("");
  const [newSizeInch, setNewSizeInch] = useState("");
  const [newSizeMm, setNewSizeMm] = useState("");
  const [newSizeOd, setNewSizeOd] = useState("");

  const sizeCodeRegex = /^[A-Za-z0-9]+$/;
  const sizeInchRegex = /^(?<=)[\d\\/\d" ]*(?=)/;
  const sizeMmRegex = /^\d+$/;

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

  const fetchSizes = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const payload = { projectId: currentProjectId };

      const response = await api.post(
        configApi.API_URL.sizes.getall,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data && response.data.success) {
        const sizesWithKeys = response.data.sizes.map((size: any) => ({
          ...size,
          key: size.id,
        }));
        setSizes(sizesWithKeys);
        setLoading(false);
      } else {
        showToast({ message: "Failed to fetch sizes.", type: "error" });
        setLoading(false);
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching sizes.";
      showToast({ message: errorMessage, type: "error" });
      setLoading(false);
    }
  };

  const handleAddSize = async () => {
    if (!sizeCodeRegex.test(newSizeCode)) {
      message.error("Size code can only include A-Z, a-z, and 0-9.");
      return;
    }
    if (!sizeInchRegex.test(newSizeInch)) {
      message.error("Invalid size in inches format.");
      return;
    }
    if (!sizeMmRegex.test(newSizeMm)) {
      message.error("Size in mm must be a number.");
      return;
    }
  
    try {
      if (!currentProjectId) {
        message.error("No current project ID available.");
        return;
      }
  
      const newSizePayload = {
        projectId: currentProjectId,
        size1_size2: parseInt(newSize1_2),
        code: newSizeCode,
        size_inch: newSizeInch,
        size_mm: parseInt(newSizeMm),
        od: newSizeOd,
      };
  
      const response = await api.post(
        configApi.API_URL.sizes.addorupdate,
        newSizePayload,
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response && response.data.success) {
        const newSize: Size = {
          key: Math.random().toString(36).substring(7),
          size1_size2: newSize1_2,
          code: newSizeCode,
          size_inch: newSizeInch,
          size_mm: parseInt(newSizeMm),
          od: newSizeOd,
        };
        
        setSizes([...sizes, newSize]);
        setNewSizeCode("");
        setNewSizeInch("");
        setNewSizeMm("");
        setNewSizeOd("");
        setNewSize1_2("");
        message.success("Size added successfully");
      } else {
        throw new Error("Failed to add size.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to add size.";
      showToast({ message: errorMessage, type: "error" });
    }
  };
  


  const handleEditField = async (key: string, field: string, value: string | number) => {
    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentSize = sizes.find((size) => size.key === key);
    if (!currentSize) {
      message.error("Size not found");
      return;
    }

    // Validate the field value before sending the update
    if (field === "code" && !sizeCodeRegex.test(value as string)) {
      message.error("Invalid size code");
      return;
    }
    if (field === "size_inch" && !sizeInchRegex.test(value as string)) {
      message.error("Invalid size in inches format");
      return;
    }
    if (field === "size_mm" && !sizeMmRegex.test(value as string)) {
      message.error("Size in mm must be a number.");
      return;
    }

    const updatedSizes = sizes.map((size) =>
      size.key === key ? { ...size, [field]: value } : size
    );
    setSizes(updatedSizes);


    const updatedSizePayload = {
      projectId: currentProjectId,
      size1_size2: currentSize.size1_size2,
      code: field === "code" ? value : currentSize.code,
      size_inch: field === "size_inch" ? value : currentSize.size_inch,
      size_mm: field === "size_mm" ? value : currentSize.size_mm,
      od: field === "od" ? value : currentSize.od,
    };

    try {
      const response = await api.post(
        configApi.API_URL.sizes.addorupdate,
        updatedSizePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data.success) {
        message.success("Size updated successfully");
        setEditingKey(null);
        setEditingField(null);
      } else {
        throw new Error("Failed to update size.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to update size.";
      showToast({ message: errorMessage, type: "error" });

      // Revert the change if the API call fails
      setSizes(
        sizes.map((size) =>
          size.key === key ? { ...size, [field]: currentSize[field] } : size
        )
      );
      setEditingKey(null);
      setEditingField(null);
    }
  };

  const EditableCell: React.FC<any> = ({
    editable,
    field,
    children,
    record,
    ...restProps
  }) => {
    const inputValue = record ? record[field] : '';
    const [localInputValue, setLocalInputValue] = useState(inputValue);
  
    const handleBlur = () => {
      if (localInputValue === inputValue) {
        setEditingKey(null);
        setEditingField(null);
        return;
      }
      if (record) {
        handleEditField(record.key, field, localInputValue);
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
        {editable && editingField === field ? (
          <Input
            value={localInputValue}
            onChange={(e) => setLocalInputValue(e.target.value)}
            onBlur={handleBlur} // Applying handleBlur here
            onKeyPress={handleKeyPress}
          />
        ) : (
          <div
            onDoubleClick={() => {
              setEditingKey(record?.key);
              setEditingField(field);
            }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };
  

  const columns: ColumnsType<Size> = [
    {
      title: "Size 1-2",
      dataIndex: "size1_size2",
      key: "size1_size2",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      editable: true,
      onCell: (record: Size) => ({
        record,
        editable: editingKey === record.key,
        field: "code",
      }),
    },
    {
      title: "Size (Inch)",
      dataIndex: "size_inch",
      key: "size_inch",
      editable: true,
      onCell: (record: Size) => ({
        record,
        editable: editingKey === record.key,
        field: "size_inch",
      }),
    },
    {
      title: "Size (mm)",
      dataIndex: "size_mm",
      key: "size_mm",
      editable: true,
      onCell: (record: Size) => ({
        record,
        editable: editingKey === record.key,
        field: "size_mm",
      }),
    },
    {
      title: "Outer Diameter (OD)",
      dataIndex: "od",
      key: "od",
      editable: true,
      onCell: (record: Size) => ({
        record,
        editable: editingKey === record.key,
        field: "od",
      }),
    },
  ];

  useEffect(() => {
    fetchSizes();
  }, [currentProjectId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Size Configuration</h2>
      <Form layout="inline" style={{ marginBottom: "20px", marginTop: "10px" }}>
      <Form.Item>
          <Input
            placeholder="Size1_Size2"
            value={newSize1_2}
            onChange={(e) => setNewSize1_2(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Code"
            value={newSizeCode}
            onChange={(e) => setNewSizeCode(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Size (Inches)"
            value={newSizeInch}
            onChange={(e) => setNewSizeInch(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Size (mm)"
            value={newSizeMm}
            onChange={(e) => setNewSizeMm(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Outer Diameter (OD)"
            value={newSizeOd}
            onChange={(e) => setNewSizeOd(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleAddSize}>Add Size</Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        components={{
            body: {
              cell: EditableCell,
            },
          }}
        dataSource={sizes}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default SizeConfiguration;
