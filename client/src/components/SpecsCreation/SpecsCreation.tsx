/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Form, 
  message, 
  Select, 
  Checkbox,
} from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { Trash2, Plus, Edit2, Copy } from "lucide-react";
import deleteWithBody from "../../utils/api/DeleteAxios";
import ConfirmationModal from "../ConfirmationDeleteModal/CornfirmationModal";
import { Rating } from "../../utils/interface";

const { Option } = Select;
// const { Title, Text } = Typography;

interface Spec {
  key: string;
  specName: string;
  rating: string;
  baseMaterial: string;
}

interface DeleteResponse {
  data: {
    success: boolean;
    message: string;
    error?: string;
  };
}

interface ApiError extends Error {
      error?: string;
      status?: number;
}

interface EditableCellProps extends TdHTMLAttributes<any> {
  record: Spec;
  editable: boolean;
  dataIndex: keyof Spec;
}

const SpecsCreation: React.FC = () => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [newspecName, setNewspecName] = useState("");
  const [newRating, setNewRating] = useState<string | undefined>(undefined);
  const [newBaseMaterial, setNewBaseMaterial] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  // const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);
  const [, setFormSubmitted] = useState(false);
  const [ratingOptions, setRatingOptions] = useState<string[]>(["150#", "300#", "6000#"]); // Sample data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<Spec | null>(null);
  const [selectedSpecToCopy, setSelectedSpecToCopy] = useState<string | null>(null);
  const [isCopyMode, setIsCopyMode] = useState(false);

  // Base material options
  const baseMaterialOptions = [
    "CA", "CS", "CS-NACE", "CSGLV", "CUNI", "DD", "DD-NACE", 
    "GRE", "INC", "INC-NACE", "LTCS", "LTCS-NACE", "NM", 
    "RB", "SA", "SA-NACE", "SAGLV", "SD", "SD-NACE", "SI", 
    "SS", "SS-NACE"
  ];

  // Fetch project ID from local storage
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

  // Fetch specs
  const fetchSpecs = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const response = await api.get(
        `${configApi.API_URL.specs.getAllSpecsByProject}/${currentProjectId}`
      );

      if (response && response.data && response.data.success) {
        const specsWithKeys = response.data.specs.map((spec: any) => ({
          ...spec,
          key: spec.id,
        }));
        setSpecs(specsWithKeys);
      } else {
        showToast({ message: "Failed to fetch specs.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.error || "Error fetching specs.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch ratings from API
  const fetchRatings = async () => {
    if (!currentProjectId) return;
    try {
      const response = await api.post(configApi.API_URL.ratings.getAll, {
        projectId: currentProjectId,
      });
      if (response.data.success) {
        // Extract only the ratingValue for the dropdown
        const ratings = response.data.ratings.map(
          (rating: Rating) => rating.ratingValue
        );
        setRatingOptions(ratings); // Set ratings options from API
      } else {
        throw new Error(response.data);
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.error || "Failed to fetch ratings from API.";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  // Fetch ratings when project ID is set
  useEffect(() => {
    if (currentProjectId) {
      fetchRatings();
    }
  }, [currentProjectId]);

  // Handle add new spec
  const handleAddSpec = async () => {
    setFormSubmitted(true);

    if (!newspecName || !newRating || !newBaseMaterial) {
      message.error("Spec Code, Rating, and Base Material are required.");
      return;
    }

    try {
      if (!currentProjectId) {
        message.error("No current project ID available.");
        return;
      }

      const newSpec: Spec = {
        key: Math.random().toString(36).substring(7),
        specName: newspecName,
        rating: newRating,
        baseMaterial: newBaseMaterial,
      };

      const payload = {
        specName: newSpec.specName,
        rating: newSpec.rating,
        baseMaterial: newSpec.baseMaterial,
        projectId: currentProjectId,
        existing_specId: selectedSpecToCopy,
      };

      const response = await api.post(configApi.API_URL.specs.create, payload, {
        headers: { "Content-Type": "application/json" },
      });
      // console.log(response.data)
      if (response && response.data.success) {
        setSpecs([...specs, newSpec]);
        setNewspecName("");
        setNewRating(undefined);
        setNewBaseMaterial(undefined);
        setSelectedSpecToCopy(null); // Reset selected spec after successful creation
        setFormSubmitted(false);
        setIsCopyMode(false);
        message.success("Spec added successfully");
        await fetchSpecs();
      } else {
        // throw new Error(response.data.error);
      showToast({ message: response.data.error, type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.log(apiError.error)
      const errorMessage = apiError.error || "Failed to add spec.";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  // Handle editing spec
  const handleEditSpec = async (
    key: string,
    specName: string,
    rating: string,
    baseMaterial: string
  ) => {
    if (!specName || !rating || !baseMaterial) {
      message.error("Spec Code, Rating, and Base Material cannot be empty.");
      return;
    }

    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const originalSpecs = [...specs];
    const updatedSpecs = specs.map((spec) =>
      spec.key === key ? { ...spec, specName, rating, baseMaterial } : spec
    );
    setSpecs(updatedSpecs);
    setEditingKey(null);
    setEditingColumn(null);

    const payload = {
      specId: key,
      specName,
      rating,
      baseMaterial,
      currentProjectId,
    };

    try {
      const response = await api.put(
        `${configApi.API_URL.specs.update}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        message.success("Spec updated successfully");
      } else {
        // throw new Error(response.data.error);
      showToast({ message: response.data.error, type: "error" });
      }
    } catch (error) {
      setSpecs(originalSpecs);
      const apiError = error as ApiError;
      const errorMessage =
        apiError.error || "Failed to update spec.";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  const handleDeleteSpec = async (key: string) => {
    if (!key) return;

    const plan = JSON.parse(localStorage.getItem("plan")!);
    if (plan.planId === 1) {
      showToast({
        message:
          "You cannot delete specs under the free plan. Upgrade to premium.",
        type: "error",
      });
      return;
    }

    const payload = {
      specId: key,
    };

    try {
      const response = await deleteWithBody<DeleteResponse>(
        `${configApi.API_URL.specs.delete}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        const updatedSpecs = specs.filter((spec) => spec.key !== key);
        setSpecs(updatedSpecs);
        message.success("Spec deleted successfully");
        setIsModalOpen(false);
      } else {
        setIsModalOpen(false);
        throw new Error("Failed to delete spec.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.error || "Failed to delete spec.";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  // Editable cell component
  const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    children,
    record,
    dataIndex,
    ...restProps
  }) => {
    const inputValue = record ? record[dataIndex] : "";
    const [localInputValue, setLocalInputValue] = useState(inputValue);

    const handleBlur = () => {
      if (localInputValue === inputValue) {
        setEditingKey(null);
        setEditingColumn(null);
        return;
      }

      if (
        dataIndex === "specName" ||
        dataIndex === "rating" ||
        dataIndex === "baseMaterial"
      ) {
        handleEditSpec(
          record?.key,
          dataIndex === "specName" ? localInputValue : record?.specName,
          dataIndex === "rating" ? localInputValue : record?.rating,
          dataIndex === "baseMaterial" ? localInputValue : record?.baseMaterial
        );
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleBlur();
      }
    };

    useEffect(() => {
      setLocalInputValue(inputValue);
    }, [inputValue]);

    return (
      <td {...restProps}>
        {editable ? (
          dataIndex === "rating" ? (
            <Select
              value={localInputValue}
              onChange={(value) => setLocalInputValue(value)}
              onBlur={handleBlur}
              autoFocus
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              size="small"
              bordered
            >
              {ratingOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          ) : dataIndex === "baseMaterial" ? (
            <Select
              value={localInputValue}
              onChange={(value) => setLocalInputValue(value)}
              onBlur={handleBlur}
              autoFocus
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              size="small"
              bordered
            >
              {baseMaterialOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          ) : (
            <Input
              value={localInputValue}
              onChange={(e) => setLocalInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              autoFocus
              size="small"
              bordered
            />
          )
        ) : (
          <div
            onDoubleClick={() => {
              setEditingKey(record?.key);
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

  const columns: ColumnsType<Spec> = [
    {
      title: <span>Spec Code</span>,
      dataIndex: "specName",
      key: "specName",
      onCell: (record: Spec): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "specName",
        dataIndex: "specName",
      }),
    },
    {
      title: <span>Rating</span>,
      dataIndex: "rating",
      key: "rating",
      onCell: (record: Spec): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "rating",
        dataIndex: "rating",
      }),
    },
    {
      title: <span>Base Material</span>,
      dataIndex: "baseMaterial",
      key: "baseMaterial",
      onCell: (record: Spec): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "baseMaterial",
        dataIndex: "baseMaterial",
      }),
    },
    {
      title: <span>Actions</span>,
      key: "action",
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            type="text"
            style={{ padding: 4 }}
            onClick={() => {
              setEditingKey(record.key);
              setEditingColumn("specName");
            }}
          >
            <Edit2 size={16} color="#1890ff" />
          </Button>
          <Button
            type="text"
            style={{ padding: 4 }}
            onClick={() => {
              setSpecToDelete(record);
              setIsModalOpen(true);
            }}
          >
            <Trash2 size={16} color="#ff4d4f" />
          </Button>
          <Button
            type="text"
            style={{ padding: 4 }}
            onClick={() => {
              setSelectedSpecToCopy(record.key);
              setIsCopyMode(true);
              setNewspecName("");
              setNewRating(record.rating);
              setNewBaseMaterial(record.baseMaterial);
            }}
          >
            <Copy size={16} color="#52c41a" />
          </Button>
        </div>
      ),
    },
  ];

  // Fetch specs when project ID changes
  useEffect(() => {
    fetchSpecs();
  }, [currentProjectId]);

  // Handle sorting functionality
  // const handleSort = (columnKey: keyof Spec) => {
  //   setSortOrder((prev) => (prev === "ascend" ? "descend" : "ascend"));
  //   setSpecs((prevSpecs) =>
  //     [...prevSpecs].sort((a, b) =>
  //       sortOrder === "ascend"
  //         ? a[columnKey].localeCompare(b[columnKey])
  //         : b[columnKey].localeCompare(a[columnKey])
  //     )
  //   );
  // };

  // Handler for spec selection
  const handleSpecSelect = (specId: string) => {
    setSelectedSpecToCopy(specId);
    const selectedSpec = specs.find((spec) => spec.key === specId);
    if (selectedSpec) {
      setNewRating(selectedSpec.rating);
      setNewBaseMaterial(selectedSpec.baseMaterial);
    }
  };

  return (
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-3">Specs Management</h1>
        
        <Form layout="horizontal" className="mb-0">
          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-semibold">Spec Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-1"
            >
              <Input
                placeholder="Enter Spec Code"
                value={newspecName}
                onChange={(e) => setNewspecName(e.target.value)}
                className="w-full"
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Rating <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-1"
            >
              <Select
                placeholder="Select Rating"
                value={newRating}
                onChange={(value) => setNewRating(value)}
                className="w-full"
                size="middle"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {ratingOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Base Material <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-1"
            >
              <Select
                placeholder="Select Base Material"
                value={newBaseMaterial}
                onChange={(value) => setNewBaseMaterial(value)}
                className="w-full"
                size="middle"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {baseMaterialOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          {isCopyMode && (
            <div className="mt-3">
              <Form.Item
                label={<span className="font-semibold">Copy From <span className="text-red-500">*</span></span>}
                colon={false}
                className="mb-1 w-72"
              >
                <Select
                  value={selectedSpecToCopy}
                  onChange={handleSpecSelect}
                  placeholder="Select spec to copy from"
                  className="w-full"
                  size="middle"
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                >
                  {specs.map((spec) => (
                    <Option key={spec.key} value={spec.key}>
                      {spec.specName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 mb-5">
            <Checkbox
              checked={isCopyMode}
              onChange={(e) => setIsCopyMode(e.target.checked)}
              className="mr-4"
            >
              Copy Existing Spec
            </Checkbox>

            <Button
              type="primary"
              onClick={handleAddSpec}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              {isCopyMode ? "Copy Spec" : "Add Spec"}
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        <Table
          dataSource={specs}
          columns={columns}
          loading={loading}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          pagination={false} 
          rowClassName={() => "editable-row"}
          bordered
          size="small"
          className="specs-table"
        />
        
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            if (specToDelete) {
              handleDeleteSpec(specToDelete.key);
            }
          }}
          title="Delete Specification"
          message={`Are you sure you want to delete the specification ${specToDelete?.specName}?`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>

      <style>
        {`
        .specs-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .specs-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .editable-row:hover {
          background-color: #f5f5f5;
        }
        `}
      </style>
    </div>
  );
};

export default SpecsCreation;