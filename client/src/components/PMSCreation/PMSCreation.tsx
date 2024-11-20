/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useState, useEffect } from "react";
import { Table, Button, Form, Select, message, Checkbox, Row, Col } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; 
import { api as configApi } from "../../utils/api/config";
import showToast from "../../utils/toast";
import { ApiError, Component, ComponentDesc, DimensionalStandard, DropdownOption, MaterialData, PMSItem, Rating, Schedule, Size, SizeRange } from "../../utils/interface";
import { CheckboxChangeEvent } from "antd/es/checkbox";


const PMSCreation = ({ specId }: { specId: string }) => {
  const [items,setItems] = useState<PMSItem[]>([]);
  const [loading,] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [isAllMaterial,setIsAllMaterial] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    compType: [] as DropdownOption[],
    itemDescription: [] as DropdownOption[],
    sizeToScheduleMap : [] as DropdownOption[],
    size1: [] as DropdownOption[],
    size2: [] as DropdownOption[],
    schedule: [] as DropdownOption[],
    rating: [] as DropdownOption[],
    material: [] as DropdownOption[],
    dimensionalStandard: [] as DropdownOption[],
  });
  const [newItem, setNewItem] = useState<Partial<PMSItem>>({});
  const [sizes,setSizes] = useState<Size[]>();
  const [schedules,setSchedules] = useState<Schedule[]>([]);
  const [tableLoading,setTableLoading] = useState(false);
  const [buttonLoading,setButtonLoading] = useState(false);

  useEffect(() => {
    if (!specId) {
      showToast({ message: "Please Select Spec ID First!", type: "info" });
      return;
    }
    
    const projectId = localStorage.getItem("currentProjectId");
    
      fetchSizeRanges(),
      fetchComponents(),
      fetchSizes(projectId!),
      fetchSchedules(projectId!),
      fetchRatings(projectId!)
      fetchPMSItems(specId);
  }, [specId]);
  
  const fetchPMSItems = async (specId: string) => {
    setTableLoading(true);
    try {
      const response = await api.post(configApi.API_URL.pms.getallItem, { specId });
      
      if (response?.data?.success) {
  
        const mappedItems = response.data.items.map((item: any) => ({
          key: item.id,
          compType: item.component_value,
          itemDescription: item.component_desc_value,
          size1: item.size1_value,
          size2: item.size2_value || 'X',
          schedule: item.schedule1_value,
          rating: item.rating_value || 'X',
          material: item.material_value,
          dimensionalStandard: item.dimensional_standards
        }));
        
        setItems(mappedItems);
      } else {
        showToast({ message: "Failed to fetch PMS items", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage = apiError.response?.data?.error || "Error fetching PMS items";
      showToast({ message: errMessage, type: "error" });
    } finally {
      setTableLoading(false);
    }
  };

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
          c_code:item.c_code,
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
            ratingRequired: item.ratingrequired,
            shortCode: item.short_code,
            g_type: item.g_type, 
            s_type: item.s_type,
            c_code: item.c_code,
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
  
  const fetchSizes = async (currentProjectId:string) => {
    try {
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
        })).sort((a:{od:number}, b:{od:number}) => a.od - b.od);
        setSizes(sizesWithKeys);
      } else {
        showToast({ message: "Failed to fetch sizes.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching sizes.";
      showToast({ message: errorMessage, type: "error" });
    }
  };
  
  const fetchSchedules = async (currentProjectId:string) => {
    try {
      if (!currentProjectId) return;

      const payload = {
        projectId: currentProjectId,
      };

      const response = await api.post(configApi.API_URL.schedules.getall, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data && response.data.success) {
        const schedulesWithKeys = response.data.schedules.map((schedule: Schedule) => ({
          ...schedule,
          key: schedule.code,
          c_code: schedule.c_code,
        })).sort((a:{arrange_od:number}, b:{arrange_od:number}) => a.arrange_od - b.arrange_od);
        setSchedules(schedulesWithKeys);
      } else {
        showToast({ message: 'Failed to fetch schedules.', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Error fetching schedules.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  const fetchSizeRanges = async () => {
    try {
      const response = await api.post(configApi.API_URL.sizeranges.getall, { specId });
      if (response?.data?.success) {
        const sortedSizeRanges = response.data.sizeranges.sort((a: { odValue: number }, b: { odValue: number }) => a.odValue - b.odValue);
  
        const sizeRangesOptions = sortedSizeRanges.map((item: SizeRange) => ({
          label: item.sizeValue,
          value: item.sizeCode,
        }));
  
        const scheduleRangesOptions = sortedSizeRanges.map((item: SizeRange) => ({
          label: item.scheduleValue,
          value: item.scheduleCode,
        }));
  
        // Create a map of sizeCode to related schedules
        const sizeToScheduleMap = sortedSizeRanges.reduce((acc: Record<string, any[]>, item: SizeRange) => {
          if (!acc[item.sizeCode]) {
            acc[item.sizeCode] = [];
          }
          acc[item.sizeCode].push({
            scheduleValue: item.scheduleValue,
            scheduleCode: item.scheduleCode,
          });
          return acc;
        }, {});
  
        // Save the dropdown options and size-to-schedule map
        setDropdownData((prevData) => ({
          ...prevData,
          size1: sizeRangesOptions,
          size2: sizeRangesOptions,
          schedule: scheduleRangesOptions,
          sizeToScheduleMap, // Add map to state
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
            c_code:item.c_rating_code,
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
  const handleSizeChange = (field: "size1" | "size2", value: string) => {
    const selectedSize = sizes?.find((size) => size.code === value);
  
    setNewItem((prevNewItem) => ({
      ...prevNewItem,
      [field]: value,
      [`${field}Inch`]: selectedSize?.size_inch || "",
      [`${field}MM`]: selectedSize?.size_mm || "",
    }));
  
    // Update related schedules for size1 if needed
    if (field === "size1") {
      const relatedSchedules = dropdownData.sizeToScheduleMap[value] || [];
      const firstRelatedSchedule = relatedSchedules.length > 0 ? relatedSchedules[0].scheduleCode : null;
  
      setNewItem((prevNewItem) => ({
        ...prevNewItem,
        schedule: firstRelatedSchedule || prevNewItem.schedule,
      }));
    }
  };
  
  
  const generateSizeRangeArray = (startSize: string, endSize: string) => {
    const sizeValues = dropdownData.size1.map((item) => item.value);
    const startIndex = sizeValues.indexOf(startSize);
    const endIndex = sizeValues.indexOf(endSize);
  
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) return [];
    return sizeValues.slice(startIndex, endIndex + 1).map((value) => ({
      code: value,
      label: dropdownData.size1.find((item) => item.value === value)?.label,
    }));
  };
  
  const handleAddItem = async () => {
    if (!newItem.compType || !newItem.itemDescription || !newItem.size1) {
      message.error("Please fill all the required fields");
      return;
    }
  
    try {
      setButtonLoading(true);
  
      const selectedCompType = dropdownData.compType.find(
        (item) => item.value === newItem.compType
      );
      const selectedItemDesc = dropdownData.itemDescription.find(
        (item) => item.value === newItem.itemDescription
      );
      const selectedMaterial = dropdownData.material.find(
        (item) => item.value === newItem.material
      );
      const selectedDimensionalStandard = dropdownData.dimensionalStandard.find(
        (item) => item.value === newItem.dimensionalStandard
      );
      const selectedRating = newItem.rating
        ? dropdownData.rating.find((item) => item.value === newItem.rating)
        : null;
  
      const sizeRangeArray = generateSizeRangeArray(newItem.size1!, newItem.size2!);
      const jsonData = sizeRangeArray.map((size) => {
        const sizeDetails = sizes?.find((item) => item.code === size.code);
        const relatedSchedules = dropdownData.sizeToScheduleMap[size.code] || [];
        const schedule1Code = relatedSchedules.length > 0 ? relatedSchedules[0].scheduleCode : null;
        const scheduleDetails = schedules?.find((item) => item.code === schedule1Code)
        const schedule1Value = relatedSchedules.length > 0 ? relatedSchedules[0].scheduleValue : null;
  
        return {
          specId,
          component:{
            Code:selectedCompType?.value,
            Value:selectedCompType?.label
          },
          componentDesc:{
            Code:selectedItemDesc?.value,
            CCode:selectedItemDesc?.c_code,
            Value: selectedItemDesc?.label,
          },
          itemCCode:`${selectedItemDesc?.c_code}${sizeDetails?.c_code}X${scheduleDetails?.c_code}XX${selectedRating?.c_code || 'X'}${selectedMaterial?.c_code}`,
          itemCode:`${selectedItemDesc?.value}${sizeDetails?.code}X${schedule1Code}XX${selectedRating?.value || 'X'}${selectedMaterial?.value}`,
          itemLongDesc: `${selectedItemDesc?.label}, ${schedule1Value}, ${selectedMaterial?.label}`,
          size1:{
            Value: sizeDetails?.size1_size2,
            Code:sizeDetails?.code,
            CCode:sizeDetails?.c_code,
            Inch:sizeDetails?.size_inch || "",
            MM:sizeDetails?.size_mm || "",
          },
          size2:{
            Value:null,
            Code:null,
            CCode:null,
            Inch:null,
            MM:null,
          },
          sch1:{
            Code:schedule1Code,
            CCode:scheduleDetails?.c_code,
            Value:schedule1Value,
          },
          sch2:{
            Code:null,
            CCode:null,
            Value:null,
          },
          rating:{
            Code:selectedRating?.value || null,
            Value:selectedRating?.label || null,
            CCode:selectedRating?.c_code || null, 
          },
          material:{
            Code: selectedMaterial?.value,
            CCode: selectedMaterial?.c_code,
            Value: selectedMaterial?.label,
          },
          dimensionalStandards: selectedDimensionalStandard?.label || null,
          shortCode:selectedItemDesc?.shortCode,
          g_type: newItem.g_type,
          s_type: newItem.s_type,
        };
      });
  
      // console.log("Prepared JSON Data:", JSON.stringify(jsonData, null, 2));
  
       const response = await api.post(configApi.API_URL.pms.addItem, {items: jsonData})
      console.log(response);
      // const responses = await Promise.all(responsePromises);
  
      if ((await response).data.success) {
        setNewItem({});
        message.success("Items added successfully");
        fetchPMSItems(specId);
      } else {
        message.error("Failed to add some items");
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
    
    setNewItem({
      compType: value,
      itemDescription: undefined,
      size1: undefined,
      size2: undefined,
      schedule: undefined,
      rating: undefined,
      material: undefined,
      dimensionalStandard: undefined,
    });
  
    setDropdownData(prevData => ({
      ...prevData,
      itemDescription: [],
      material: [],
      dimensionalStandard: [],
    }));
  
    // Reset other related states
    setShowRatingDropdown(false);
    setIsAllMaterial(false);
  
    // Fetch new data for the selected component
    fetchComponentDesc(projectId, value);
    fetchMaterials(projectId, value, false); 
    fetchDimensionalStandards(value);
  };

  const handleComponentDescChange = (value: string) => {
    const selectedItem = dropdownData.itemDescription.find(item => item.value === value);
    setNewItem((prevNewItem) => ({
      ...prevNewItem,
      itemDescription: value,
      c_code:selectedItem?.c_code,
      g_type: selectedItem?.g_type,
      s_type: selectedItem?.s_type,
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
          onChange={(value) => handleSizeChange("size1", value)}
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
          onChange={(value) => handleSizeChange("size2", value)}
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
    loading={tableLoading}
    pagination={false}
    rowClassName="editable-row"
  />
</div>

  );
};

export default PMSCreation;
