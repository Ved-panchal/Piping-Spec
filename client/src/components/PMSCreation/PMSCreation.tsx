/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Form,
  Select,
  message,
  Checkbox,
  Row,
  Col,
  Popconfirm,
  Tooltip,
} from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils";
import { api as configApi } from "../../utils/api/config";
import showToast from "../../utils/toast";
import {
  ApiError,
  Component,
  ComponentDesc,
  DimensionalStandard,
  DropdownOption,
  MaterialData,
  PMSItem,
  Rating,
  Schedule,
  Size,
  SizeRange,
  SizeToScheduleMap,
} from "../../utils/interface";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import {Trash2 } from "lucide-react";
import ReviewOutputModal from "../ReviewOutputModal/ReviewOutputModal";

interface DropdownDataState {
  compType: DropdownOption[];
  itemDescription: DropdownOption[];
  size1: DropdownOption[];
  size2: DropdownOption[];
  rating: DropdownOption[];
  material: DropdownOption[];
  dimensionalStandard: DropdownOption[];
  sizeToScheduleMap: SizeToScheduleMap;
}

const PMSCreation = ({ specId }: { specId: string }) => {
  const [items, setItems] = useState<PMSItem[]>([]);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [isAllMaterial, setIsAllMaterial] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewData,setReviewData] = useState([]);

  const [dropdownData, setDropdownData] = useState<DropdownDataState>({
    compType: [],
    itemDescription:[],
    size1: [] ,
    size2: [] ,
    rating: [] ,
    material: [] ,
    dimensionalStandard: [],
    sizeToScheduleMap:{},
  });

  const [editingCell, setEditingCell] = useState<{
    key: string;
    dataIndex: keyof PMSItem;
    value: any;
    originalRecord: any;
  } | null>(null);

  const selectRef = useRef<any>(null);

  const dropdownStyles = {
    dropdown: {
      minWidth: "150px",
      maxWidth: "400px",
    },
    dropdownlarge:{
      minWidth:"200px",
      maxWidth:"500px",
    },
  };

  const [newItem, setNewItem] = useState<Partial<PMSItem>>({});

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
    fetchRatings(projectId!);
    fetchPMSItems(specId);
  }, [specId]);

  const fetchPMSItems = async (specId: string) => {
    setTableLoading(true);
    try {
      const response = await api.post(configApi.API_URL.pms.getallPms, {
        specId,
      });
      if (response?.data?.success) {
        const mappedItems = response.data.items.map((item: any) => ({
          key: item.id,
          compType: item.component_value,
          compCode: item.component_code,
          itemDescription: item.component_desc_value,
          size1: item.size1_value,
          size2: item.size2_value || "X",
          schedule: item.schedule_value,
          rating: item.rating_value || "X",
          material: item.material_value,
          dimensionalStandard: item.dimensional_standard_value,
        }))
  
        setItems(mappedItems);
      } else {
        showToast({ message: "Failed to fetch PMS items", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage =
        apiError.response?.data?.error || "Error fetching PMS items";
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
        showToast({
          message: "Failed to fetch components data",
          type: "error",
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage =
        apiError.response?.data?.error || "Error fetching Components data.";
      showToast({ message: errMessage, type: "error" });
    }
  };

  const fetchMaterials = async (
    projectId: string,
    componentId: string,
    isAll: boolean
  ) => {
    try {
      const payload = {
        componentId,
        projectId,
        isAll,
      };
      const response = await api.post(
        configApi.API_URL.materials.getall,
        payload
      );
      if (response?.data?.success) {
        const MaterialsOptions = response.data.materials.map(
          (item: MaterialData) => ({
            label: item.material_description,
            value: item.code,
            c_code: item.c_code,
          })
        );
        setDropdownData((prevData) => ({
          ...prevData,
          material: MaterialsOptions,
        }));
      } else {
        showToast({ message: "Failed to fetch Materials", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage =
        apiError.response?.data?.error || "Error fetching Materials";
      showToast({ message: errMessage, type: "error" });
    }
  };

  const fetchDimensionalStandards = async (componentId: string) => {
    try {
      // console.log(componentId)
      const response = await api.post(
        configApi.API_URL.dimensionalstandards.bycomponent,
        { component_id: componentId }
      );
      if (response?.data?.success) {
        const dimensionalStandardsOptions =
          response.data.dimensionalStandards.map(
            (item: DimensionalStandard) => ({
              label: item.dimensional_standard,
              value: item.id,
            })
          );
        setDropdownData((prevData) => ({
          ...prevData,
          dimensionalStandard: dimensionalStandardsOptions,
        }));
      } else {
        showToast({
          message: "Failed to fetch Dimensional Standards",
          type: "error",
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage =
        apiError.response?.data?.error ||
        "Error fetching Dimensional Standards";
      showToast({ message: errMessage, type: "error" });
    }
  };

  const fetchComponentDesc = async (projectId: string, componentId: string) => {
    try {
      const payload = {
        componentId,
        projectId,
      };
      const response = await api.post(
        configApi.API_URL.components.data,
        payload
      );
      if (response?.data?.success) {
        setDropdownData((prevData) => ({
          ...prevData,
          itemDescription: response.data.componentDescs.map(
            (item: ComponentDesc) => ({
              label: item.itemDescription,
              value: item.code,
              ratingRequired: item.ratingrequired,
              shortCode: item.short_code,
              g_type: item.g_type,
              s_type: item.s_type,
              c_code: item.c_code,
            })
          ),
        }));
      } else {
        showToast({
          message: "Failed to fetch component descriptions",
          type: "error",
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage =
        apiError.response?.data?.error ||
        "Error fetching component descriptions";
      showToast({ message: errMessage, type: "error" });
    }
  };

  const fetchSizes = async (projectId: string) => {
    try {
      const response = await api.post(configApi.API_URL.sizes.getall, {
        projectId,
      });

      if (response?.data?.success) {
        const sizesWithKeys = response.data.sizes
          .map((size: Size) => ({
            ...size,
            key: size.code,
            c_code: size.c_code,
          }))
          .sort((a: { size_mm: number }, b: { size_mm: number }) => a.size_mm - b.size_mm);
        setSizes(sizesWithKeys);
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({
        message: apiError.response?.data?.error || "Error fetching sizes.",
        type: "error",
      });
    }
  };

  const fetchSchedules = async (projectId: string) => {
    try {
      const response = await api.post(configApi.API_URL.schedules.getall, {
        projectId,
      });

      if (response?.data?.success) {
        const schedulesWithKeys = response.data.schedules
          .map((schedule: Schedule) => ({
            ...schedule,
            key: schedule.code,
            c_code: schedule.c_code,
          }))
          .sort(
            (a: { arrange_od: number }, b: { arrange_od: number }) =>
              a.arrange_od - b.arrange_od
          );
        setSchedules(schedulesWithKeys);
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({
        message: apiError.response?.data?.error || "Error fetching schedules.",
        type: "error",
      });
    }
  };

  const fetchSizeRanges = async () => {
    try {
      const response = await api.post(configApi.API_URL.sizeranges.getall, {
        specId,
      });
      if (response?.data?.success) {
        const sortedSizeRanges = response.data.sizeranges.sort(
          (a: { odValue: number }, b: { odValue: number }) =>
            a.odValue - b.odValue
        );

        const sizeToScheduleMap = sortedSizeRanges.reduce(
          (
            acc: Record<
              string,
              Array<{
                scheduleValue: string;
                scheduleCode: string;
                c_code: string;
              }>
            >,
            item: SizeRange
          ) => {
            if (!acc[item.sizeCode]) {
              acc[item.sizeCode] = [];
            }
            acc[item.sizeCode].push({
              scheduleValue: item.scheduleValue,
              scheduleCode: item.scheduleCode,
              c_code: item.scheduleCode,
            });
            return acc;
          },
          {}
        );

        setDropdownData((prev) => ({
          ...prev,
          size1: sortedSizeRanges.map(
            (item: { sizeValue: string; sizeCode: string }) => ({
              label: item.sizeValue,
              value: item.sizeCode,
            })
          ),
          size2: sortedSizeRanges.map(
            (item: { sizeValue: string; sizeCode: string }) => ({
              label: item.sizeValue,
              value: item.sizeCode,
            })
          ),
          sizeToScheduleMap,
        }));
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({
        message: apiError.response?.data?.error || "Error fetching size ranges",
        type: "error",
      });
    }
  };

  const fetchRatings = async (projectId: string) => {
    try {
      const payload = { projectId };
      const response = await api.post(
        configApi.API_URL.ratings.getAll,
        payload
      );
      if (response?.data?.success) {
        setDropdownData((prevData) => ({
          ...prevData,
          rating: [
            {
              label: 'X',
              value: 'X',
              c_code: 'X'
            },
            ...response.data.ratings.map((item: Rating) => ({
              label: item.ratingValue,
              value: item.ratingCode,
              c_code: item.c_rating_code,
            })),
          ],
        }));
      } else {
        showToast({ message: "Failed to fetch ratings data", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errMessage =
        apiError.response?.data?.error || "Error fetching ratings data";
      showToast({ message: errMessage, type: "error" });
    }
  };

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
      const firstRelatedSchedule =
        relatedSchedules.length > 0 ? relatedSchedules[0].scheduleCode : null;

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

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex)
      return [];
    return sizeValues.slice(startIndex, endIndex + 1);
  };

  const validateScheduleConsistency = (sizeRange: string[], componentType: string) => {
    // If component is not PIPE, return the first schedule directly
    if (componentType !== "PIPE") {
        const firstSizeSchedules = dropdownData.sizeToScheduleMap[sizeRange[0]];
        return firstSizeSchedules?.[0] || null;
    }

    // For PIPE components, perform the existing consistency check
    if (sizeRange.length === 0) return null;

    const firstSizeSchedules = dropdownData.sizeToScheduleMap[sizeRange[0]];
    if (!firstSizeSchedules || firstSizeSchedules.length === 0) return null;

    const referenceSchedule = firstSizeSchedules[0];

    for (const sizeCode of sizeRange) {
      const currentSizeSchedules = dropdownData.sizeToScheduleMap[sizeCode];
      if (!currentSizeSchedules || currentSizeSchedules.length === 0) {
        return null;
      }

      const matchingSchedule = currentSizeSchedules.find(
        (sch: any) => sch.scheduleCode === referenceSchedule.scheduleCode
      );

      if (!matchingSchedule) {
        return null;
      }
    }

    return referenceSchedule;
  };

  const isDuplicateItem = (newItemData: Partial<PMSItem>) => {
    return items.some(item => {
      // Check for matching component type and description
      const componentMatch = item.compType === dropdownData.compType.find(c => c.value === newItemData.compType)?.label;
      const descMatch = item.itemDescription === dropdownData.itemDescription.find(d => d.value === newItemData.itemDescription)?.label;
      
      // Find selected sizes
      const selectedSize1 = sizes.find(s => s.code === newItemData.size1)?.size1_size2;
      const selectedSize2 = sizes.find(s => s.code === newItemData.size2)?.size1_size2;
      
      // Check for matching sizes
      const sizesMatch = item.size1 === selectedSize1 && item.size2 === selectedSize2;
      
      // Find selected material
      const materialMatch = item.material === dropdownData.material.find(m => m.value === newItemData.material)?.label;
      
      // Find selected rating
      const selectedRating = newItemData.rating 
        ? dropdownData.rating.find(r => r.value === newItemData.rating)?.label 
        : 'X';
      const ratingMatch = item.rating === selectedRating;
      
      // Find selected dimensional standard
      const dimensionalStandardMatch = item.dimensionalStandard === dropdownData.dimensionalStandard.find(
        d => d.value === newItemData.dimensionalStandard
      )?.label;

      return componentMatch && descMatch && sizesMatch && materialMatch && ratingMatch && dimensionalStandardMatch;
    });
  };

  const handleAddItem = async () => {
    if (
      !newItem.compType ||
      !newItem.itemDescription ||
      !newItem.size1 ||
      !newItem.size2
    ) {
      message.error("Please fill all required fields");
      return;
    }

    if (isDuplicateItem(newItem)) {
      message.error("This item already exists in the table");
      return;
    }

    try {
      setButtonLoading(true);

      const selectedComponent = dropdownData.compType.find(
        (item) => item.value === newItem.compType
      );

      const sizeRange = generateSizeRangeArray(newItem.size1, newItem.size2);

      const scheduleInfo = validateScheduleConsistency(sizeRange, selectedComponent ? selectedComponent.label : "");

      if (!scheduleInfo) {
        message.error(
          "Selected size range does not have consistent schedule values"
        );
        return;
      }

      const payload = {
        specId,
        component: {
          Code: selectedComponent?.value,
        },
        componentDesc: {
          code: newItem.itemDescription,
        },
        size1: {
          code: newItem.size1,
        },
        size2: {
          code: newItem.size2,
        },
        schedule: {
          code: scheduleInfo.scheduleCode,
        },
        rating: {
          code: newItem.rating || "X",
        },
        material: {
          code: newItem.material,
        },
        dimensionalStandard: {
          id: newItem.dimensionalStandard,
        },
      };

      const response = await api.post(configApi.API_URL.pms.create, payload);

      if (response.data.success) {
        message.success("Items added successfully");
        fetchPMSItems(specId);
      } else {
        message.error("Failed to add items");
      }
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.error || "Error adding items");
    } finally {
      setButtonLoading(false);
    }
  };


  const handleCompTypeChange = (value: string) => {
    const projectId = localStorage.getItem("currentProjectId") || "";

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

    setDropdownData((prevData) => ({
      ...prevData,
      itemDescription: [],
      material: [],
      dimensionalStandard: [],
    }));

    setShowRatingDropdown(false);
    setIsAllMaterial(false);

    // Fetch new data for the selected component
    fetchComponentDesc(projectId, value);
    fetchMaterials(projectId, value, false);
    fetchDimensionalStandards(value);
  };

  const handleComponentDescChange = (value: string) => {
    const selectedItem = dropdownData.itemDescription.find(
      (item) => item.value === value
    );
    setNewItem((prevNewItem) => ({
      ...prevNewItem,
      itemDescription: value,
      c_code: selectedItem?.c_code,
      g_type: selectedItem?.g_type,
      s_type: selectedItem?.s_type,
    }));
    setShowRatingDropdown(!!selectedItem?.ratingRequired);
  };

  const handleAllMaterialChange = (e: CheckboxChangeEvent) => {
    const projectId = localStorage.getItem("currentProjectId") || "";
    const componentId = newItem.compType || "";
    const isAll = e.target.checked;

    setIsAllMaterial(isAll);
    fetchMaterials(projectId, componentId, isAll);
  };
  const handleDelete = async (id: string) => {
    try {
      const response = await api.post(configApi.API_URL.pms.delete, { id });
      if (response?.data?.success) {
        message.success("Item deleted successfully");
        fetchPMSItems(specId);
      } else {
        message.error("Failed to delete item");
      }
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.error || "Error deleting item");
    }
  };

  const handleCellDoubleClick = async (record: PMSItem, dataIndex: keyof PMSItem) => {
    setEditingCell({
      key: record.key,
      dataIndex,
      value: record[dataIndex],
      originalRecord: record
    });

    // Fetch necessary data for dropdowns
    const projectId = localStorage.getItem("currentProjectId") || "";
    
    switch(dataIndex) {
      case "compType":
        await fetchComponents();
        break;
      case "itemDescription":
        await fetchComponentDesc(projectId, record.compCode);
        break;
      case "material":
        await fetchMaterials(projectId, record.compCode, false);
        break;
      case "dimensionalStandard":
        await fetchDimensionalStandards(record.compCode);
        break;
      case "rating":
        await fetchRatings(projectId);
        break;
      case "size1":
      case "size2":
        await fetchSizes(projectId);
        break;
      default:
        break;
    }
  };

  // New function to prepare payload based on cell type
  const prepareCellUpdatePayload = () => {
    if (!editingCell) return null;

    const { dataIndex, value, originalRecord } = editingCell;
    let updatePayload: any = {
      id: editingCell.key,
      specId,
      editingCell: dataIndex
    };
    switch(dataIndex) {
      case "compType": {
        const selectedComp = dropdownData.compType.find(item => item.value === value);
        if(selectedComp?.label === originalRecord.compType) return;
        updatePayload = {
          ...updatePayload,
          component: {
            Value: selectedComp?.label,
            Code: selectedComp?.value
          }
        };
        break;
      }
      case "itemDescription": {
        const selectedDesc = dropdownData.itemDescription.find(item => item.value === value);
        if(selectedDesc?.label === originalRecord.itemDescription) return;
        updatePayload = {
          ...updatePayload,
          componentDesc: {
            value: selectedDesc?.label,
            code: value,
            clientCode: selectedDesc?.c_code,
            gType: selectedDesc?.g_type,
            sType: selectedDesc?.s_type
          }
        };
        break;
      }
      case "material": {
        const selectedMaterial = dropdownData.material.find(item => item.value === value);
        if(selectedMaterial?.label === originalRecord.material) return;
        updatePayload = {
          ...updatePayload,
          material: {
            value: selectedMaterial?.label,
            code: selectedMaterial?.value,
            clientCode: selectedMaterial?.c_code
          }
        };
        break;
      }
      case "dimensionalStandard": {
        const selectedStandard = dropdownData.dimensionalStandard.find(item => item.value === value);
        if(selectedStandard?.label === originalRecord.dimensionalStandard)
        updatePayload = {
          ...updatePayload,
          dimensionalStandard: {
            Value: selectedStandard?.label,
            id: selectedStandard?.value
          }
        };
        break;
      }
      case "rating": {
        const selectedRating = dropdownData.rating.find(item => item.value === value);
        if(selectedRating?.label === originalRecord.rating) return;
        updatePayload = {
          ...updatePayload,
          rating: {
            value: selectedRating?.label || null,
            code: selectedRating?.value || "X",
            clientCode: selectedRating?.c_code || "X"
          }
        };
        break;
      }
      case "size1":{
        const selectedSize = sizes.find(item => item.code === value);
        // tomorrow need to sepearte sizes and check weather it is increasing or not.
        if(selectedSize!.size1_size2 === originalRecord.size1) return;
        if(selectedSize!.size1_size2 > originalRecord.size2 ){
          message.error("Size 1 cannot be greater than Size 2");
          return;
        }
        updatePayload = {
          ...updatePayload,
          [dataIndex]: {
            value: selectedSize?.size1_size2,
            code: selectedSize?.code,
            c_code:selectedSize?.code
          }
        };
        break;
      }
      case "size2": {
        const selectedSize = sizes.find(item => item.code === value);
        // tomorrow need to sepearte sizes and check weather it is increasing or not.
        if(selectedSize?.size1_size2 === originalRecord.size2) return;
        if(selectedSize!.size1_size2 < originalRecord.size1 ){
          message.error("Size 2 cannot be lesser than Size 1");
          return;
        }
        updatePayload = {
          ...updatePayload,
          [dataIndex]: {
            value: selectedSize?.size1_size2,
            code: selectedSize?.code,
            c_code:selectedSize?.code
          }
        };
        break;
      }
      default:
        updatePayload[dataIndex] = value;
    }

    return updatePayload;
  };

  // Handle cell value change
  const handleCellValueChange = (value: any) => {
    if (editingCell) {
      setEditingCell((prev) => (prev ? { ...prev, value } : null));
    }
  };

  // Handle save cell value
  const handleSaveCellValue = async () => {
    if (!editingCell) return;

    const record = items.find((item) => item.key === editingCell.key);
    if (!record || record[editingCell.dataIndex] === editingCell.value) {
      setEditingCell(null);
      return;
    }

    try {
      const payload = prepareCellUpdatePayload();
      if (!payload) {
        // message.error("Failed to prepare update payload");
        return;
      }

      const response = await api.post(configApi.API_URL.pms.update, payload);
      if (response?.data?.success) {
        message.success("Item updated successfully");
        fetchPMSItems(specId);
      } else {
        message.error("Failed to update item");
      }
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.error || "Error updating item");
    } finally {
      setEditingCell(null);
    }
  };

  // Handle cell edit cancel
  const handleCellEditCancel = () => {
    setEditingCell(null);
  };

  // Handle keypress in editable cell
  const handleCellKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveCellValue();
    } else if (e.key === "Escape") {
      handleCellEditCancel();
    }
  };

  const handleGenerateReviewOutput = async() => {

    const projectId = localStorage.getItem("currentProjectId") || "";
    try {
      setReviewLoading(true);
      const response = await api.post(configApi.API_URL.output.getAll, {
        specId,
        projectId,
      });
      if (response?.data?.success) {
        message.success("Review output generated successfully");
        setReviewData(response.data?.data);
      } else {
        message.error("Failed to generate review output");
      } 
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.error || "Error adding items");
    } finally {
      setReviewLoading(false);
      setIsModalOpen(true);
    }
  };

  const transformData = (data: any[]) => {
    return data.map(item => ({
      spec: item.spec,
      compType: item.CompType,
      shortCode: item.ShortCode,
      itemCode: item.ItemCode,
      cItemCode: item.CItemCode,
      itemLongDesc: item.ItemLongDesc,
      itemShortDesc: item.ItemShortDesc,
      size1Inch: formatSize(item.Size1Inch),
      size2Inch: item.Size2Inch === 'X' ? 0 : formatSize(item.Size2Inch),
      size1MM: item.Size1MM,
      size2MM: item.Size2MM === 'X' ? 0 :item.Size2MM,
      sch1: item.Sch1,
      sch2: item.Sch2,
      rating: item.Rating,
      unitWt: 0, // You'll need to add this if it's required
      gType: item.GType,
      sType: item.SType,
      catRef: item.Catref 
    }));
  };
  
  // Helper function to format sizes
  const formatSize = (size: string | number): number => {
    const parsedSize = typeof size === 'string' ? parseFloat(size.replace(/"/g, '')) : size;
    
    return parsedSize % 1 === 0 ? Math.trunc(parsedSize) : parseFloat(parsedSize.toFixed(2));
  };
  

  const columns: ColumnsType<PMSItem> = [
    {
      title: "Comp Type",
      dataIndex: "compType",
      key: "compType",
      onCell: (record) => ({
        onDoubleClick: () => handleCellDoubleClick(record, "compType"),
      }),
      render: (text, record) => {
        const isEditing =
          editingCell?.key === record.key &&
          editingCell?.dataIndex === "compType";
        return isEditing ? (
          <Select
            ref={selectRef}
            autoFocus
            value={editingCell.value}
            onChange={handleCellValueChange}
            onBlur={handleSaveCellValue}
            onKeyDown={handleCellKeyPress}
            options={dropdownData.compType}
            open={true}
            style={dropdownStyles.dropdown}
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Item Description",
      dataIndex: "itemDescription",
      key: "itemDescription",
      onCell: (record) => ({
        onDoubleClick: () => handleCellDoubleClick(record, "itemDescription"),
      }),
      render: (text, record) => {
        const isEditing =
          editingCell?.key === record.key &&
          editingCell?.dataIndex === "itemDescription";
        return isEditing ? (
          <Select
            ref={selectRef}
            autoFocus
            value={editingCell.value}
            onChange={handleCellValueChange}
            onBlur={handleSaveCellValue}
            onKeyDown={handleCellKeyPress}
            options={dropdownData.itemDescription}
            open={true}
            style={dropdownStyles.dropdownlarge}
          />
        ) : (
          text
        );
      },
      width: "22%",
    },
    {
      title: "Size-1",
      dataIndex: "size1",
      key: "size1",
      onCell: (record) => ({
        onDoubleClick: () => handleCellDoubleClick(record, "size1"),
      }),
      render: (text, record) => {
        const isEditing =
          editingCell?.key === record.key &&
          editingCell?.dataIndex === "size1";
        return isEditing ? (
          <Select
            ref={selectRef}
            autoFocus
            value={editingCell.value}
            onChange={handleCellValueChange}
            onBlur={handleSaveCellValue}
            onKeyDown={handleCellKeyPress}
            options={dropdownData.size1}
            open={true}
            style={dropdownStyles.dropdown}
          />
        ) : (
          text
        );
      },
      width: "7%",
    },
    {
      title: "Size-2",
      dataIndex: "size2",
      key: "size2",
      onCell: (record) => ({
        onDoubleClick: () => handleCellDoubleClick(record, "size2"),
      }),
      render: (text, record) => {
        const isEditing =
          editingCell?.key === record.key &&
          editingCell?.dataIndex === "size2";
        return isEditing ? (
          <Select
            ref={selectRef}
            autoFocus
            value={editingCell.value}
            onChange={handleCellValueChange}
            onBlur={handleSaveCellValue}
            onKeyDown={handleCellKeyPress}
            options={dropdownData.size2}
            open={true}
            style={dropdownStyles.dropdown}
          />
        ) : (
          text
        );
      },
      width: "7%",
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
      key: "schedule",
      width: "7%",
      render: (text, record) => {
        if (record.compType === 'PIPE') {
          return text;
        }
        
        return (
          <Tooltip title="Same as Pipe">
            <span>M</span>
          </Tooltip>
        );
      }
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      onCell: (record) => ({
        onDoubleClick: () => handleCellDoubleClick(record, "rating"),
      }),
      render: (text, record) => {
        const isEditing =
          editingCell?.key === record.key &&
          editingCell?.dataIndex === "rating";
        return isEditing ? (
          <Select
            ref={selectRef}
            autoFocus
            value={editingCell.value}
            onChange={handleCellValueChange}
            onBlur={handleSaveCellValue}
            onKeyDown={handleCellKeyPress}
            options={dropdownData.rating}
            open={true}
            style={dropdownStyles.dropdown}
          />
        ) : (
          text
        );
      },
      width: "6%",
    },
    {
      title: "Material",
      dataIndex: "material",
      key: "material",
      onCell: (record) => ({
        onDoubleClick: () => handleCellDoubleClick(record, "material"),
      }),
      render: (text, record) => {
        const isEditing =
          editingCell?.key === record.key &&
          editingCell?.dataIndex === "material";
        return isEditing ? (
          <Select
            ref={selectRef}
            autoFocus
            value={editingCell.value}
            onChange={handleCellValueChange}
            onBlur={handleSaveCellValue}
            onKeyDown={handleCellKeyPress}
            options={dropdownData.material}
            open={true}
            style={dropdownStyles.dropdownlarge}
          />
        ) : (
          text
        );
      },
      width: "15%",
    },
    {
      title: "Dimensional Standard",
      dataIndex: "dimensionalStandard",
      key: "dimensionalStandard",
      onCell: (record) => ({
        onDoubleClick: () =>
          handleCellDoubleClick(record, "dimensionalStandard"),
      }),
      render: (text, record) => {
        const isEditing =
          editingCell?.key === record.key &&
          editingCell?.dataIndex === "dimensionalStandard";
        return isEditing ? (
          <Select
            ref={selectRef}
            autoFocus
            value={editingCell.value}
            onChange={handleCellValueChange}
            onBlur={handleSaveCellValue}
            onKeyDown={handleCellKeyPress}
            options={dropdownData.dimensionalStandard}
            open={true}
            style={dropdownStyles.dropdown}
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        return (
          <div className="flex gap-2">
              <>
                <Popconfirm
                  title="Are you sure you want to delete this item?"
                  onConfirm={() => handleDelete(record.key)}
                >
                  <Button
                    type="link"
                    danger
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </Popconfirm>
              </>
            
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "80vw" }}>
      <h2>PMS Creation</h2>
      <Form layout="vertical" className="mb-6 mt-5">
      {/* First Row */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-black ">
                Component Type<span className="text-red-500"> *</span>
              </span>
            }
          >
            <Select
              placeholder="Comp Type"
              value={newItem.compType}
              onChange={handleCompTypeChange}
              options={dropdownData.compType}
              className="w-full"
            />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            label={
              <span className="text-black ">
                Item Description<span className="text-red-500"> *</span>
              </span>
            }
          >
            <Select
              placeholder="Item Description"
              value={newItem.itemDescription}
              onChange={handleComponentDescChange}
              options={dropdownData.itemDescription.map(
                ({ label, value }) => ({ label, value })
              )}
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Second Row */}
      <Row gutter={16}>
        <Col span={4}>
          <Form.Item
            label={
              <span className="text-black ">
                Size-1<span className="text-red-500"> *</span>
              </span>
            }
          >
            <Select
              placeholder="Size-1"
              value={newItem.size1}
              onChange={(value) => handleSizeChange("size1", value)}
              options={dropdownData.size1}
              className="w-full"
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label={
              <span className="text-black ">
                Size-2<span className="text-red-500"> *</span>
              </span>
            }
          >
            <Select
              placeholder="Size-2"
              value={newItem.size2}
              onChange={(value) => handleSizeChange("size2", value)}
              options={dropdownData.size2}
              className="w-full"
            />
          </Form.Item>
        </Col>
        {showRatingDropdown && (
          <Col span={4}>
            <Form.Item
              label={
                <span className="text-black ">
                  Rating<span className="text-red-500"> *</span>
                </span>
              }
            >
              <Select
                placeholder="Rating"
                value={newItem.rating}
                onChange={(value) =>
                  setNewItem({ ...newItem, rating: value })
                }
                options={dropdownData.rating}
                className="w-full"
              />
            </Form.Item>
          </Col>
        )}
        <Col span={6}>
          <Form.Item
            label={
              <span className="text-black ">
                Material<span className="text-red-500"> *</span>
              </span>
            }
          >
            <Select
              placeholder="Material"
              value={newItem.material}
              onChange={(value) =>
                setNewItem({ ...newItem, material: value })
              }
              options={dropdownData.material}
              className="w-full"
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label={
              <span className="text-black ">
                &nbsp;
              </span>
            }
          >
            <Checkbox
              checked={isAllMaterial}
              onChange={handleAllMaterialChange}
              className="text-black  mt-2"
            >
              All Material
            </Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-black ">
                Dimensional Standard<span className="text-red-500"> *</span>
              </span>
            }
          >
            <Select
              placeholder="Dimensional Standard"
              value={newItem.dimensionalStandard}
              onChange={(value) =>
                setNewItem({ ...newItem, dimensionalStandard: value })
              }
              options={dropdownData.dimensionalStandard}
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>

      <div className="flex justify-between items-center mt-4">
        <Button 
          type="primary" 
          onClick={handleAddItem} 
          loading={buttonLoading}
        >
          Add Item
        </Button>
        
        <Button 
          className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          onClick={() => handleGenerateReviewOutput()}
          loading={reviewLoading}
        >
          Generate Review Output
        </Button>
      </div>
      <Table
        style={{ marginTop: "20px" }}
        columns={columns}
        dataSource={items}
        loading={tableLoading}
        pagination={false}
        rowClassName="editable-row"
      />
      <ReviewOutputModal 
        // specId={specId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={transformData(reviewData)}
      />
    </div>
  );
};

export default PMSCreation;
