/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Spin } from "antd";
import { Table, Input, Button, Form, message } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";
import { Plus } from "lucide-react";

// Types for rating data
interface Rating {
  key: string;
  ratingCode?: string;
  ratingValue: string;
  c_ratingCode: string;
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
  record: Rating;
  editable: boolean;
  dataIndex: 'c_ratingCode' | 'ratingValue'; // the editable field
}

const RatingConfiguration: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [newCRatingCode, setNewCRatingCode] = useState("");
  const [newRatingCode, setNewRatingCode] = useState("");
  const [newRatingValue, setNewRatingValue] = useState("");
  const [editingCell, setEditingCell] = useState<{ key: string; dataIndex: 'ratingValue' | 'c_ratingCode' } | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Table loading
  const [editingOriginalValue, setEditingOriginalValue] = useState<string>("");
  const [buttonLoading, setButtonLoading] = useState(false); // Button loading

  const ratingCodeRegex = /^[A-Za-z0-9]+$/;
  const ratingValueRegex = /^\d+#$/;

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

  const fetchRatings = async () => {
    try {
      setLoading(true);
      if (!currentProjectId) return;

      const payload = {
        projectId: currentProjectId,
      };

      const response = await api.post(
        configApi.API_URL.ratings.getAll,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data && response.data.success) {
        const ratingsWithKeys = response.data.ratings.map((rating: any) => ({
          ...rating,
          key: rating.ratingCode,
          c_ratingCode: rating.c_rating_code
        }));
        setRatings(ratingsWithKeys);
      } else {
        showToast({ message: "Failed to fetch ratings.", type: "error" });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching ratings.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRating = async () => {
    const duplicateFields: string[] = [];

    if (ratings.some((rating) => rating.ratingValue === newRatingValue)) {
      duplicateFields.push("Rating Value");
    }
    if (ratings.some((rating) => rating.ratingCode === newRatingCode)) {
      duplicateFields.push("Rating Code");
    }
    if (ratings.some((rating) => rating.c_ratingCode === newCRatingCode)) {
      duplicateFields.push("Client Rating Code");
    }

    if (duplicateFields.length > 0) {
      message.error(`${duplicateFields.join(", ")} already in use.`);
      return;
    }
    
    if (!newRatingValue || !newRatingCode || !newCRatingCode) {
      message.error("Rating Value, Rating Code, and Client Rating Code are required.");
      return;
    }
    
    if (!ratingCodeRegex.test(newCRatingCode)) {
      message.error("Rating code can only include A-Z, a-z, and 0-9");
      return;
    }
    if (!ratingValueRegex.test(newRatingValue)) {
      message.error("Rating value must end with #");
      return;
    }

    try {
      setButtonLoading(true); // Set button loading to true
      if (!currentProjectId) {
        message.error("No current project ID available.");
        return;
      }

      const newRating: Rating = {
        key: Math.random().toString(36).substring(7),
        ratingCode: newRatingCode,
        c_ratingCode: newCRatingCode,
        ratingValue: newRatingValue,
      };

      const payload = {
        projectId: currentProjectId,
        ratings: [
          {
            ratingCode: newRatingCode,
            c_ratingCode: newCRatingCode,
            ratingValue: newRatingValue,
          },
        ],
      };

      const response = await api.post(
        configApi.API_URL.ratings.addorupdate,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        setRatings([newRating, ...ratings]);
        setNewCRatingCode("");
        setNewRatingCode("");
        setNewRatingValue("");
        message.success("Rating added successfully");
      } else {
        throw new Error("Failed to add rating.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to add rating.";
      showToast({ message: errorMessage, type: "error" });
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  const handleEditRatingValue = async (key: string, ratingValue: string) => {
    if (!ratingValueRegex.test(ratingValue)) {
      message.error("Rating value must end with #");
      return;
    }

    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentRating = ratings.find((rating) => rating.key === key);
    if (!currentRating) {
      message.error("Rating not found");
      return;
    }

    if (currentRating.ratingValue === ratingValue) {
      setEditingCell(null);
      return;
    }

    const updatedRatings = ratings.map((rating) =>
      rating.key === key ? { ...rating, ratingValue } : rating
    );
    setRatings(updatedRatings);

    const payload = {
      projectId: currentProjectId,
      ratings: [
        {
          ratingCode: key,
          c_ratingCode: currentRating.c_ratingCode || "",
          ratingValue,
        },
      ],
    };

    try {
      const response = await api.post(
        configApi.API_URL.ratings.addorupdate,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        message.success("Rating value updated successfully");
        setEditingCell(null);
      } else {
        throw new Error("Failed to update rating value.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to update rating value.";
      showToast({ message: errorMessage, type: "error" });

      setRatings(
        ratings.map((rating) =>
          rating.key === key
            ? { ...rating, ratingValue: editingOriginalValue }
            : rating
        )
      );
      setEditingCell(null);
    }
  };

  const handleEditRatingCode = async (key: string, c_ratingCode: string) => {
    const duplicateRating = ratings.find(
      (rating) => rating.c_ratingCode === c_ratingCode && rating.key !== key
    );

    if (duplicateRating) {
      message.error("Client Rating Code is already in use.");
      return;
    }
    
    if (!ratingCodeRegex.test(c_ratingCode)) {
      message.error("Invalid rating code");
      return;
    }

    if (!currentProjectId) {
      message.error("No current project ID available.");
      return;
    }

    const currentRating = ratings.find((rating) => rating.key === key);
    if (!currentRating) {
      message.error("Rating not found");
      return;
    }

    if (currentRating.c_ratingCode === c_ratingCode) {
      setEditingCell(null);
      return;
    }

    const updatedRatings = ratings.map((rating) =>
      rating.key === key ? { ...rating, c_ratingCode } : rating
    );
    setRatings(updatedRatings);

    const payload = {
      projectId: currentProjectId,
      ratings: [{
        ratingCode: key,
        c_ratingCode,
        ratingValue: currentRating.ratingValue,
      }]
    };

    try {
      const response = await api.post(
        configApi.API_URL.ratings.addorupdate,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        message.success("Rating code updated successfully");
        setEditingCell(null); // Exit edit mode
      } else {
        throw new Error("Failed to update rating code.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Failed to update rating code.";
      showToast({ message: errorMessage, type: "error" });

      setRatings(
        ratings.map((rating) =>
          rating.key === key
            ? { ...rating, c_ratingCode: editingOriginalValue }
            : rating
        )
      );
      setEditingCell(null); // Exit edit mode
    }
  };

  const finishEditing = () => setEditingCell(null);

  const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    children,
    record,
    dataIndex,
    ...restProps
  }) => {
    const [inputValue, setInputValue] = useState("");

    // Update input value when record changes or when entering edit mode
    useEffect(() => {
      if (record && record[dataIndex]) {
        setInputValue(record[dataIndex]);
        // console.log(editingKey)
        // Set original value for rollback if needed
        if (editable) {
          setEditingOriginalValue(record[dataIndex]);
        }
      }
    }, [record, dataIndex, editable]);

    useEffect(() => {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditingCell(null);
        }
      };
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (record) {
          if (dataIndex === 'c_ratingCode') {
            handleEditRatingCode(record.key, inputValue);
          } else if (dataIndex === 'ratingValue') {
            handleEditRatingValue(record.key, inputValue);
          }
        }
      }
    };

    const onBlur = () => {
      if (record) {
        if (dataIndex === 'c_ratingCode') {
          handleEditRatingCode(record.key, inputValue);
        } else if (dataIndex === 'ratingValue') {
          handleEditRatingValue(record.key, inputValue);
        }
        finishEditing();
      }
    };

    return (
      <td {...restProps}>
        {editable && record ? (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={onBlur}
            onKeyPress={handleKeyPress}
            autoFocus
            size="small"
            bordered
          />
        ) : (
          <div
            onDoubleClick={() => {
              setEditingCell({ key: record.key, dataIndex });
            }}
            style={{ cursor: "pointer", padding: "4px 0" }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<Rating> = [
    {
      title: <span>Rating Code</span>,
      dataIndex: "ratingCode",
      key: "ratingCode",
    },
    {
      title: "Rating Value",
      dataIndex: "ratingValue",
      key: "ratingValue",
      onCell: (record: Rating): EditableCellProps => ({
        record,
        editable: editingCell?.key === record.key && editingCell?.dataIndex === 'ratingValue',
        dataIndex: 'ratingValue',
      }),
    },
    {
      title: "Client Rating Code",
      dataIndex: "c_ratingCode",
      key: "c_ratingCode",
      onCell: (record: Rating): EditableCellProps => ({
        record,
        editable: editingCell?.key === record.key && editingCell?.dataIndex === 'c_ratingCode',
        dataIndex: 'c_ratingCode',
      }),
},
  ];

  useEffect(() => {
    fetchRatings();
  }, [currentProjectId]);

  return (
    <div style={{ padding: "0", maxWidth: "100%", maxHeight: "78vh", overflowY: "auto" }}>
      <div className="bg-white p-4">
        <h1 className="text-blue-500 text-xl mb-4">Rating Configuration</h1>
        
        <Form layout="horizontal" className="mb-4">
          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-semibold">Rating Value <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter Rating Value (e.g., 150#)"
                className="w-full"
                value={newRatingValue}
                onChange={(e) => setNewRatingValue(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Rating Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter Rating Code"
                className="w-full"
                value={newRatingCode}
                onChange={(e) => setNewRatingCode(e.target.value)}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Client Rating Code <span className="text-red-500">*</span></span>}
              colon={false}
              className="mb-0"
            >
              <Input
                placeholder="Enter Client Rating Code"
                className="w-full"
                value={newCRatingCode}
                onChange={(e) => setNewCRatingCode(e.target.value)}
                size="middle"
              />
            </Form.Item>
          </div>
          
          <div className="mt-6 mb-1 flex justify-between items-center">
            <p className="text-gray-500 text-xs">
              Rating Code can only include A-Z, a-z, 0-9. Rating Value must end with # (e.g., 150#).
            </p>
            <Button
              type="primary"
              onClick={handleAddRating}
              loading={buttonLoading}
              className="bg-blue-500 text-white"
              icon={<Plus size={14} className="mr-1" />}
            >
              Add Rating
            </Button>
          </div>
        </Form>

        <div className="border-t border-gray-200 my-3"></div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : ratings.length === 0 ? (
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
            className="rating-table"
            columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={ratings}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </div>

      <style>{`
        .rating-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          padding: 8px;
          font-weight: 500;
        }
        .rating-table .ant-table-tbody > tr > td {
          padding: 8px;
        }
        .rating-table .ant-table-row:hover {
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

export default RatingConfiguration;