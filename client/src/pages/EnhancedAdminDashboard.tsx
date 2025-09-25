import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  LogOut,
  TrendingUp,
  Calendar,
  Building2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  Settings
} from 'lucide-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import api from '../utils/api/apiutils';
import { api as configApi } from '../utils/api/config';
import showToast from '../utils/toast';
import FormikInput from '../components/FormFields/FormikInput';
import FormikErrorMessage from '../components/FormFields/FormikErrorMessage';
import ConfirmationModal from '../components/ConfirmationDeleteModal/CornfirmationModal';
import SubscriptionUpdateModal from '../components/SubscriptionUpdateModal/SubscriptionUpdateModal';
import {
  User,
  UserAnalytics,
  PaginationData,
  UserFormValues,
  ApiError
} from '../utils/interface';
import { bouncy } from 'ldrs';
const EnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  bouncy.register();

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');

  // Authentication check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const token = localStorage.getItem('admin_token');
    if (!user || !token || user.role !== 'admin') {
      navigate('/login/admin-panel');
    }
  }, [navigate]);

  // Fetch users
  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await api.get(
        `${configApi.API_URL.admin.users.getAll}?page=${page}&limit=10&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response?.data?.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      } else {
        showToast({ message: 'Failed to fetch users', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({ message: apiError.response?.data?.error || 'Error fetching users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await api.get(configApi.API_URL.admin.users.analytics, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response?.data?.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    navigate('/login/admin-panel');
  };

  // Handle user operations
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateSubscription = (user: User) => {
    setSelectedUser(user);
    setIsSubscriptionModalOpen(true);
  };

  const handleSubscriptionUpdateSuccess = () => {
    fetchUsers(currentPage, searchTerm);
    fetchAnalytics();
    setIsSubscriptionModalOpen(false);
  };

  // API operations
  const createUser = async (values: UserFormValues) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await api.post(configApi.API_URL.admin.users.create, values, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response?.data?.success) {
        showToast({ message: 'User created successfully', type: 'success' });
        fetchUsers(currentPage, searchTerm);
        fetchAnalytics();
        setIsModalOpen(false);
      } else {
        showToast({ message: response.data.error || 'Failed to create user', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({ message: apiError.response?.data?.error || 'Error creating user', type: 'error' });
    }
  };

  const updateUser = async (values: UserFormValues) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await api.put(
        `${configApi.API_URL.admin.users.update}/${selectedUser?.id}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        showToast({ message: 'User updated successfully', type: 'success' });
        fetchUsers(currentPage, searchTerm);
        setIsModalOpen(false);
      } else {
        showToast({ message: response.data.error || 'Failed to update user', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({ message: apiError.response?.data?.error || 'Error updating user', type: 'error' });
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await api.delete(
        `${configApi.API_URL.admin.users.delete}/${selectedUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        showToast({ message: 'User deleted successfully', type: 'success' });
        fetchUsers(currentPage, searchTerm);
        fetchAnalytics();
        setIsDeleteModalOpen(false);
      } else {
        showToast({ message: response.data.error || 'Failed to delete user', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({ message: apiError.response?.data?.error || 'Error deleting user', type: 'error' });
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: isEditMode ? Yup.string() : Yup.string().min(6).max(12).required('Password is required'),
    companyName: Yup.string().required('Company name is required'),
    industry: Yup.string().required('Industry is required'),
    country: Yup.string().required('Country is required'),
  });

  const getInitialValues = (): UserFormValues => {
    if (isEditMode && selectedUser) {
      return {
        name: selectedUser.name,
        email: selectedUser.email,
        companyName: selectedUser.companyName,
        industry: selectedUser.industry,
        country: selectedUser.country,
        phoneNumber: selectedUser.phoneNumber || '',
      };
    }
    return {
      name: '',
      email: '',
      password: '',
      companyName: '',
      industry: '',
      country: '',
      phoneNumber: '',
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUserSubscription = (user: User) => {
    return user.subscriptions && user.subscriptions.length > 0 ? user.subscriptions[0] : null;
  };

  const isSubscriptionExpiringSoon = (subscription: any) => {
    if (!subscription || !subscription.endDate) return false;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isSubscriptionExpired = (subscription: any) => {
    if (!subscription || !subscription.endDate) return false;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    return endDate < today;
  };

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-3xl font-bold text-green-600">{analytics.overview.activeSubscriptions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Plans</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.overview.inactiveSubscriptions}</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">{analytics.overview.cancelledSubscriptions}</p>
              </div>
              <CreditCard className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users (30d)</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.overview.recentUsers}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Registration Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              User Registration Trends (30 days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [value, 'New Users']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-green-600" />
              Subscription Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Active', value: analytics.subscriptionStatus.active, color: '#10B981' },
                    // { name: 'Inactive', value: analytics.subscriptionStatus.inactive, color: '#F59E0B' },
                    { name: 'Cancelled', value: analytics.subscriptionStatus.cancelled, color: '#EF4444' },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Active', value: analytics.subscriptionStatus.active, color: '#10B981' },
                    // { name: 'Inactive', value: analytics.subscriptionStatus.inactive, color: '#F59E0B' },
                    { name: 'Cancelled', value: analytics.subscriptionStatus.cancelled, color: '#EF4444' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Users by Industry */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-orange-600" />
              Users by Industry
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.usersByIndustry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Users by Plan */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
              Subscription Plans
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.usersByPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="planName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Subscription Trends */}
      {analytics && analytics.subscriptionTrends.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Subscription Trends (30 days)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.subscriptionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'New Subscriptions']}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#6366F1" 
                strokeWidth={3}
                dot={{ fill: '#6366F1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // Render Users Tab (existing user management functionality)
  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Controls */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600">Manage all users and their subscriptions</p>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Search
              </button>
            </form>
            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <l-bouncy size="40" speed="1.75" color="#3B82F6" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company & Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const subscription = getUserSubscription(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.country}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.companyName}</div>
                        <div className="text-sm text-gray-500">{user.industry}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscription ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.plan?.planName || 'N/A'}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-sm text-gray-500">No subscription</span>
                          <div className="text-xs text-blue-600 mt-1">
                            <button
                              onClick={() => handleUpdateSubscription(user)}
                              className="hover:underline"
                            >
                              Create subscription
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscription ? (
                        <div className="text-sm text-gray-900">
                          <div className={`${
                            isSubscriptionExpired(subscription) 
                              ? 'text-red-600 font-semibold' 
                              : isSubscriptionExpiringSoon(subscription) 
                              ? 'text-yellow-600 font-semibold' 
                              : ''
                          }`}>
                            Ends: {formatDate(subscription.endDate)}
                            {isSubscriptionExpired(subscription) && (
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">
                                EXPIRED
                              </span>
                            )}
                            {isSubscriptionExpiringSoon(subscription) && (
                              <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                EXPIRES SOON
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Started: {formatDate(subscription.startDate)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateSubscription(user)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Update Subscription"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {users.length} of {pagination.totalUsers} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Advanced User Management & Analytics</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard & Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {activeTab === 'dashboard' ? renderDashboard() : renderUsers()}
      </div>

      {/* Create/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditMode ? 'Edit User' : 'Create New User'}
            </h2>
            <Formik
              initialValues={getInitialValues()}
              validationSchema={validationSchema}
              onSubmit={isEditMode ? updateUser : createUser}
            >
              {({ handleSubmit, isSubmitting }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <FormikInput name="name" type="text" placeholder="Enter name" />
                      <FormikErrorMessage name="name" component="div" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <FormikInput name="email" type="email" placeholder="Enter email" />
                      <FormikErrorMessage name="email" component="div" />
                    </div>
                    {!isEditMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <FormikInput name="password" type="password" placeholder="Enter password" />
                        <FormikErrorMessage name="password" component="div" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <FormikInput name="companyName" type="text" placeholder="Enter company name" />
                      <FormikErrorMessage name="companyName" component="div" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <Field
                        as="select"
                        name="industry"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Industry</option>
                        <option value="Oil & Gas">Oil & Gas</option>
                        <option value="Chemical">Chemical</option>
                        <option value="Pharma">Pharma</option>
                        <option value="Sugar">Sugar</option>
                        <option value="Solar">Solar</option>
                        <option value="Wind">Wind</option>
                      </Field>
                      <FormikErrorMessage name="industry" component="div" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <FormikInput name="country" type="text" placeholder="Enter country" />
                      <FormikErrorMessage name="country" component="div" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <FormikInput name="phoneNumber" type="text" placeholder="Enter phone number (optional)" />
                      <FormikErrorMessage name="phoneNumber" component="div" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">User Details</h2>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-gray-900">{selectedUser.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Industry</label>
                    <p className="text-gray-900">{selectedUser.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Country</label>
                    <p className="text-gray-900">{selectedUser.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedUser.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Joined</label>
                    <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Subscription Details</h3>
                  {selectedUser.subscriptions.map((subscription, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-gray-600 font-medium">Plan</label>
                          <p className="text-gray-900">{subscription.plan?.planName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-gray-600 font-medium">Status</label>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </div>
                        <div>
                          <label className="text-gray-600 font-medium">Start Date</label>
                          <p className="text-gray-900">{formatDate(subscription.startDate)}</p>
                        </div>
                        <div>
                          <label className="text-gray-600 font-medium">End Date</label>
                          <p className="text-gray-900">{formatDate(subscription.endDate)}</p>
                        </div>
                        {subscription.NoofProjects && (
                          <div>
                            <label className="text-gray-600 font-medium">Projects Allowed</label>
                            <p className="text-gray-900">{subscription.NoofProjects}</p>
                          </div>
                        )}
                        {subscription.NoofSpecs && (
                          <div>
                            <label className="text-gray-600 font-medium">Specs Allowed</label>
                            <p className="text-gray-900">{subscription.NoofSpecs}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!selectedUser.subscriptions || selectedUser.subscriptions.length === 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">This user doesn't have any active subscriptions.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Subscription Update Modal */}
      <SubscriptionUpdateModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        user={selectedUser}
        onSuccess={handleSubscriptionUpdateSuccess}
      />
    </div>
  );
};

export default EnhancedAdminDashboard;
