import React, { useState, useEffect } from "react";
import { Table, Input, Button, Form, Select, message, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import showToast from "../../utils/toast";
import api from "../../utils/api/apiutils";
import { api as configApi } from "../../utils/api/config";
import { ApiError, Component } from "../../utils/interface";
import { Plus } from "lucide-react";

interface ComponentDesc {
  id?: number;
  code: string;
  itemDescription: string;
  key?: string;
}

export interface EditableCellProps extends React.TdHTMLAttributes<unknown> {
  record: CatRefData;
  editable: boolean;
  dataIndex: keyof CatRefData;
  componentDesc?: ComponentDesc[];
}

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
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
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

  const handleComponentChange = (componentId: number) => {
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

    const newConcatenate = generateConcatenate(newItemShortDesc, newRating);

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
        setCatRefData((prevData) => [newData, ...prevData]);
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
        if (dataIndex === "item_short_desc" || dataIndex === "rating") {
          const updatedConcatenate = generateConcatenate(
            dataIndex === "item_short_desc"
              ? localInputValue
              : record.item_short_desc,
            dataIndex === "rating" ? localInputValue : record.rating
          );
          handleEditCatRefData(record.key, "concatenate", updatedConcatenate);
        }
        
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
            size="small"
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
          size="small"
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
            style={{ cursor: 'pointer', padding: '4px 0' }}
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
    const project_id = localStorage.getItem('currentProjectId');
    const originalData = [...catRefData];
    const updatedData = catRefData.map((item) =>
      item.key === key ? { ...item, [field]: value } : item
    );

    const catRefToUpdate = updatedData.find((item) => item.key === key);
    if (!catRefToUpdate) return;

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
        setCatRefData(originalData);
        throw new Error("Failed to update CatRef data.");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: ColumnsType<CatRefData> = [
    {
      title: <span>Item Short Desc</span>,
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
      title: <span>Rating</span>,
      dataIndex: "rating",
      key: "rating",
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "rating",
        dataIndex: "rating",
      }),
    },
    {
      title: <span>Concatenate</span>,
      dataIndex: "concatenate",
      key: "concatenate",
      onCell: (record: CatRefData): EditableCellProps => ({
        record,
        editable: editingKey === record.key && editingColumn === "concatenate",
        dataIndex: "concatenate",
      }),
    },
    {
      title: <span>Catalog</span>,
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
    <div style={{ padding: "0", maxWidth: "100%", maxHeight:"78vh", overflowY:"auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">CatRef Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-6 gap-3 mb-3">
            <Form.Item
              label={<span className="font-semibold">Component <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Select
                placeholder="Select a component"
                className="w-full"
                onChange={handleComponentChange}
                size="middle"
                options={componentsList.map((component) => ({
                  value: component.id,
                  label: component.componentname,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Rating <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Rating"
                className="w-full"
                value={newRating}
                onChange={(e) => setNewRating(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Catalog <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0 col-span-2"
            >
              <Input
                placeholder="Enter Catalog"
                className="w-full"
                value={newCatalog}
                onChange={(e) => setNewCatalog(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Form.Item
              label={<span className="font-semibold">Item Description <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Select
                placeholder="Select an Item Description"
                className="w-full"
                onChange={(value) => setNewItemShortDesc(value)}
                size="middle"
                options={componentDesc.map((desc) => ({
                  value: desc.itemDescription,
                  label: `${desc.code} - ${desc.itemDescription}`,
                }))}
              />
            </Form.Item>
          </div>
          
          <div className="flex justify-end mt-5 mb-2">
            <Button
              type="primary"
              onClick={handleAddCatRefData}
              loading={buttonLoading}
              // disabled={!selectedComponentId || !newItemShortDesc}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add CatRef
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : catRefData.length === 0 ? (
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
            className="catref-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={catRefData}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .catref-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .catref-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .catref-table .ant-table-row:hover {
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

export default CatRefConfiguration;