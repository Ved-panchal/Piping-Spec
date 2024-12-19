/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Table, Input, Button, Form, message, Select } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { InfoIcon, Trash2 } from "lucide-react";
import deleteWithBody from "../../utils/api/DeleteAxios";
import ConfirmationModal from "../ConfirmationDeleteModal/CornfirmationModal";
import { Rating } from "../../utils/interface";

const { Option } = Select;

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
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

interface EditableCellProps extends TdHTMLAttributes<any> {
  record: Spec;
  editable: boolean;
  dataIndex: keyof Spec;
}

const SpecsCreation: React.FC = () => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [newspecName, setNewspecName] = useState("");
  const [newRating, setNewRating] = useState("Rating");
  const [newBaseMaterial, setNewBaseMaterial] = useState("Base Material");
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);
  const [, setFormSubmitted] = useState(false);
  const [ratingOptions, setRatingOptions] = useState<string[]>([]); // State for rating options
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<Spec | null>(null);
  const [selectedSpecToCopy, setSelectedSpecToCopy] = useState<string | null>(null);

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
        apiError.response?.data?.error || "Error fetching specs.";
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
        throw new Error("Failed to fetch ratings.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to fetch ratings from API.";
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
      message.error('Spec Code, Rating, and Base Material are required.');
      return;
    }

    try {
      if (!currentProjectId) {
        message.error('No current project ID available.');
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
        existing_specId: selectedSpecToCopy
      };

      const response = await api.post(configApi.API_URL.specs.create, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data.success) {
        setSpecs([...specs, newSpec]);
        setNewspecName('');
        setNewRating('Rating');
        setNewBaseMaterial('BaseMaterial');
        setSelectedSpecToCopy(null); // Reset selected spec after successful creation
        setFormSubmitted(false);
        message.success('Spec added successfully');
        await fetchSpecs();
      } else {
        throw new Error('Failed to add spec.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to add spec.';
      showToast({ message: errorMessage, type: 'error' });
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
        throw new Error("Failed to update spec.");
      }
    } catch (error) {
      setSpecs(originalSpecs);
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to update spec.";
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

    // const updatedSpecs = specs.filter((spec) => spec.key !== key);
    // setSpecs(updatedSpecs);

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
        apiError.response?.data?.error || "Failed to delete spec.";
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
              placeholder="-Select-" // Add placeholder for rating Select
              style={{ width: "100%" }}
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
              placeholder="-Select-"
              style={{ width: "100%" }}
            >
              {[
                "CA",
                "CS",
                "CS-NACE",
                "CSGLV",
                "CUNI",
                "DD",
                "DD-NACE",
                "GRE",
                "INC",
                "INC-NACE",
                "LTCS",
                "LTCS-NACE",
                "NM",
                "RB",
                "SA",
                "SA-NACE",
                "SAGLV",
                "SD",
                "SD-NACE",
                "SI",
                "SS",
                "SS-NACE",
              ].map((option) => (
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
              style={{ marginBottom: 8 }}
            />
          )
        ) : (
          <div
            onDoubleClick={() => {
              setEditingKey(record?.key);
              setEditingColumn(dataIndex);
            }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<Spec> = [
    {
      title: <div onDoubleClick={() => handleSort("specName")}>Spec Code</div>,
      dataIndex: "specName",
      key: "specName",
      onCell: (record: Spec): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "specName",
        dataIndex: "specName",
      }),
    },
    {
      title: <div onDoubleClick={() => handleSort("rating")}>Rating</div>,
      dataIndex: "rating",
      key: "rating",
      onCell: (record: Spec): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "rating",
        dataIndex: "rating",
      }),
    },
    {
      title: (
        <div onDoubleClick={() => handleSort("baseMaterial")}>
          Base Material
        </div>
      ),
      dataIndex: "baseMaterial",
      key: "baseMaterial",
      onCell: (record: Spec): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "baseMaterial",
        dataIndex: "baseMaterial",
      }),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Trash2
          size={17}
          style={{ cursor: "pointer", color: "red" }}
          onClick={() => {
            setSpecToDelete(record);
            setIsModalOpen(true);
          }}
        />
      ),
    },
  ];

  // Fetch specs when project ID changes
  useEffect(() => {
    fetchSpecs();
  }, [currentProjectId]);

  // Handle sorting functionality
  const handleSort = (columnKey: keyof Spec) => {
    setSortOrder((prev) => (prev === "ascend" ? "descend" : "ascend"));
    setSpecs((prevSpecs) =>
      [...prevSpecs].sort((a, b) =>
        sortOrder === "ascend"
          ? a[columnKey].localeCompare(b[columnKey])
          : b[columnKey].localeCompare(a[columnKey])
      )
    );
  };

  // Handler for spec selection
  const handleSpecSelect = (specId: string) => {
    setSelectedSpecToCopy(specId);
    const selectedSpec = specs.find(spec => spec.key === specId);
    if (selectedSpec) {
      setNewRating(selectedSpec.rating);
      setNewBaseMaterial(selectedSpec.baseMaterial);
    }
  };

  return (
    <div>
      <h1>Specs Creation</h1>
      {/* Note about spec copying */}
      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '12px', // iOS blue border with low opacity
      }}>
        <InfoIcon 
          size={16} 
          style={{ 
            color: '#007AFF', // iOS blue
            marginTop: '2px',
            flexShrink: 0
          }} 
        />
        <span style={{ 
          color: '#007AFF', // iOS blue
          fontSize: '13px',
          fontWeight: '600',
          lineHeight: '1.4',
          opacity: 0.8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
          To copy an existing spec's details, select it from the dropdown below. Leave unselected if you want to create a new spec from scratch.
        </span>
      </div>

      {/* Form section */}
      <Form layout="inline" style={{ marginBottom: "20px", marginTop: "10px" }}>
        <Form.Item style={{ marginRight: "10px", width: "200px" }}>
          <Select
            value={selectedSpecToCopy}
            onChange={handleSpecSelect}
            placeholder="Select spec to copy from"
            allowClear
            style={{ width: "100%" }}
          >
            {specs.map((spec) => (
              <Option key={spec.key} value={spec.key}>
                {spec.specName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item style={{ marginRight: "10px" }}>
          <Input
            value={newspecName}
            onChange={(e) => setNewspecName(e.target.value)}
            placeholder="Enter Spec Code"
            style={{ width: "180px" }}
          />
        </Form.Item>

        <Form.Item style={{ marginRight: "10px" }}>
          <Select
            value={newRating}
            onChange={(value) => setNewRating(value)}
            placeholder="-Select-"
            style={{ width: "180px" }}
          >
            {ratingOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={{ marginRight: "10px" }}>
          <Select
            value={newBaseMaterial}
            onChange={(value) => setNewBaseMaterial(value)}
            placeholder="-Base Material-"
            style={{ width: "180px" }}
          >
            {[
              "CA",
              "CS",
              "CS-NACE",
              "CSGLV",
              "CUNI",
              "DD",
              "DD-NACE",
              "GRE",
              "INC",
              "INC-NACE",
              "LTCS",
              "LTCS-NACE",
              "NM",
              "RB",
              "SA",
              "SA-NACE",
              "SAGLV",
              "SD",
              "SD-NACE",
              "SI",
              "SS",
              "SS-NACE",
            ].map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleAddSpec}>
            Add Spec
          </Button>
        </Form.Item>
      </Form>

      {/* Table section */}
      <Table
        dataSource={specs}
        columns={columns}
        loading={loading}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
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
  );
};

export default SpecsCreation;
