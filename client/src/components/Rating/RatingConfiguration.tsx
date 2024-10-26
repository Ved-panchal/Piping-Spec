import React, { useState, useEffect, TdHTMLAttributes } from "react";
import { Spin } from "antd";
import { Table, Input, Button, Form, message } from "antd";
import { ColumnsType } from "antd/es/table";
import api from "../../utils/api/apiutils"; // API utility
import { api as configApi } from "../../utils/api/config"; // API config for URLs
import showToast from "../../utils/toast";

// Types for rating data
interface Rating {
  key: string;
  ratingCode?: string;
  ratingValue: string;
  c_ratingCode?: string;
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
}

const RatingConfiguration: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [newCRatingCode, setNewCRatingCode] = useState("");
  const [newRatingCode, setNewRatingCode] = useState("");
  const [newRatingValue, setNewRatingValue] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
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
        setLoading(false);
      } else {
        showToast({ message: "Failed to fetch ratings.", type: "error" });
        setLoading(false);
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error || "Error fetching ratings.";
      showToast({ message: errorMessage, type: "error" });
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

  const handleEditRatingCode = async (key: string, c_ratingCode:string) => {
    
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
      setEditingKey(null);
      return;
    }

    const updatedRatings = ratings.map((rating) =>
      rating.key === key ? { ...rating, c_ratingCode } : rating
    );
    setRatings(updatedRatings);

    const payload = {
      projectId: currentProjectId,
      ratings:[{
        ratingCode:key,
        c_ratingCode,
        ratingValue: currentRating.ratingValue,
      }
      ]
    };

    try {
      const response = await api.post(
        `${configApi.API_URL.ratings.addorupdate}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data.success) {
        message.success("Rating code updated successfully");
        setEditingKey(null); // Exit edit mode
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
      setEditingKey(null); // Exit edit mode
    }
  };

  const EditableCell: React.FC<any> = ({
    editable,
    children,
    record,
    ...restProps
  }) => {
    const [inputValue, setInputValue] = useState(record?.c_ratingCode || "");

    useEffect(() => {
      if (editable && record) {
        setEditingOriginalValue(record.c_ratingCode);
      }
    }, [editable, record?.c_ratingCode]);

    useEffect(() => {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditingKey(null);
          return;
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
          handleEditRatingCode(record.key, inputValue);
        }
      } 
      
    };

    return (
      <td {...restProps}>
        {editable && record ? (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => handleEditRatingCode(record.key, inputValue)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
        ) : (
          <div onDoubleClick={() => setEditingKey(record?.key)}>{children}</div>
        )}
      </td>
    );
  };

  const columns: ColumnsType<Rating> = [
    {
      title: "Rating Value",
      dataIndex: "ratingValue",
      key: "ratingValue",
    },
    {
      title: "Rating Code",
      dataIndex: "ratingCode",
      key: "ratingCode",
    },
    {
      title: "Client Rating Code",
      dataIndex: "c_ratingCode",
      key: "c_ratingCode",
      onCell: (record: Rating) :EditableCellProps => ({
        record,
        editable: editingKey === record.key,
      }),
    },
  ];

  useEffect(() => {
    fetchRatings();
  }, [currentProjectId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Rating Configuration</h2>
      <Form layout="inline" style={{ marginBottom: "20px", marginTop: "10px" }}>
        <Form.Item>
          <Input
            placeholder="Rating Value (e.g., 100#)"
            value={newRatingValue}
            onChange={(e) => setNewRatingValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddRating()}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Rating Code (A-Z, a-z, 0-9)"
            value={newRatingCode}
            onChange={(e) => setNewRatingCode(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddRating()}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Client Rating Code (A-Z, a-z, 0-9)"
            value={newCRatingCode}
            onChange={(e) => setNewCRatingCode(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddRating()}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleAddRating}
            // loading={buttonLoading}
            disabled={buttonLoading}
          >
            {buttonLoading ? <Spin /> : "Add Rating"}
          </Button>
        </Form.Item>
      </Form>
      <div style={{ color: "grey", fontSize: "12px", marginBottom: "10px" }}>
        Rating Code can only include A-Z, a-z, 0-9. Rating Value must end with #.
      </div>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        loading={loading}
        dataSource={ratings}
        columns={columns}
        pagination={false}
      />
    </div>
  );
};
export default RatingConfiguration;
