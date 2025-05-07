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

const SizeConfiguration: React.FC = () => {
  // Sample data for development
  const sampleSizes: Size[] = [
    { key: "1", code: "a", size1_size2: "0.25", c_code: "Ca", size_inch: "1/4\"", size_mm: "6", od: "13.7" },
    { key: "2", code: "A", size1_size2: "0.5", c_code: "CA", size_inch: "1/2\"", size_mm: "15", od: "21.3" },
    { key: "3", code: "B", size1_size2: "0.75", c_code: "CB", size_inch: "3/4\"", size_mm: "20", od: "26.7" },
    { key: "4", code: "C", size1_size2: "1", c_code: "CC", size_inch: "1\"", size_mm: "25", od: "33.4" },
    { key: "5", code: "D", size1_size2: "1.25", c_code: "CD", size_inch: "1 1/4\"", size_mm: "32", od: "42.2" },
  ];

  const [sizes, setSizes] = useState<Size[]>(sampleSizes);
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
  // const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

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
    fetchSizes();
  }, [currentProjectId]);

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
        })).sort((a: { size_mm: number }, b: { size_mm: number }) => a.size_mm - b.size_mm);
        setSizes(sizesWithKeys);
      } else {
        showToast({ message: "Failed to fetch sizes.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching sizes.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
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

    if (sizes.some((size) => size.size_mm === newSizeMm)) {
      existingFields.push("Size (mm)");
    }

    if (sizes.some((size) => size.od === newSizeOd)) {
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
        c_code: newSizeCCode,
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
          c_code: newSizeCCode,
          size_inch: newSizeInch,
          size_mm: newSizeMm,
          od: newSizeOd,
        };

        setSizes([newSize, ...sizes]);
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
    } finally {
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
      c_code: field === "c_code" ? value : currentSize.c_code,
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

  // const handleSort = (columnKey: keyof Size) => {
  //   if (sortOrder === 'ascend') {
  //     setSortOrder('descend');
  //   } else {
  //     setSortOrder('ascend');
  //   }
  //   setSizes((prevSizes) =>
  //     [...prevSizes].sort((a, b) =>
  //       sortOrder === 'ascend'
  //         ? a[columnKey].toString().localeCompare(b[columnKey].toString())
  //         : b[columnKey].toString().localeCompare(a[columnKey].toString())
  //     )
  //   );
  // };


  return (
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Size Configuration</h1>
        
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
              onClick={handleAddSize}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Size
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : sizes.length === 0 ? (
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
            className="size-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={sizes}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .size-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .size-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .size-table .ant-table-row:hover {
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

export default SizeConfiguration;