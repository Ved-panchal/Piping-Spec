import React, { useState, useEffect } from "react";
import { Table, Input, Button, Form, Select, message } from "antd";
import { ColumnsType } from "antd/es/table";
import showToast from "../../utils/toast";
import api from "../../utils/api/apiutils";
import { api as configApi } from "../../utils/api/config";
import { ApiError, Component } from "../../utils/interface";

interface ComponentDesc {
  id?: number;
  code: string;
  itemDescription: string;
  key?: string;
}

// Extend the interface to match the CatRef data structure
export interface EditableCellProps extends React.TdHTMLAttributes<unknown> {
  record: CatRefData;
  editable: boolean;
  dataIndex: keyof CatRefData;
  componentDesc?: ComponentDesc[]; // Add this to pass component descriptions
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
  const [componentDesc, setComponentDesc] = useState<ComponentDesc[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(
    null
  );

  // New state for input fields
  const [newItemShortDesc, setNewItemShortDesc] = useState("");
  const [newRating, setNewRating] = useState("");
  const [newCatalog, setNewCatalog] = useState("");

  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  const generateConcatenate = (
    itemShortDesc: string,
    rating: string
  ): string => {
    const formattedRating = rating || "";
    return `${itemShortDesc}${rating ? '-' : ''}${formattedRating}`;
  };

  // Fetch Component Description function
  const fetchComponentDesc = async (componentId: number) => {
    try {
      const payload = {
        componentId: componentId,
        projectId: currentProjectId,
      };
      setLoading(true);
      const response = await api.post(
        configApi.API_URL.components.data,
        payload
      );
      if (response && response.data && response.data.success) {
        const fetchedData = response.data.componentDescs.map(
          (item: ComponentDesc) => ({
            ...item,
            key: item.code,
          })
        );
        setComponentDesc(fetchedData ? fetchedData : []);
      } else {
        showToast({
          message: "Failed to fetch component data.",
          type: "error",
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching component data.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Modify handleComponentChange to call fetchComponentDesc
  const handleComponentChange = (componentId: number) => {
    // Reset input fields
    setNewItemShortDesc("");
    setNewRating("");
    setNewCatalog("");

    setSelectedComponentId(componentId);
    fetchCatRefData(componentId);
    fetchComponentDesc(componentId);
  };

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

    const fetchComponentsList = async () => {
      try {
        setLoading(true);
        const response = await api.get(configApi.API_URL.components.list);
        if (response && response.data && response.data.success) {
          setComponentsList(response.data.components);
        } else {
          showToast({
            message: "Failed to fetch components list.",
            type: "error",
          });
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
      const response = await api.post(
        configApi.API_URL.catrefs.getall,
        payload
      );

      if (response && response.data && response.data.success) {
        const fetchedData = response.data.catRefs.map((item: CatRefData) => ({
          ...item,
          rating: item.rating === null ? "" : item.rating,
          key: item.concatenate || Math.random().toString(36).substring(7),
        }));
        setCatRefData(fetchedData);
      } else {
        showToast({ message: "Failed to fetch CatRef data.", type: "error" });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCatRefData = async () => {
    // Validate input fields with more comprehensive checks
    if (!selectedComponentId) {
      message.error("Please select a component first.");
      return;
    }

    if (!newItemShortDesc) {
      message.error("Please select an Item Short Description.");
      return;
    }

    if (!newCatalog) {
      message.error("Catalog field is required.");
      return;
    }

    // Generate concatenate field
    const newConcatenate = generateConcatenate(newItemShortDesc, newRating);

    // More robust duplicate checking
    const isDuplicateEntry = catRefData.some(
      (item) => 
        item.item_short_desc === newItemShortDesc && 
        item.rating === (newRating || "-") && 
        item.catalog === newCatalog
    );

    if (isDuplicateEntry) {
      message.error("An identical CatRef entry already exists.");
      return;
    }

    try {
      setButtonLoading(true);

      const newData: CatRefData = {
        key: Math.random().toString(36).substring(7),
        component_id: selectedComponentId!,
        project_id: currentProjectId,
        item_short_desc: newItemShortDesc,
        rating: newRating || "-",
        concatenate: newConcatenate,
        catalog: newCatalog,
      };

      const payload = {
        componentId: selectedComponentId,
        catRefs: [newData],
      };

      const response = await api.post(
        configApi.API_URL.catrefs.addorupdate,
        payload
      );

      if (response && response.data.success) {
        // Add new data to the beginning of the list
        setCatRefData((prevData) => [newData, ...prevData]);

        // Reset input fields
        setNewItemShortDesc("");
        setNewRating("");
        setNewCatalog("");

        message.success("CatRef data added successfully");
      } else {
        message.error(response.data.message || "Failed to add CatRef data");
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
    componentDesc,
    ...restProps
  }) => {
    const initialInputValue = record ? String(record[dataIndex]) : "";
    const [localInputValue, setLocalInputValue] =
      useState<string>(initialInputValue);

    const handleBlur = () => {
      if (localInputValue !== initialInputValue) {
        // For item_short_desc or rating, regenerate concatenate
        if (dataIndex === "item_short_desc" || dataIndex === "rating") {
          const updatedConcatenate = generateConcatenate(
            dataIndex === "item_short_desc"
              ? localInputValue
              : record.item_short_desc,
            dataIndex === "rating" ? localInputValue : record.rating
          );
          handleEditCatRefData(record.key, "concatenate", updatedConcatenate);
        }
        
        console.log("record",record)
        handleEditCatRefData(record.key, dataIndex, localInputValue);
      }
      setEditingKey(null);
      setEditingColumn(null);
    };

    const renderEditableContent = () => {
      if (dataIndex === "item_short_desc") {
        return (
          <Select
            value={localInputValue}
            onChange={(value) => {
              setLocalInputValue(value);
              handleBlur();
            }}
            style={{ width: "100%" }}
            onBlur={handleBlur}
            autoFocus
          >
            {componentDesc!.map((desc) => (
              <Select.Option key={desc.code} value={desc.code}>
                {`${desc.code} - ${desc.itemDescription}`}
              </Select.Option>
            ))}
          </Select>
        );
      }

      return (
        <Input
          value={localInputValue}
          onChange={(e) => setLocalInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyPress={(e) => e.key === "Enter" && handleBlur()}
          autoFocus
        />
      );
    };

    return (
      <td {...restProps}>
        {editable ? (
          renderEditableContent()
        ) : (
          <div
            onDoubleClick={() => {
              setEditingKey(record.key);
              setEditingColumn(dataIndex);
            }}
          >
            {children === '' ? '-' : children}
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
    console.log(key)
    const project_id = localStorage.getItem('currentProjectId');
    const originalData = [...catRefData];
    const updatedData = catRefData.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    );

    const catRefToUpdate = updatedData.find((item) => item.key === key);
    if (!catRefToUpdate) return;

    // Check for duplicate entries when editing item_short_desc or rating
    if (field === "item_short_desc" || field === "rating") {
      const newConcatenate = generateConcatenate(
        field === "item_short_desc" ? value : catRefToUpdate.item_short_desc,
        field === "rating" ? value : catRefToUpdate.rating
      );

      const descExists = catRefData.some(
        (item) => item.concatenate === newConcatenate && item.key !== key
      );

      if (descExists) {
        message.error("This CatRef already exists.");
        return;
      }

      catRefToUpdate.concatenate = newConcatenate;
    }

    setCatRefData(updatedData);

    const payload = {
      componentId: selectedComponentId,
      catRefs: [
        {
          project_id: project_id,
          item_short_desc: catRefToUpdate.item_short_desc,
          rating: catRefToUpdate.rating || "null",
          concatenate: catRefToUpdate.concatenate,
          catalog: catRefToUpdate.catalog,
        },
      ],
    };

    try {
      const response = await api.post(
        configApi.API_URL.catrefs.addorupdate,
        payload
      );

      if (response && response.data.success) {
        message.success("CatRef data updated successfully");
      } else {
        setCatRefData(originalData); // Revert to original data if update fails
        throw new Error("Failed to update CatRef data.");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: ColumnsType<CatRefData> = [
    {
      title: "Item Short Desc",
      dataIndex: "item_short_desc",
      key: "item_short_desc",
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable:
          editingKey === record.key && editingColumn === "item_short_desc",
        dataIndex: "item_short_desc",
        componentDesc,
      }),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "rating",
        dataIndex: "rating",
      }),
    },
    {
      title: "Concatenate",
      dataIndex: "concatenate",
      key: "concatenate",
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "concatenate",
        dataIndex: "concatenate",
      }),
    },
    {
      title: "Catalog",
      dataIndex: "catalog",
      key: "catalog",
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "catalog",
        dataIndex: "catalog",
      }),
    },
  ];

  const handleApiError = (error: any) => {
    const apiError = error as ApiError;
    const errorMessage = apiError.response?.data?.error || "An error occurred";
    showToast({ message: errorMessage, type: "error" });
  };

  return (
    <div>
      <h1>CatRef Configuration</h1>
      <Form layout="vertical" className="mb-6 mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          label={
            <span className="text-white font-semibold">
              Component<span className="text-red-500"> *</span>
            </span>
          }
        >
          <Select
            placeholder="Select a component"
            className="w-full"
            onChange={handleComponentChange}
            options={componentsList.map((component) => ({
              value: component.id,
              label: component.componentname,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-white font-semibold">
              Item Description<span className="text-red-500"> *</span>
            </span>
          }
        >
          <Select
            placeholder="Select a Item Description"
            className="w-full"
            onChange={(value) => setNewItemShortDesc(value)}
            options={componentDesc.map((desc) => ({
              value: desc.itemDescription,
              label: `${desc.code} - ${desc.itemDescription}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-white font-semibold">
              Rating<span className="text-red-500"> *</span>
            </span>
          }
        >
          <Input
            placeholder="Rating"
            className="w-full"
            value={newRating}
            onChange={(e) => setNewRating(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-white font-semibold">
              Catalog<span className="text-red-500"> *</span>
            </span>
          }
        >
          <Input
            placeholder="Catalog"
            className="w-full"
            value={newCatalog}
            onChange={(e) => setNewCatalog(e.target.value)}
          />
        </Form.Item>

        <div className="flex items-center mt-1">
          <Button
            type="primary"
            onClick={handleAddCatRefData}
            loading={buttonLoading}
            disabled={!selectedComponentId || !newItemShortDesc}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
          >
            Add CatRef
          </Button>
        </div>
      </div>
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
