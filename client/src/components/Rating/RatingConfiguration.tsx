import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Form, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import api from '../../utils/api/apiutils'; // API utility
import { api as configApi } from '../../utils/api/config'; // API config for URLs
import showToast from '../../utils/toast';

// Types for rating data
interface Rating {
  key: string;
  ratingCode: string;
  ratingValue: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

const RatingConfiguration: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [newRatingCode, setNewRatingCode] = useState('');
  const [newRatingValue, setNewRatingValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null); // Track editing key
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null); // Hold the current project ID

  // Validation regex
  const ratingCodeRegex = /^[A-Za-z0-9]+$/;
  const ratingValueRegex = /^\d+#$/;

  // Fetch current project ID from localStorage
  useEffect(() => {
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId) {
      setCurrentProjectId(projectId);
    } else {
      showToast({ message: 'No current project ID found in local storage.', type: 'error' });
    }
  }, []);

  // Fetch ratings from API
  const fetchRatings = async () => {
    try {
      if (!currentProjectId) return;

      const payload = {
        projectId: currentProjectId,
      };

      const response = await api.post(configApi.API_URL.ratings.getAll, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data && response.data.success) {
        const ratingsWithKeys = response.data.ratings.map((rating: any) => ({
          ...rating,
          key: rating.id, 
        }));
        setRatings(ratingsWithKeys);
      }
       else {
        showToast({ message: 'Failed to fetch ratings.', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Error fetching ratings.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  // Add new rating
  const handleAddRating = async () => {
    if (!ratingCodeRegex.test(newRatingCode)) {
      message.error('Rating code can only include A-Z, a-z, and 0-9');
      return;
    }
    if (!ratingValueRegex.test(newRatingValue)) {
      message.error('Rating value must end with #');
      return;
    }

    try {
      if (!currentProjectId) {
        message.error('No current project ID available.');
        return;
      }

      const newRating: Rating = {
        key: Math.random().toString(36).substring(7),
        ratingCode: newRatingCode,
        ratingValue: newRatingValue,
      };

      const payload = {
        projectId: currentProjectId, // Using the project ID from localStorage
        ratingCode: newRatingCode,
        ratingValue: newRatingValue,
      };

      // Send API request to add rating
      const response = await api.post(configApi.API_URL.ratings.addorupdate, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data.success) {
        setRatings([...ratings, newRating]);
        setNewRatingCode('');
        setNewRatingValue('');
        message.success('Rating added successfully');
      } else {
        throw new Error('Failed to add rating.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to add rating.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  // Handle editing rating code
  const handleEditRatingCode = async (key: string, ratingCode: string) => {
    if (!ratingCodeRegex.test(ratingCode)) {
      message.error('Invalid rating code');
      return;
    }

    if (!currentProjectId) {
      message.error('No current project ID available.');
      return;
    }

    // Find the corresponding rating object by key to get the ratingValue
    const currentRating = ratings.find((rating) => rating.key === key);
    if (!currentRating) {
      message.error('Rating not found');
      return;
    }

    const updatedRatings = ratings.map((rating) =>
      rating.key === key ? { ...rating, ratingCode } : rating
    );
    setRatings(updatedRatings);
    setEditingKey(null); // Exit edit mode

    // Create the payload with projectId, ratingCode, and ratingValue
    const payload = {
      projectId: currentProjectId,
      ratingCode,
      ratingValue: currentRating.ratingValue,
    };

    try {
      const response = await api.post(`${configApi.API_URL.ratings.addorupdate}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response && response.data.success) {
        message.success('Rating code updated successfully');
      } else {
        throw new Error('Failed to update rating code.');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to update rating code.';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  const EditableCell: React.FC<any> = ({
    editable,
    children,
    record,
    ...restProps
  }) => {
    const [inputValue, setInputValue] = useState(record?.ratingCode || '');

    return (
      <td {...restProps}>
        {editable ? (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => handleEditRatingCode(record.key, inputValue)}
          />
          
        ) : (
          <div onDoubleClick={() => setEditingKey(record.key)}>{children}</div>
        )}
      </td>
    );
  };

  // Table columns
  const columns: ColumnsType<Rating> = [
    {
      title: 'Rating Value',
      dataIndex: 'ratingValue',
      key: 'ratingValue',
    },
    {
      title: 'Rating Code',
      dataIndex: 'ratingCode',
      key: 'ratingCode',
      editable: true,
      onCell: (record: Rating) => ({
        record,
        editable: editingKey === record.key,
      }),
    },
  ];

  useEffect(() => {
    fetchRatings();
  }, [currentProjectId]); // Fetch ratings only when the project ID is available

  return (
    <div style={{ padding: '20px' }}>
      <h2>Rating Configuration</h2>
      <Form layout="inline" style={{ marginBottom: '20px' }}>
        
        <Form.Item>
          <Input
            placeholder="Rating Value (e.g., 100#)"
            value={newRatingValue}
            onChange={(e) => setNewRatingValue(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Rating Code (A-Z, a-z, 0-9)"
            value={newRatingCode}
            onChange={(e) => setNewRatingCode(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleAddRating}>
            Add Rating
          </Button>
        </Form.Item>
      </Form>
      <div style={{ color: 'grey', fontSize: '12px', marginBottom: '10px' }}>
        Rating Code can only include A-Z, a-z, 0-9. Rating Value must end with #.
      </div>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={ratings}
        columns={columns}
        pagination={false}
        rowClassName="editable-row"
        style={{ width: '100%', tableLayout: 'auto' }}
      />
    </div>
  );
};

export default RatingConfiguration;
