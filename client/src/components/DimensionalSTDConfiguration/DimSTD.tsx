import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Table, Input, Button, Form, message, Spin, Select } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { Plus } from "lucide-react";
import { ApiError } from "../../utils/interface";

const { Option } = Select;

interface DimStd {
  key: string;
  id?: string;
  g_type: string;
  dim_std: string;
  project_id?: string;
}

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: DimStd;
  editable?: boolean;
  field: keyof DimStd;
}

const DimStdConfiguration: React.FC = () => {
  // Available g_types
  const gTypeOptions = [
    { value: "PIPE", label: "PIPE" },
    { value: "NIPPLE", label: "NIPPLE" },
    { value: "FLANGE", label: "FLANGE" },
    { value: "SPECTACLE BLIND", label: "SPECTACLE BLIND" },
    { value: "ELBOW", label: "ELBOW" },
    { value: "TEE", label: "TEE" },
    { value: "REDUCER", label: "REDUCER" },
    { value: "CAP", label: "CAP" },
    { value: "COUPLING", label: "COUPLING" },
    { value: "VALV", label: "VALV" },
    { value: "BOLT", label: "BOLT" },
    { value: "GASKET", label: "GASKET" },
    { value: "TRAP", label: "TRAP" },
    { value: "FILT", label: "FILT" },
    { value: "BEND", label: "BEND" },
    { value: "BUSH", label: "BUSH" },
    { value: "CROP", label: "CROP" },
    { value: "LJSE", label: "LJSE" },
    { value: "UNION", label: "UNION" },
    { value: "SPACER & BLIND", label: "SPACER & BLIND" },
    { value: "SPACER", label: "SPACER" },
    { value: "SPADE", label: "SPADE" },
    { value: "PLUG", label: "PLUG" },
    { value: "CROSS", label: "CROSS" },
    { value: "OLET", label: "OLET" },
  ];

  const [dimStds, setDimStds] = useState<DimStd[]>([]);
  const [selectedGType, setSelectedGType] = useState<string>("PIPE");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [newDimStd, setNewDimStd] = useState("");

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
    if (currentProjectId && selectedGType) {
      fetchDimStds();
    }
  }, [currentProjectId, selectedGType]);

  const fetchDimStds = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const payload = { 
        gType: selectedGType, 
        projectId: currentProjectId 
      };

      const response = await api.post(
        configApi.API_URL.dimensionalstandards.getbygtype,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data && response.data.success) {
        const dimStdsWithKeys = response.data.dimStds.map((dimStd: DimStd) => ({
          ...dimStd,
          key: dimStd.id || Math.random().toString(36).substring(7)
        }));
        setDimStds(dimStdsWithKeys);
      } else {
        showToast({ message: "Failed to fetch dimension standards.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching dimension standards.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGTypeChange = (value: string) => {
    setSelectedGType(value);
  };

  const handleAddDimStd = async () => {
    if (!newDimStd) {
      message.error("Please enter dimension standard value");
      return;
    }

    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const existingDimStd = dimStds.some(
      (dimStd) => dimStd.dim_std === newDimStd
    );

    if (existingDimStd) {
      message.error("This dimension standard already exists for the selected type.");
      return;
    }

    try {
      setButtonLoading(true);
      const payload = [{
        g_type: selectedGType,
        dim_std: newDimStd,
        project_id: currentProjectId
      }];

      const response = await api.post(
        configApi.API_URL.dimensionalstandards.addorupdate,
        { payload },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data && response.data.success) {
        const newDimStdItem: DimStd = {
          key: Math.random().toString(36).substring(7),
          g_type: selectedGType,
          dim_std: newDimStd,
          project_id: currentProjectId
        };

        setDimStds([...dimStds, newDimStdItem]);
        setNewDimStd("");
        message.success("Dimension standard added successfully");
      } else {
        throw new Error("Failed to add dimension standard.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to add dimension standard.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleEditField = async (key: string, field: keyof DimStd, value: string) => {
    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentDimStd = dimStds.find((dimStd) => dimStd.key === key);
    if (!currentDimStd) {
      message.error("Dimension standard not found");
      return;
    }

    const isValueExist = dimStds.some(
      (dimStd) => dimStd.key !== key && dimStd[field] === value
    );

    if (isValueExist) {
      message.error(`This ${field} value is already in use.`);
      return;
    }

    const updatedDimStds = dimStds.map((dimStd) =>
      dimStd.key === key ? { ...dimStd, [field]: value } : dimStd
    );
    setDimStds(updatedDimStds);

    try {
      const payload = [{
        g_type: currentDimStd.g_type,
        dim_std: field === "dim_std" ? value : currentDimStd.dim_std,
        project_id: currentProjectId
      }];

      const response = await api.post(
        configApi.API_URL.dimensionalstandards.addorupdate,
        { payload },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response && response.data && response.data.success) {
        message.success("Dimension standard updated successfully");
        setEditingKey(null);
        setEditingField(null);
      } else {
        throw new Error("Failed to update dimension standard.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to update dimension standard.";
      showToast({ message: errorMessage, type: "error" });

      // Revert the change if the API call fails
      setDimStds(
        dimStds.map((dimStd) =>
          dimStd.key === key ? { ...dimStd, [field]: currentDimStd[field] } : dimStd
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
        handleEditField(record.key, field, localInputValue!);
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

  const columns: ColumnsType<DimStd> = [
    {
      title: <span>Type</span>,
      dataIndex: "g_type",
      key: "g_type",
    },
    {
      title: <span>Dimension Standard</span>,
      dataIndex: "dim_std",
      key: "dim_std",
      onCell: (record: DimStd): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        field: "dim_std",
      }),
    }
  ];

  return (
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Dimension Standard Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Form.Item
              label={<span className="font-semibold">Type <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-1"
            >
              <Select
                value={selectedGType}
                onChange={handleGTypeChange}
                className="w-full"
                size="middle"
              >
                {gTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Dimension Standard <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-1"
            >
              <Input
                placeholder="Enter dimension standard"
                className="w-full"
                value={newDimStd}
                onChange={(e) => setNewDimStd(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>
          
          <div className="flex justify-end mt-5 mb-4">
            <Button
              type="primary"
              onClick={handleAddDimStd}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Dimension Standard
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : dimStds.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-400">
            <div className="text-center mb-3">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>No dimension standards found for this type</p>
          </div>
        ) : (
          <Table
            className="dimstd-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={dimStds}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .dimstd-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .dimstd-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .dimstd-table .ant-table-row:hover {
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

export default DimStdConfiguration;