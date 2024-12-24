import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Table, Button, Form, message, Select, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils";
import { api as configApi } from "../../utils/api/config";
import showToast from "../../utils/toast";
import { Trash2 } from "lucide-react";
import deleteWithBody from "../../utils/api/DeleteAxios";
import ConfirmationModal from "../ConfirmationDeleteModal/CornfirmationModal";
import {
  ApiError,
  DeleteResponse,
  Schedule,
  Size,
} from "../../utils/interface";
import type { SizeRange } from "../../utils/interface";

const { Option } = Select;

interface OptionType {
  value: string;
  label: string;
}

interface EditableCellProps extends TdHTMLAttributes<unknown> {
  record: SizeRange;
  editable: boolean;
  dataIndex: keyof SizeRange;
}

const SizeRange: React.FC<{ specId: string }> = ({ specId }) => {
  const [sizeRanges, setSizeRanges] = useState<SizeRange[]>([]);
  const [newSize, setNewSize] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnloading, setBtnLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | number | null>(null);
  const [sizeOptions, setSizeOptions] = useState<OptionType[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<OptionType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sizeRangeToDelete, setSizeRangeToDelete] = useState<SizeRange | null>(
    null
  );

  useEffect(() => {
    if (!specId) {
      showToast({ message: "Please Select Spec ID First", type: "info" });
      return;
    }
    fetchSizeRange();
    const projectId = localStorage.getItem("currentProjectId");
    if (projectId) {
      fetchSizeAndScheduleOptions(projectId);
    }
  }, [specId]);

  const fetchSizeAndScheduleOptions = async (projectId: string) => {
    try {
      const payload = { projectId };
      const sizeResponse = await api.post(
        configApi.API_URL.sizes.getall,
        payload
      );
      const scheduleResponse = await api.post(
        configApi.API_URL.schedules.getall,
        payload
      );

      if (sizeResponse.data.success && scheduleResponse.data.success) {
        const sizes = sizeResponse.data.sizes
          .map((size: Size) => ({
            value: size.size1_size2,
            label: size.size1_size2,
            size_mm: size.size_mm,
          }))
          .sort(
            (a: { size_mm: number }, b: { size_mm: number }) =>
              a.size_mm - b.size_mm
          );

        const schedules = scheduleResponse.data.schedules
          .map((schedule: Schedule) => ({
            value: schedule.code,
            label: schedule.sch1_sch2,
            arrange_od: schedule.arrange_od,
          }))
          .sort(
            (a: { arrange_od: number }, b: { arrange_od: number }) =>
              a.arrange_od - b.arrange_od
          );

        setSizeOptions(sizes);
        setScheduleOptions(schedules);
      } else {
        throw new Error("Failed to fetch options");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to fetch dropdown options.";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  const fetchSizeRange = async () => {
    try {
      setLoading(true);
      const response = await api.post(configApi.API_URL.sizeranges.getall, {
        specId,
      });
      if (response.data.success) {
        const sizeRangesWithKey = response.data.sizeranges
          .map((range: SizeRange) => ({
            key: range.id,
            sizeValue: range.sizeValue,
            sizeCode: range.sizeCode,
            scheduleValue: range.scheduleValue,
            scheduleCode: range.scheduleCode,
            odValue: range.odValue,
          }))
          .sort(
            (a: { sizeValue: number }, b: { sizeValue: number }) =>
              a.sizeValue - b.sizeValue
          ); // Sorting by sizeValue in ascending order

        setSizeRanges(sizeRangesWithKey);
      } else {
        throw new Error("Failed to fetch Size Ranges.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to update Size Range.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSizeRange = async () => {
    if (!newSize || newSize.length === 0) {
      message.error("Please select at least one size.");
      return;
    }

    const existingSizes = sizeRanges.map((range) => range.sizeValue);
    const sizesToAdd = newSize.filter(
      (sizeCode) => !existingSizes.includes(sizeCode)
    );
    const alreadyAddedSizes = newSize.filter((sizeCode) =>
      existingSizes.includes(sizeCode)
    );

    if (alreadyAddedSizes.length > 0) {
      message.error(
        `${alreadyAddedSizes.join(", ")} ${
          alreadyAddedSizes.length > 1 ? "are" : "is"
        } already added.`
      );
      return;
    }

    const newSizeRanges = sizesToAdd.map((sizeCode) => ({
      key: Math.random().toString(36).substring(2),
      sizeValue: sizeCode,
      sizeCode: sizeCode,
      scheduleValue: "ST",
      scheduleCode: "ST",
    }));

    const payload = {
      sizes: sizesToAdd,
      scheduleCode: "ST",
      specId,
    };

    setBtnLoading(true);
    try {
      const response = await api.post(
        configApi.API_URL.sizeranges.create,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setSizeRanges((prev) => [...newSizeRanges, ...prev]);
        setNewSize([]);
        message.success("Size range added successfully");
        fetchSizeRange();
      } else {
        throw new Error("Failed to add Size Range.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to add Size Range.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteSizeRange = async (
    key: number | string,
    odValue: string
  ) => {
    try {
      await deleteWithBody<DeleteResponse>(
        `${configApi.API_URL.sizeranges.delete}`,
        { id: key, size_value: odValue }
      );
      setSizeRanges((prev) =>
        prev.filter((sizeRange) => sizeRange.key !== key)
      );
      setIsModalOpen(false);
      message.success("Size range deleted successfully");
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to delete size range.";
      showToast({ message: errorMessage, type: "error" });
    }
  };

  const handleEdit = async (
    key: number | string,
    dataIndex: keyof SizeRange,
    value: string
  ) => {
    const updatedSizeRange = sizeRanges.find((range) => range.key === key);
    const schedule = scheduleOptions.find((schedule) => schedule.label === value);
    if (updatedSizeRange) {
      const payload = {
        id: key,
        sizeCode: dataIndex === "sizeValue" ? value : updatedSizeRange.sizeCode,
        scheduleCode:
          dataIndex === "scheduleValue" && schedule?.value,
        specId,
      };

      try {
        const response = await api.put(
          configApi.API_URL.sizeranges.update,
          payload
        );
        if (response.data.success) {
          setSizeRanges((prev) =>
            prev.map((range) =>
              range.key === key ? { ...range, [dataIndex]: value } : range
            )
          );
          message.success("Size range updated successfully");
          fetchSizeRange();
        } else {
          throw new Error("Failed to update Size Range.");
        }
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage =
          apiError.response?.data?.error || "Failed to update Size Range.";
        throw new Error(errorMessage);
      }
    }
  };

  const EditableCell: React.FC<EditableCellProps> = ({
    children,
    record,
    dataIndex,
    ...restProps
  }) => {
    const [localInputValue, setLocalInputValue] = useState(
      record ? record[dataIndex] : ""
    );
    const [initialValue, setInitialValue] = useState(localInputValue);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      if (record && record[dataIndex] !== localInputValue) {
        setLocalInputValue(record[dataIndex] as string);
      }
    }, [record, dataIndex]);

    const handleBlur = async () => {
      if (record && record.key && localInputValue !== initialValue) {
        try {
          await handleEdit(record.key, dataIndex, localInputValue as string);
          setInitialValue(localInputValue);
        } catch (error) {
          const apiError = error as ApiError;
          const errorMessage =
            apiError.response?.data?.error || "Failed to update Size range.";
          setLocalInputValue(initialValue);
          showToast({ message: errorMessage, type: "error" });
        }
      }
      setIsEditing(false);
    };

    const handleDoubleClick = () => {
      setEditingKey(record?.key);
      setIsEditing(true);
      setInitialValue(localInputValue);
    };

    return (
      <td {...restProps}>
        {isEditing ? (
          dataIndex === "sizeValue" || dataIndex === "scheduleValue" ? (
            <Select
              value={localInputValue}
              onChange={(value) => setLocalInputValue(value)}
              onBlur={handleBlur}
              autoFocus
              style={{ width: "100%" }}
              showSearch
            >
              {(dataIndex === "sizeValue" ? sizeOptions : scheduleOptions).map(
                (option) => (
                  <Option key={option.value} value={option.label}>
                    {option.label}
                  </Option>
                )
              )}
            </Select>
          ) : (
            <Input
              value={localInputValue}
              onChange={(e) => setLocalInputValue(e.target.value)}
              onBlur={handleBlur}
              autoFocus
              style={{ width: "100%" }}
            />
          )
        ) : (
          <div onDoubleClick={handleDoubleClick}>{children}</div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<SizeRange> = [
    {
      title: "Size",
      dataIndex: "sizeValue",
      key: "sizeValue",
      onCell: (record: SizeRange): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        dataIndex: "sizeValue",
      }),
    },
    {
      title: "Schedule",
      dataIndex: "scheduleValue",
      key: "scheduleValue",
      onCell: (record: SizeRange): EditableCellProps => ({
        record,
        editable: editingKey === record.key,
        dataIndex: "scheduleValue",
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
            setSizeRangeToDelete(record);
            setIsModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <h1>Size Range</h1>
      <Form layout="inline" style={{ marginBottom: "20px" }}>
        <Form.Item>
          <Select
            mode="multiple"
            value={newSize}
            onChange={(value) => setNewSize(value)}
            placeholder="Select Size"
            style={{ minWidth: "12rem", maxWidth: "25rem" }}
          >
            {sizeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleAddSizeRange}
            loading={btnloading}
          >
            Add Size Range
          </Button>
        </Form.Item>
      </Form>
      <div>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={sizeRanges}
          columns={columns}
          pagination={false}
          loading={loading}
        />
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() =>
          sizeRangeToDelete &&
          handleDeleteSizeRange(
            sizeRangeToDelete.key,
            sizeRangeToDelete.odValue!
          )
        }
        title="Confirm Delete"
        message={`Are you sure you want to delete size range: ${sizeRangeToDelete?.sizeValue}?`}
      />
    </div>
  );
};

export default SizeRange;
