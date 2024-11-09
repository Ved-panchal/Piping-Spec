import  { useState, useEffect } from "react";
import { Table, Button, Form, Select, message, Checkbox, Row, Col } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; 
import { api as configApi } from "../../utils/api/config";
import showToast from "../../utils/toast";
import { ApiError, Component, ComponentDesc, DimensionalStandard, DropdownOption, MaterialData, PMSItem, Rating, SizeRange } from "../../utils/interface";
import { CheckboxChangeEvent } from "antd/es/checkbox";


const PMSCreation = ({ specId }: { specId: string }) => {
  const [items,setItems] = useState<PMSItem[]>([]);
  // const [editingKey, setEditingKey] = useState<string | null>(null);
  const [loading,] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [isAllMaterial,setIsAllMaterial] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    compType: [] as DropdownOption[],
    itemDescription: [] as DropdownOption[],
    size1: [] as DropdownOption[],
    size2: [] as DropdownOption[],
    schedule: [] as DropdownOption[],
    rating: [] as DropdownOption[],
    material: [] as DropdownOption[],
    dimensionalStandard: [] as DropdownOption[],
  });
  const [newItem, setNewItem] = useState<Partial<PMSItem>>({});
  const [buttonLoading,setButtonLoading] = useState(false);

  useEffect(() => {
    const projectId = localStorage.getItem('currentProjectId');
    fetchComponents();
    fetchSizeRanges();
    fetchRatings(projectId!);
  }, [specId]);

  const fetchComponents = async () => {
    try {
      const response = await api.get(configApi.API_URL.components.list);
      if (response?.data?.success) {
        const compTypes = response.data.components.map((item: Component) => ({
          label: item.componentname,
          value: item.id,
        }));
        setDropdownData((prevData) => ({
          ...prevData,
          compType: compTypes,
        }));
      } else {
        showToast({ message: "Failed to fetch components data", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || 'Error fetching Components data.';
      showToast({ message: errMessage, type: "error" });
    }
  };
  
  const fetchMaterials = async (projectId: string, componentId: string,isAll:boolean) => {
    try {
      const payload = {
        componentId,
        projectId,
        isAll,
      };
      const response = await api.post(configApi.API_URL.materials.getall, payload );
      if (response?.data?.success) {
        const MaterialsOptions = response.data.materials.map((item: MaterialData) => ({
          label: item.material_description,
          value: item.code,
        }));
        setDropdownData((prevData) => ({
         ...prevData,
         material: MaterialsOptions,
        }));
      } else {
        showToast({ message: "Failed to fetch Materials", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || "Error fetching Materials";
      showToast({ message: errMessage, type: "error" });
    }
  }

  const fetchDimensionalStandards = async(componentId:string) => {
    try {
      const response = await api.post(configApi.API_URL.dimensionalstandards.bycomponent, {component_id:componentId} );
      if (response?.data?.success) {
        const dimensionalStandardsOptions = response.data.dimensionalStandards.map((item: DimensionalStandard) => ({
          label: item.dimensional_standard,
          value: item.id,
        }));
        setDropdownData((prevData) => ({
         ...prevData,
         dimensionalStandard: dimensionalStandardsOptions,
        }));
      } else {
        showToast({ message: "Failed to fetch Dimensional Standards", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || "Error fetching Dimensional Standards";
      showToast({ message: errMessage, type: "error" });
    }
  }

  const fetchComponentDesc = async (projectId: string, componentId: string) => {
    try {
      const payload = {
        componentId,
        projectId,
      };
      const response = await api.post(configApi.API_URL.components.data, payload);
      if (response?.data?.success) {
        setDropdownData((prevData) => ({
          ...prevData,
          itemDescription: response.data.componentDescs.map((item: ComponentDesc) => ({
            label: item.itemDescription,
            value: item.code,
            ratingRequired: item.ratingrequired, // Store rating requirement in item description
          })),
        }));
      } else {
        showToast({ message: "Failed to fetch component descriptions", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || "Error fetching component descriptions";
      showToast({ message: errMessage, type: "error" });
    }
  };
  
  

  const fetchSizeRanges = async () => {
    try {
      const response = await api.post(configApi.API_URL.sizeranges.getall, { specId });
      if (response?.data?.success) {
        const sizeRangesOptions = response.data.sizeranges.map((item: SizeRange) => ({
          label: item.sizeValue,
          value: item.sizeCode,
        }));
        const ScheduleRangesoptions = response.data.sizeranges.map((item: SizeRange) => ({
          label: item.scheduleValue,
          value: item.scheduleCode,
        }));
        setDropdownData((prevData) => ({
          ...prevData,
          size1: sizeRangesOptions,
          size2: sizeRangesOptions,
          schedule: ScheduleRangesoptions,
        }));
      } else {
        showToast({ message: "Failed to fetch sizes data", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || "Error fetching sizes data";
      showToast({ message: errMessage, type: "error" });
    }
  };

  const fetchRatings = async (projectId: string) => {
    try {
      const payload = { projectId };
      const response = await api.post(configApi.API_URL.ratings.getAll, payload);
      if (response?.data?.success) {
        setDropdownData((prevData) => ({
          ...prevData,
          rating: response.data.ratings.map((item: Rating) => ({
            label: item.ratingValue,
            value: item.ratingCode,
          })),
        }));
      } else {
        showToast({ message: "Failed to fetch ratings data", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || "Error fetching ratings data";
      showToast({ message: errMessage, type: "error" });
    }
  };

  // Function to add new item
  const handleAddItem = async () => {
    if (!newItem.compType || !newItem.itemDescription || !newItem.size1) {
      message.error("Please fill All the fields");
      return;
    }

    try {
      setButtonLoading(true);
      const response = await api.post(configApi.API_URL.pms.addItem, newItem);
      if (response?.data?.success) {
        setItems([response.data.item, ...items]);
        setNewItem({}); // Clear form fields
        message.success("Item added successfully");
      } else {
        message.error("Failed to add item");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || "Error adding item";
      message.error(errMessage);
    } finally {
      setButtonLoading(false);
    }
  };

  // const handleEditItem = async (key: string, field: keyof PMSItem, value: string) => {
  //   const itemToUpdate = items.find((item) => item.key === key);
  //   if (!itemToUpdate) return;

  //   try {
  //     const updatedItem = { ...itemToUpdate, [field]: value };
  //     const response = await api.post(configApi.API_URL.pms.updateItem, updatedItem);
  //     if (response?.data?.success) {
  //       setItems(items.map((item) => (item.key === key ? updatedItem : item)));
  //       setEditingKey(null); // Exit editing mode
  //       message.success("Item updated successfully");
  //     } else {
  //       message.error("Failed to update item");
  //     }
  //   } catch (error) {
  //     const apiError = error as ApiError;
  //     const errMessage = apiError.response?.data?.error || "Error updating item";
  //     message.error(errMessage);
  //   }
  // };

  // Handle component type change to fetch item descriptions
  
  const handleCompTypeChange = (value: string) => {
    const projectId = localStorage.getItem('currentProjectId') || "";
    setNewItem({ ...newItem, compType: value });
    fetchComponentDesc(projectId, value);
    fetchMaterials(projectId, value, isAllMaterial); 
    fetchDimensionalStandards(value);
  };

  const handleComponentDescChange = (value: string) => {
    const selectedItem = dropdownData.itemDescription.find(item => item.value === value);
    
    // Update the newItem state with the selected item description
    setNewItem((prevNewItem) => ({
      ...prevNewItem,
      itemDescription: value,
    }));
    setShowRatingDropdown(!!selectedItem?.ratingRequired);
  };
  

  const handleAllMaterialChange = (e: CheckboxChangeEvent) => {
    const projectId = localStorage.getItem('currentProjectId') || "";
    const componentId = newItem.compType || ""; // Ensure compType is selected first
    const isAll = e.target.checked;
  
    setIsAllMaterial(isAll);
    fetchMaterials(projectId, componentId, isAll); // Fetch materials based on checkbox state
  };

  // Editable Cell Component
  // const EditableCell: React.FC<any> = ({ editable, children, record, field, ...restProps }) => {
  //   const [value, setValue] = useState(record[field]);
  //   return (
  //     <td {...restProps}>
  //       {editable ? (
  //         <Input
  //           value={value}
  //           onChange={(e) => setValue(e.target.value)}
  //           onBlur={() => handleEditItem(record.key, field, value)}
  //           onPressEnter={() => handleEditItem(record.key, field, value)}
  //           autoFocus
  //         />
  //       ) : (
  //         <div onDoubleClick={() => setEditingKey(record.key)}>{children}</div>
  //       )}
  //     </td>
  //   );
  // };

  const columns: ColumnsType<PMSItem> = [
    { title: "Comp Type", dataIndex: "compType", key: "compType" },
    { title: "Item Description", dataIndex: "itemDescription", key: "itemDescription" },
    { title: "Size-1", dataIndex: "size1", key: "size1" },
    { title: "Size-2", dataIndex: "size2", key: "size2" },
    { title: "Schedule", dataIndex: "schedule", key: "schedule" },
    { title: "Rating", dataIndex: "rating", key: "rating" },
    { title: "Material", dataIndex: "material", key: "material" },
    { title: "Dimensional Standard", dataIndex: "dimensionalStandard", key: "dimensionalStandard" },
  ];

  return (
    <div style={{ padding: "20px" }}>
  <h2>PMS Creation</h2>
  <Form layout="vertical" style={{ marginBottom: "20px" }}>
    <Row gutter={16}>
      {/* First Row with Comp Type and Item Description */}
      <Col span={8}>
        <Form.Item>
          <Select
            placeholder="Comp Type"
            value={newItem.compType}
            onChange={handleCompTypeChange}
            options={dropdownData.compType}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
      <Col span={16}>
        <Form.Item>
          <Select
            placeholder="Item Description"
            value={newItem.itemDescription}
            onChange={handleComponentDescChange}
            options={dropdownData.itemDescription.map(({ label, value }) => ({ label, value }))}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
    </Row>

    {/* Second Row with other inputs */}
    <Row gutter={16}>
      <Col span={4}>
        <Form.Item>
          <Select
            placeholder="Size-1"
            value={newItem.size1}
            onChange={(value) => setNewItem({ ...newItem, size1: value })}
            options={dropdownData.size1}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item>
          <Select
            placeholder="Size-2"
            value={newItem.size2}
            onChange={(value) => setNewItem({ ...newItem, size2: value })}
            options={dropdownData.size2}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
      {showRatingDropdown && (
        <Col span={4}>
          <Form.Item>
            <Select
              placeholder="Rating"
              value={newItem.rating}
              onChange={(value) => setNewItem({ ...newItem, rating: value })}
              options={dropdownData.rating}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      )}
      <Col span={6}>
        <Form.Item>
          <Select
            placeholder="Material"
            value={newItem.material}
            onChange={(value) => setNewItem({ ...newItem, material: value })}
            options={dropdownData.material}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item>
          <Checkbox checked={isAllMaterial} onChange={handleAllMaterialChange}>
            All Material
          </Checkbox>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item>
          <Select
            placeholder="Dimensional Standard"
            value={newItem.dimensionalStandard}
            onChange={(value) => setNewItem({ ...newItem, dimensionalStandard: value })}
            options={dropdownData.dimensionalStandard}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
    </Row>
  </Form>

  <Button type="primary" onClick={handleAddItem} loading={buttonLoading}>
    Add Item
  </Button>
  <Table
    style={{ marginTop: "20px" }}
    columns={columns}
    dataSource={items}
    loading={loading}
    pagination={false}
    rowClassName="editable-row"
  />
</div>

  );
};

export default PMSCreation;
