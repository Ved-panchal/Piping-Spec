import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Table, Button, Form, message, Select, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { Trash2, Info } from "lucide-react";
import api from "../../utils/api/apiutils";
import { api as configApi } from "../../utils/api/config";
import showToast from "../../utils/toast";
import deleteWithBody from "../../utils/api/DeleteAxios";
import ConfirmationModal from "../ConfirmationDeleteModal/CornfirmationModal";
import {
  ApiError,
  DeleteResponse,
  Schedule,
  Size,
  SizeRange as Sizerange
} from "../../utils/interface";
import Title from "antd/es/typography/Title";

const { Option } = Select;

interface OptionType {
  value: string;
  label: string;
  size_mm?: number;
  arrange_od?: number;
}

// interface EditableCellProps extends TdHTMLAttributes<unknown> {
//   record: Sizerange;
//   editable: boolean;
//   dataIndex: keyof Sizerange;
// }

const SizeRange: React.FC<{ specId: string }> = ({ specId }) => {
  const [sizeRanges, setSizeRanges] = useState<Sizerange[]>([]);
  const [newSize, setNewSize] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | number | null>(null);
  const [sizeOptions, setSizeOptions] = useState<OptionType[]>([]);
  const [filteredSizeOptions, setFilteredSizeOptions] = useState<OptionType[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<OptionType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sizeRangeToDelete, setSizeRangeToDelete] = useState<Sizerange | null>(null);

  // Update filtered size options when sizeRanges or sizeOptions change
  useEffect(() => {
    if (sizeOptions.length > 0) {
      const existingSizes = sizeRanges.map(range => range.sizeValue);
      const filtered = sizeOptions.filter(option => !existingSizes.includes(option.label));
      setFilteredSizeOptions(filtered);
    }
  }, [sizeRanges, sizeOptions]);

  useEffect(() => {
    if (!specId) {
      showToast({ message: "Please select a spec first", type: "info" });
      return;
    }
    fetchSizeRange();
    const projectId = localStorage.getItem("currentProjectId");
    if (projectId) {
      fetchSizeAndScheduleOptions(projectId);
    }
  }, [specId]);

  const fetchSizeRange = async () => {
    try {
      setLoading(true);
      const response = await api.post(configApi.API_URL.sizeranges.getall, { specId });
      
      if (response.data.success) {
        const sizeRangesWithKey = response.data.sizeranges
          .map((range: Sizerange) => ({
            key: range.id,
            sizeValue: range.sizeValue,
            sizeCode: range.sizeCode,
            scheduleValue: range.scheduleValue,
            scheduleCode: range.scheduleCode,
            odValue: range.odValue,
          }))
          .sort((a: { sizeValue: number }, b: { sizeValue: number }) => 
            a.sizeValue - b.sizeValue
          );

        setSizeRanges(sizeRangesWithKey);
      } else {
        throw new Error("Failed to fetch size ranges");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || "Failed to load size ranges";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSizeAndScheduleOptions = async (projectId: string) => {
    try {
      const payload = { projectId };
      const sizeResponse = await api.post(configApi.API_URL.sizes.getall, payload);
      const scheduleResponse = await api.post(configApi.API_URL.schedules.getall, payload);

      if (sizeResponse.data.success && scheduleResponse.data.success) {
        const sizes = sizeResponse.data.sizes
          .map((size: Size) => ({
            value: size.size1_size2,
            label: size.size1_size2,
            size_mm: size.size_mm,
          }))
          .sort((a: { size_mm: number }, b: { size_mm: number }) => 
            a.size_mm - b.size_mm
          );

        const schedules = scheduleResponse.data.schedules
          .map((schedule: Schedule) => ({
            value: schedule.code,
            label: schedule.sch1_sch2,
            arrange_od: schedule.arrange_od,
          }))
          .sort((a: { arrange_od: number }, b: { arrange_od: number }) => 
            a.arrange_od - b.arrange_od
          );

        setSizeOptions(sizes);
        setScheduleOptions(schedules);
      } else {
        throw new Error("Failed to fetch options");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || "Failed to fetch dropdown options";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  const handleAddSizeRange = async () => {
    if (!newSize || newSize.length === 0) {
      message.error("Please select at least one size");
      return;
    }

    setBtnLoading(true);
    try {
      const payload = {
        sizes: newSize,
        scheduleCode: "ST",
        specId,
      };

      const response = await api.post(configApi.API_URL.sizeranges.create, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        showToast({ message: "Size range added successfully", type: "success" });
        setNewSize([]);
        fetchSizeRange();
      } else {
        throw new Error("Failed to add size range");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || "Failed to add size range";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteSizeRange = async (key: string | number, odValue: string) => {
    try {
      await deleteWithBody<DeleteResponse>(
        configApi.API_URL.sizeranges.delete, 
        { id: key, size_value: odValue }
      );
      setSizeRanges(prev => prev.filter(sizeRange => sizeRange.key !== key));
      setIsModalOpen(false);
      showToast({ message: "Size range deleted successfully", type: "success" });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || "Failed to delete size range";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  const handleScheduleChange = async (record: Sizerange, value: string) => {
    const schedule = scheduleOptions.find(s => s.label === value);
    if (!schedule) return;
    
    try {
      const payload = {
        id: record.key,
        sizeCode: record.sizeCode,
        scheduleCode: schedule.value,
        specId,
      };
      
      const response = await api.put(configApi.API_URL.sizeranges.update, payload);
      
      if (response.data.success) {
        setSizeRanges(prev =>
          prev.map(range =>
            range.key === record.key ? { ...range, scheduleValue: value, scheduleCode: schedule.value } : range
          )
        );
        showToast({ message: "Schedule updated successfully", type: "success" });
      } else {
        throw new Error("Failed to update schedule");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || "Failed to update schedule";
      showToast({ message: errorMessage, type: "error" });
      fetchSizeRange(); // Refresh data if update fails
    }
  };

  const columns: ColumnsType<Sizerange> = [
    {
      title: "Size",
      dataIndex: "sizeValue",
      key: "sizeValue",
      width: '40%',
      render: (text) => (
        <div className="font-medium">{text}</div>
      )
    },
    {
      title: "Schedule",
      dataIndex: "scheduleValue",
      key: "scheduleValue",
      width: '40%',
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => handleScheduleChange(record, value)}
          style={{ width: '100%' }}
          className="text-gray-800"
        >
          {scheduleOptions.map(option => (
            <Option key={option.value} value={option.label}>
              {option.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: '20%',
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          <Button 
            type="text" 
            icon={<Trash2 size={16} />}
            danger
            className="flex items-center hover:bg-red-50"
            onClick={() => {
              setSizeRangeToDelete(record);
              setIsModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between mb-6">
        {/* <h2 className="text-lg font-medium text-gray-800">Size Range</h2> */}
        <Title level={4} className="text-lg font-medium text-gray-800">
        Size Range
        </Title>
        <Tooltip title="Add sizes and assign schedules">
          <div className="cursor-help text-gray-400">
            <Info size={16} />
          </div>
        </Tooltip>
      </div>
      
      <div className="flex gap-3 mb-6">
        <Select
          mode="multiple"
          value={newSize}
          onChange={setNewSize}
          placeholder="Select sizes to add"
          style={{ width: '300px' }}
          className="text-gray-800"
          optionFilterProp="children"
          showSearch
        >
          {filteredSizeOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        
        <Button
          type="primary"
          onClick={handleAddSizeRange}
          loading={btnLoading}
          className={`bg-blue-500 ${newSize.length === 0 ? '' : 'hover:bg-blue-600'} text-white`}
          disabled={newSize.length === 0}
        >
          Add Size Range
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={sizeRanges}
        pagination={false}
        loading={loading}
        bordered
        className="border border-gray-200 rounded-sm"
        rowClassName="hover:bg-gray-50"
        locale={{
          emptyText: (
            <div className="py-8 text-center text-gray-500">
              <div className="mb-2">No size ranges found</div>
              <div className="text-sm">Select sizes above to add to this spec</div>
            </div>
          )
        }}
      />
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => 
          sizeRangeToDelete && 
          handleDeleteSizeRange(sizeRangeToDelete.key, sizeRangeToDelete.odValue || '')
        }
        title="Confirm Delete"
        message={`Are you sure you want to delete size range: ${sizeRangeToDelete?.sizeValue}?`}
      />
    </div>
  );
};

export default SizeRange;