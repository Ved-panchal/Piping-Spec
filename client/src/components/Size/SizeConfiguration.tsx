import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Table, Input, Button, Form, message,Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { ApiError, Size } from "../../utils/interface";

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: Size;
  editable?: boolean;
  field:keyof Size;
}

const SizeConfiguration: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [newSize1_2,setNewSize1_2] = useState("");
  const [newSizeCode, setNewSizeCode] = useState("");
  const [newSizeCCode, setNewSizeCCode] = useState("");
  const [newSizeInch, setNewSizeInch] = useState("");
  const [newSizeMm, setNewSizeMm] = useState("");
  const [newSizeOd, setNewSizeOd] = useState("");
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

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
        const sizesWithKeys = response.data.sizes.map((size: Size) => ({
          ...size,
          key: size.code,
          c_code: size.c_code,
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

    const existingFields: string[] = [];

        if (sizes.some((size) => size.size1_size2 === newSize1_2)) {
          existingFields.push("Size 1-2");
        }

        if (sizes.some((size) => size.code === newSizeCode)) {
          existingFields.push("Code");
        }

        if (sizes.some((size) => size.c_code === newSizeCCode)) {
          existingFields.push("Client Code");
        }

        if (sizes.some((size) => size.size_inch === newSizeInch)) {
          existingFields.push("Size (inch)");
        }

        if (sizes.some((size) => size.size_mm === parseInt(newSizeMm))) {
          existingFields.push("Size (mm)");
        }

        if (sizes.some((size) => size.od === newSizeOd)) {
          existingFields.push("Outer Diameter (OD)");
        }

        if (existingFields.length > 0) {
          message.error(`${existingFields.join(", ")} already in use.`);
          return;
        }

    if(!newSize1_2 || !newSizeCCode || !newSizeCode || !newSizeInch || !newSizeMm || !newSizeOd){
      message.error("Please Fill all the Fields");
      return;
    }
    if (!sizeCodeRegex.test(newSizeCCode)) {
      message.error("Size code can only include A-Z, a-z, and 0-9.");
      return;
    }
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
      setButtonLoading(true);
      const newSizePayload = {
        projectId: currentProjectId,
        size1_size2: parseInt(newSize1_2),
        code: newSizeCode,
        c_code:newSizeCCode,
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
          c_code:newSizeCCode,
          size_inch: newSizeInch,
          size_mm: parseInt(newSizeMm),
          od: newSizeOd,
        };
        
        setSizes([ newSize,...sizes]);
        setNewSizeCode("");
        setNewSizeCCode("");
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
    } finally{
      setButtonLoading(false);
    }
  };

  const handleEditField = async (key: string, field: keyof Size, value: string | number) => {
    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentSize = sizes.find((size) => size.key === key);
    if (!currentSize) {
      message.error("Size not found");
      return;
    }

    const isValueExist = sizes.some(
      (size) => size.key !== key && (size[field] === value)
    );
  
    if (isValueExist) {
      message.error(`${field} value is already in use.`);
      return;
    }

    // Validate the field value before sending the update
    if (field === "c_code" && !sizeCodeRegex.test(value as string)) {
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
      c_code:field === "c_code" ? value : currentSize.c_code,
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

  const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    field,
    children,
    record,
    ...restProps
  }) => {
    const inputValue = record ? record[field] : '';
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
            autoFocus
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
      title: (
        <div onDoubleClick={() => handleSort('code')}>
          Code
        </div>
      ),
      dataIndex: "code",
      key: "code",
    },
    {
      
      title: (
        <div onDoubleClick={() => handleSort('size1_size2')}>
          Size 1-2
        </div>
      ),
      dataIndex: "size1_size2",
      key: "size1_size2",
    },
    {
      title: (
        <div onDoubleClick={() => handleSort('c_code')}>
          Client Code
        </div>
      ),
      dataIndex: "c_code",
      key: "c_code",
      onCell: (record: Size):EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "c_code",
      }),
    },
    {
      title: (
        <div onDoubleClick={() => handleSort('size_inch')}>
          Size (inch)
        </div>
      ),
      dataIndex: "size_inch",
      key: "size_inch",
      onCell: (record: Size):EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "size_inch",
      }),
    },
    {
      title: (
        <div onDoubleClick={() => handleSort('size_mm')}>
          Size (mm)
        </div>
      ),
      dataIndex: "size_mm",
      key: "size_mm",
      onCell: (record: Size):EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "size_mm",
      }),
    },
    {
      title: (
        <div onDoubleClick={() => handleSort('od')}>
          Outer Diameter OD
        </div>
      ),
      dataIndex: "od",
      key: "od",
      onCell: (record: Size):EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "od",
      }),
    },
  ];

  const handleSort = (columnKey: keyof Size) => {
    if (sortOrder === 'ascend') {
      setSortOrder('descend');
    } else {
      setSortOrder('ascend');
    }
    setSizes((prevSizes) =>
      [...prevSizes].sort((a, b) =>
        sortOrder === 'ascend'
          ? a[columnKey].toString().localeCompare(b[columnKey].toString())
          : b[columnKey].toString().localeCompare(a[columnKey].toString())
      )
    );
  };

  useEffect(() => {
    fetchSizes();
  }, [currentProjectId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Size Configuration</h2>
      <Form className="gap-2" layout="inline" style={{ marginBottom: "10px", marginTop: "10px" }}>
        <Form.Item>
          <Input
            placeholder="Size1_Size2"
            value={newSize1_2}
            onChange={(e) => setNewSize1_2(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Code"
            value={newSizeCode}
            onChange={(e) => setNewSizeCode(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Client Code"
            value={newSizeCCode}
            onChange={(e) => setNewSizeCCode(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Size (Inches)"
            value={newSizeInch}
            onChange={(e) => setNewSizeInch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Size (mm)"
            value={newSizeMm}
            onChange={(e) => setNewSizeMm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Outer Diameter (OD)"
            value={newSizeOd}
            onChange={(e) => setNewSizeOd(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
          />
        </Form.Item>
      </Form>

      {/* Centered button */}
      <div className="mb-[15px] flex justify-center">
        <Button type="primary" onClick={handleAddSize}>
          {
            buttonLoading ? <Spin/> : "Add Size"
          }
        </Button>
      </div>


      <Table
      className="select-none"
        columns={columns}
        components={{
            body: {
              cell: EditableCell,
            },
          }}
        dataSource={sizes}
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default SizeConfiguration;
