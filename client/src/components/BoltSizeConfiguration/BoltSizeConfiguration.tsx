import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Table, Input, Button, Form, message, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { Plus } from "lucide-react";
import { ApiError, Size } from "../../utils/interface";

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: Size;
  editable?: boolean;
  field: keyof Size;
}

const BoltSizeConfiguration: React.FC = () => {
  // Sample data for development
  const sampleBoltSizes: Size[] = [
    { key: "1", code: "M6", size1_size2: "6", c_code: "B6", size_inch: "1/4\"", size_mm: "6", od: "10" },
    { key: "2", code: "M8", size1_size2: "8", c_code: "B8", size_inch: "5/16\"", size_mm: "8", od: "13" },
    { key: "3", code: "M10", size1_size2: "10", c_code: "B10", size_inch: "3/8\"", size_mm: "10", od: "16" },
    { key: "4", code: "M12", size1_size2: "12", c_code: "B12", size_inch: "1/2\"", size_mm: "12", od: "18" },
    { key: "5", code: "M16", size1_size2: "16", c_code: "B16", size_inch: "5/8\"", size_mm: "16", od: "24" },
  ];

  const [boltSizes, setBoltSizes] = useState<Size[]>(sampleBoltSizes);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [newSize1_2, setNewSize1_2] = useState("");
  const [newSizeCode, setNewSizeCode] = useState("");
  const [newSizeCCode, setNewSizeCCode] = useState("");
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

  useEffect(() => {
    fetchBoltSizes();
  }, [currentProjectId]);

  const fetchBoltSizes = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const payload = { projectId: currentProjectId };

      const response = await api.post(
        configApi.API_URL.boltSizes.getall,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data && response.data.success) {
        const boltSizesWithKeys = response.data.boltSizes.map((boltSize: Size) => ({
          ...boltSize,
          key: boltSize.code,
          c_code: boltSize.c_code,
        })).sort((a: { size_mm: number }, b: { size_mm: number }) => a.size_mm - b.size_mm);
        setBoltSizes(boltSizesWithKeys);
      } else {
        showToast({ message: "Failed to fetch bolt sizes.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching bolt sizes.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoltSize = async () => {
    const existingFields: string[] = [];

    if (boltSizes.some((boltSize) => boltSize.size1_size2 === newSize1_2)) {
      existingFields.push("Size 1-2");
    }

    if (boltSizes.some((boltSize) => boltSize.code === newSizeCode)) {
      existingFields.push("Code");
    }

    if (boltSizes.some((boltSize) => boltSize.c_code === newSizeCCode)) {
      existingFields.push("Client Code");
    }

    if (boltSizes.some((boltSize) => boltSize.size_inch === newSizeInch)) {
      existingFields.push("Size (inch)");
    }

    if (boltSizes.some((boltSize) => boltSize.size_mm === newSizeMm)) {
      existingFields.push("Size (mm)");
    }

    if (boltSizes.some((boltSize) => boltSize.od === newSizeOd)) {
      existingFields.push("Outer Diameter (OD)");
    }

    if (existingFields.length > 0) {
      message.error(`${existingFields.join(", ")} already in use.`);
      return;
    }

    if (!newSize1_2 || !newSizeCCode || !newSizeCode || !newSizeInch || !newSizeMm || !newSizeOd) {
      message.error("Please Fill all the Fields");
      return;
    }
    if (!sizeCodeRegex.test(newSizeCCode)) {
      message.error("Bolt size code can only include A-Z, a-z, and 0-9.");
      return;
    }
    if (!sizeCodeRegex.test(newSizeCode)) {
      message.error("Bolt size code can only include A-Z, a-z, and 0-9.");
      return;
    }
    if (!sizeInchRegex.test(newSizeInch)) {
      message.error("Invalid bolt size in inches format.");
      return;
    }
    if (!sizeMmRegex.test(newSizeMm)) {
      message.error("Bolt size in mm must be a number.");
      return;
    }

    try {
      if (!currentProjectId) {
        message.error("No current project ID available.");
        return;
      }
      setButtonLoading(true);
      const newBoltSizePayload = {
        projectId: currentProjectId,
        size1_size2: parseInt(newSize1_2),
        code: newSizeCode,
        c_code: newSizeCCode,
        size_inch: newSizeInch,
        size_mm: parseInt(newSizeMm),
        od: newSizeOd,
      };

      const response = await api.post(
        configApi.API_URL.boltSizes.addorupdate,
        newBoltSizePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data.success) {
        const newBoltSize: Size = {
          key: Math.random().toString(36).substring(7),
          size1_size2: newSize1_2,
          code: newSizeCode,
          c_code: newSizeCCode,
          size_inch: newSizeInch,
          size_mm: newSizeMm,
          od: newSizeOd,
        };

        setBoltSizes([newBoltSize, ...boltSizes]);
        setNewSizeCode("");
        setNewSizeCCode("");
        setNewSizeInch("");
        setNewSizeMm("");
        setNewSizeOd("");
        setNewSize1_2("");
        message.success("Bolt size added successfully");
      } else {
        throw new Error("Failed to add bolt size.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to add bolt size.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleEditField = async (key: string, field: keyof Size, value: string | number) => {
    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentBoltSize = boltSizes.find((boltSize) => boltSize.key === key);
    if (!currentBoltSize) {
      message.error("Bolt size not found");
      return;
    }

    const isValueExist = boltSizes.some(
      (boltSize) => boltSize.key !== key && (boltSize[field] === value)
    );

    if (isValueExist) {
      message.error(`${field} value is already in use.`);
      return;
    }

    // Validate the field value before sending the update
    if (field === "c_code" && !sizeCodeRegex.test(value as string)) {
      message.error("Invalid bolt size code");
      return;
    }
    if (field === "size_inch" && !sizeInchRegex.test(value as string)) {
      message.error("Invalid bolt size in inches format");
      return;
    }
    if (field === "size_mm" && !sizeMmRegex.test(value as string)) {
      message.error("Bolt size in mm must be a number.");
      return;
    }

    const updatedBoltSizes = boltSizes.map((boltSize) =>
      boltSize.key === key ? { ...boltSize, [field]: value } : boltSize
    );
    setBoltSizes(updatedBoltSizes);

    const updatedBoltSizePayload = {
      projectId: currentProjectId,
      size1_size2: currentBoltSize.size1_size2,
      code: field === "code" ? value : currentBoltSize.code,
      c_code: field === "c_code" ? value : currentBoltSize.c_code,
      size_inch: field === "size_inch" ? value : currentBoltSize.size_inch,
      size_mm: field === "size_mm" ? value : currentBoltSize.size_mm,
      od: field === "od" ? value : currentBoltSize.od,
    };

    try {
      const response = await api.post(
        configApi.API_URL.boltSizes.addorupdate,
        updatedBoltSizePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data.success) {
        message.success("Bolt size updated successfully");
        setEditingKey(null);
        setEditingField(null);
      } else {
        throw new Error("Failed to update bolt size.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to update bolt size.";
      showToast({ message: errorMessage, type: "error" });

      // Revert the change if the API call fails
      setBoltSizes(
        boltSizes.map((boltSize) =>
          boltSize.key === key ? { ...boltSize, [field]: currentBoltSize[field] } : boltSize
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
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            autoFocus
            size="small"
            bordered
          />
        ) : (
          <div
            onDoubleClick={() => {
              setEditingKey(record?.key);
              setEditingField(field);
            }}
            style={{ cursor: 'pointer', padding: '4px 0' }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<Size> = [
    {
      title: <span>Code</span>,
      dataIndex: "code",
      key: "code",
    },
    {
      title: <span>Size 1-2</span>,
      dataIndex: "size1_size2",
      key: "size1_size2",
    },
    {
      title: <span>Client Code</span>,
      dataIndex: "c_code",
      key: "c_code",
      onCell: (record: Size): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "c_code",
      }),
    },
    {
      title: <span>Size (inch)</span>,
      dataIndex: "size_inch",
      key: "size_inch",
      onCell: (record: Size): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "size_inch",
      }),
    },
    {
      title: <span>Size (mm)</span>,
      dataIndex: "size_mm",
      key: "size_mm",
      onCell: (record: Size): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "size_mm",
      }),
    },
    {
      title: <span>Outer Diameter OD</span>,
      dataIndex: "od",
      key: "od",
      onCell: (record: Size): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "od",
      }),
    },
  ];

  return (
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Bolt Size Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-6 gap-3 mb-3">
            <Form.Item
              label={<span className="font-semibold">Size1_Size2 <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Size1_Size2"
                className="w-full"
                value={newSize1_2}
                onChange={(e) => setNewSize1_2(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Code"
                className="w-full"
                value={newSizeCode}
                onChange={(e) => setNewSizeCode(e.target.value)}
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
                value={newSizeCCode}
                onChange={(e) => setNewSizeCCode(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-6 gap-3">
            <Form.Item
              label={<span className="font-semibold">Size (Inches) <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Size (Inches)"
                className="w-full"
                value={newSizeInch}
                onChange={(e) => setNewSizeInch(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Size (mm) <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Size (mm)"
                className="w-full"
                value={newSizeMm}
                onChange={(e) => setNewSizeMm(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Outer Diameter (OD) <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Outer Diameter (OD)"
                className="w-full"
                value={newSizeOd}
                onChange={(e) => setNewSizeOd(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>
          
          <div className="flex justify-end mt-5 mb-4">
            <Button
              type="primary"
              onClick={handleAddBoltSize}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Bolt Size
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : boltSizes.length === 0 ? (
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
            className="bolt-size-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={boltSizes}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .bolt-size-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .bolt-size-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .bolt-size-table .ant-table-row:hover {
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

export default BoltSizeConfiguration;