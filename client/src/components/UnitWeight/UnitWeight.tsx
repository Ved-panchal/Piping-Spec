/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Button, Select, Input, Table, Row, Col } from "antd";
import { api as configApi } from "../../utils/api/config";
import api from "../../utils/api/apiutils";
import showToast from "../../utils/toast";
import { ColumnsType } from "antd/es/table";

// Define the types and interfaces
interface DropdownOption {
  label: string;
  value: string;
}

interface ReviewOutputData {
  // spec: string;
  compType: string;
  shortCode: string;
  itemCode: string;
  clientItemCode: string;
  itemLongDesc: string;
  itemShortDesc: string;
  size1Inch: string;
  size1MM: string;
  size2Inch: string;
  size2MM: string;
  sch1: string;
  sch2: string;
  rating: string;
  unitWt: string;
  // gType: string;
  // sType: string;
  // skey: string;
  // catref: string;
}

interface Filters {
  compType: string | undefined;
  size1: string | undefined;
  size2: string | undefined;
  rating: string | undefined;
}

interface Dropdowns {
  compType: DropdownOption[];
  size1: DropdownOption[];
  size2: DropdownOption[];
  rating: DropdownOption[];
}

const UnitWeight: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    compType: undefined,
    size1: undefined,
    size2: undefined,
    rating: undefined,
  });

  const [dropdowns, setDropdowns] = useState<Dropdowns>({
    compType: [],
    size1: [],
    size2: [],
    rating: [],
  });

  const [data, setData] = useState<ReviewOutputData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Load dropdown options for component type, sizes, and rating
  const loadDropdowns = async () => {
    const projectId = localStorage.getItem("currentProjectId") || "";

    try {
      const [compRes, sizeRes, ratingRes] = await Promise.all([
        api.get(configApi.API_URL.components.list),
        api.post(configApi.API_URL.sizes.getall, { projectId }),
        api.post(configApi.API_URL.ratings.getAll, { projectId }),
      ]);

      const compType = compRes?.data?.components?.map((c: any) => ({
        label: c.componentname,
        value: c.componentname,
      })) || [];

      const sizes = sizeRes?.data?.sizes?.map((s: any) => ({
        label: s.size1_size2,
        value: s.size1_size2,
      })) || [];

      // Sorting sizes in ascending order based on the size value
      const sortedSizes = sizes.sort((a: { value: string }, b: { value: string }) => {
        const sizeA = parseFloat(a.value.replace(/[^0-9.-]+/g, "")); // Remove non-numeric characters
        const sizeB = parseFloat(b.value.replace(/[^0-9.-]+/g, ""));
        return sizeA - sizeB; // Sort in ascending order
      });

      const rating = ratingRes?.data?.ratings?.map((r: any) => ({
        label: r.ratingValue,
        value: r.ratingValue,
      })) || [];

      setDropdowns({
        compType,
        size1: sortedSizes,
        size2: sortedSizes,
        rating,
      });
    } catch (err) {
      showToast({ type: "error", message: "Error loading dropdowns" });
    }
  };

  // Update unit weight via API
  const updateUnitWeight = async (itemCode: string, unitWeight: string) => {
    // Add item to updating set to show loading state
    setUpdatingItems(prev => new Set([...prev, itemCode]));
    
    try {
      const response = await api.post(configApi.API_URL.unitWeight.update, {
        itemCode,
        unitWeight,
      });

      if (response?.data?.success) {
        // showToast({ 
        //   message: response.data.message || "Unit Weight updated successfully", 
        //   type: "success" 
        // });
        
        // Optionally update the local data with the response
        if (response.data.data) {
          setData(prevData => 
            prevData.map(item => 
              item.itemCode === itemCode 
                ? { ...item, unitWt: response.data.data.unit_weight }
                : item
            )
          );
        }
      } else {
        showToast({ 
          message: response?.data?.message || "Error updating Unit Weight", 
          type: "error" 
        });
        
        fetchFilteredData();
      }
    } catch (err: any) {
      console.error("Error updating unit weight:", err);
      showToast({ 
        message: err?.response?.data?.message || "Error updating Unit Weight", 
        type: "error" 
      });
      
      // Revert the change in UI if API call failed
      fetchFilteredData();
    } finally {
      // Remove item from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemCode);
        return newSet;
      });
    }
  };

  const [updateTimeouts, setUpdateTimeouts] = useState<{ [key: string]: number }>({});

  const debounceUpdate = (itemCode: string, unitWeight: string, delay: number = 1000) => {
    if (updateTimeouts[itemCode]) {
      clearTimeout(updateTimeouts[itemCode]);
    }
    
    const timeoutId = setTimeout(() => {
      updateUnitWeight(itemCode, unitWeight);
      setUpdateTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[itemCode];
        return newTimeouts;
      });
    }, delay);

    setUpdateTimeouts(prev => ({
      ...prev,
      [itemCode]: timeoutId
    }));
  };

  const handleUnitWeightChange = (value: string, itemCode: string, index: number) => {
    const updated = [...data];
    updated[index].unitWt = value;
    setData(updated);
    
    // Debounce the API call
    debounceUpdate(itemCode, value);
  };

  // Fetch filtered data based on dropdown selections
  const mapData = (rawData: any[]) => {
    return rawData.map((item) => ({
      // spec: item.spec || "", // Mapping to 'Spec' column
      compType: item.comp_type || "", // Mapping to 'Component' column
      shortCode: item.short_code || "", // Mapping to 'Short Code' column
      itemCode: item.item_code || "", // Mapping to 'Item Code' column
      clientItemCode: item.client_item_code || "", // Mapping to 'Client Item Code' column
      itemLongDesc: item.item_long_desc || "", // Mapping to 'Item Long Desc' column
      itemShortDesc: item.item_short_desc || "", // Mapping to 'Item Short Desc' column
      size1Inch: item.size1_inch || "", // Mapping to 'Size1 Inch' column
      size1MM: item.size1_mm || "", // Mapping to 'Size1 MM' column
      size2Inch: item.size2_inch || "", // Mapping to 'Size2 Inch' column
      size2MM: item.size2_mm || "", // Mapping to 'Size2 MM' column
      sch1: item.sch_1 || "", // Mapping to 'Sch 1' column
      sch2: item.sch_2 || "", // Mapping to 'Sch 2' column
      rating: item.rating || "", // Mapping to 'Rating' column
      unitWt: item.unit_weight || "", // Mapping to 'Unit Weight' column
      // gType: item.g_type || "", // Mapping to 'G Type' column
      // sType: item.s_type || "", // Mapping to 'S Type' column
      // skey: item.skey || "", // Mapping to 'SKey' column
      // catref: item.catref || "", // Mapping to 'Cat Ref' column
    }));
  };

  // Example usage after fetching data
  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const filtersToSend: any = {};
      if (filters.compType) filtersToSend.compType = filters.compType;
      if (filters.size1) filtersToSend.size1 = filters.size1;
      if (filters.size2) filtersToSend.size2 = filters.size2;
      if (filters.rating) filtersToSend.rating = filters.rating;

      const projectId = localStorage.getItem("currentProjectId");
      const response = await api.get(configApi.API_URL.unitWeight.get, {
        params: { projectId, ...filtersToSend },
      });

      if (response?.data?.success) {
        const mappedData = mapData(response.data.data); // Map the data before setting it
        console.log(mappedData);
        setData(mappedData);
        showToast({ message: response.data.message, type: "success" });
      } else {
        showToast({ message: response.data.message, type: "error" });
      }
    } catch (err:any) {
      console.log(err.response)
      showToast({ message: err.response?.data?.error, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest data from the API
  const fetchLatestData = async () => {
    setLoading(true);
    try {
      const projectId = localStorage.getItem("currentProjectId");
      const response = await api.post(configApi.API_URL.unitWeight.load, {
        projectId
      });

      if (response?.data?.success) {
        // setData(response.data.data); // Set the data from the latest load
        showToast({ message: response.data.message, type: "success" });
      } else {
        showToast({ message: response.data.error, type: "error" });
      }
    } catch (err) {
      showToast({ message: "Error fetching latest data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (value: string | undefined, type: string) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [type]: value };
      return updatedFilters;
    });
  };

  useEffect(() => {
    if (filters.compType || filters.size1 || filters.size2 || filters.rating) {
      fetchFilteredData();
    }
  }, [filters]); // Re-run this effect when filters change

  useEffect(() => {
    loadDropdowns(); // Load dropdown options on mount
  }, []);

  // Define the table columns with appropriate widths
  const columns: ColumnsType<ReviewOutputData> = [
    { 
      title: "Spec", 
      dataIndex: "spec", 
      key: "spec", 
      width: 80,
      ellipsis: true 
    },
    { 
      title: "Component", 
      dataIndex: "compType", 
      key: "compType", 
      width: 100,
      ellipsis: true 
    },
    { 
      title: "Short Code", 
      dataIndex: "shortCode", 
      key: "shortCode", 
      width: 100,
      ellipsis: true 
    },
    { 
      title: "Item Code", 
      dataIndex: "itemCode", 
      key: "itemCode", 
      fixed: 'left',
      width: 120,
      ellipsis: true 
    },
    { 
      title: "Client Item Code", 
      dataIndex: "clientItemCode", 
      key: "clientItemCode", 
      width: 140,
      ellipsis: true 
    },
    { 
      title: "Item Long Desc", 
      dataIndex: "itemLongDesc", 
      key: "itemLongDesc", 
      width: 200,
      ellipsis: true 
    },
    { 
      title: "Item Short Desc", 
      dataIndex: "itemShortDesc", 
      key: "itemShortDesc", 
      width: 150,
      ellipsis: true 
    },
    { 
      title: "Size1 Inch", 
      dataIndex: "size1Inch", 
      key: "size1Inch", 
      width: 90,
      ellipsis: true 
    },
    { 
      title: "Size1 MM", 
      dataIndex: "size1MM", 
      key: "size1MM", 
      width: 80,
      ellipsis: true 
    },
    { 
      title: "Size2 Inch", 
      dataIndex: "size2Inch", 
      key: "size2Inch", 
      width: 90,
      ellipsis: true 
    },
    { 
      title: "Size2 MM", 
      dataIndex: "size2MM", 
      key: "size2MM", 
      width: 80,
      ellipsis: true 
    },
    { 
      title: "Sch 1", 
      dataIndex: "sch1", 
      key: "sch1", 
      width: 70,
      ellipsis: true 
    },
    { 
      title: "Sch 2", 
      dataIndex: "sch2", 
      key: "sch2", 
      width: 70,
      ellipsis: true 
    },
    { 
      title: "Rating", 
      dataIndex: "rating", 
      key: "rating", 
      width: 80,
      ellipsis: true 
    },
    {
      title: "Unit Weight",
      dataIndex: "unitWt",
      key: "unitWt",
      width: 120,
      render: (_: string, record: ReviewOutputData, index: number) => {
        const isUpdating = updatingItems.has(record.itemCode);
        
        return (
          <Input
            value={record.unitWt}
            onChange={(e) => handleUnitWeightChange(e.target.value, record.itemCode, index)}
            size="small"
            // loading={isUpdating}
            style={{ 
              opacity: isUpdating ? 0.6 : 1,
              borderColor: isUpdating ? '#1890ff' : undefined
            }}
            placeholder="Enter weight"
          />
        );
      },
    },
    { 
      title: "G Type", 
      dataIndex: "gType", 
      key: "gType", 
      width: 80,
      ellipsis: true 
    },
    { 
      title: "S Type", 
      dataIndex: "sType", 
      key: "sType", 
      width: 80,
      ellipsis: true 
    },
    { 
      title: "SKey", 
      dataIndex: "skey", 
      key: "skey", 
      width: 100,
      ellipsis: true 
    },
    { 
      title: "Cat Ref", 
      dataIndex: "catref", 
      key: "catref", 
      width: 100,
      ellipsis: true 
    },
  ];

  return (
    <div style={{ padding: "2px" }}>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Button type="primary" onClick={fetchLatestData}>
            Load Latest Data
          </Button>
        </Col>
        <Col>
          <Row gutter={8}>
            <Col>
              <Select
                placeholder="Component"
                value={filters.compType}
                options={dropdowns.compType}
                onChange={(value) => handleDropdownChange(value, "compType")}
                allowClear
                style={{ width: 130 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Size1"
                value={filters.size1}
                options={dropdowns.size1}
                onChange={(value) => handleDropdownChange(value, "size1")}
                allowClear
                style={{ width: 100 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Size2"
                value={filters.size2}
                options={dropdowns.size2}
                onChange={(value) => handleDropdownChange(value, "size2")}
                allowClear
                style={{ width: 100 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Rating"
                value={filters.rating}
                options={dropdowns.rating}
                onChange={(value) => handleDropdownChange(value, "rating")}
                allowClear
                style={{ width: 120 }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <div style={{ maxWidth:"80vw",overflowX: "auto" }}>
        <Table
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey={(record) => record.itemCode}
          bordered
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default UnitWeight;