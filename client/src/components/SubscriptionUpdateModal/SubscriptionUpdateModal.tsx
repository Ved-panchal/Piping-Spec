import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { X, Calendar, CreditCard, User } from 'lucide-react';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';
import showToast from '../../utils/toast';
import FormikErrorMessage from '../FormFields/FormikErrorMessage';
import { User as UserType, SubscriptionPlan, ApiError } from '../../utils/interface';

interface SubscriptionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onSuccess: () => void;
}

interface SubscriptionFormValues {
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'cancelled';
}

const SubscriptionUpdateModal: React.FC<SubscriptionUpdateModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(false);

  // Fetch available subscription plans
  const fetchSubscriptionPlans = async () => {
    setFetchingPlans(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await api.get(configApi.API_URL.admin.subscriptions.plans, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response?.data?.success) {
        setAvailablePlans(response.data.data);
      } else {
        showToast({ message: 'Failed to fetch subscription plans', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({ 
        message: apiError.response?.data?.error || 'Error fetching subscription plans', 
        type: 'error' 
      });
    } finally {
      setFetchingPlans(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans();
    }
  }, [isOpen]);

  const validationSchema = Yup.object({
    planId: Yup.string().required('Subscription plan is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date must be after start date'),
    status: Yup.string().required('Status is required'),
  });

  const getInitialValues = (): SubscriptionFormValues => {
    const currentSubscription = user?.subscriptions?.[0];
    const today = new Date().toISOString().split('T')[0];
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (currentSubscription) {
      return {
        planId: currentSubscription.planId ? String(currentSubscription.planId) : '',
        startDate: currentSubscription.startDate ? 
          new Date(currentSubscription.startDate).toISOString().split('T')[0] : today,
        endDate: currentSubscription.endDate ? 
          new Date(currentSubscription.endDate).toISOString().split('T')[0] : 
          oneYearFromNow.toISOString().split('T')[0],
        status: currentSubscription.status || 'active',
      };
    }

    return {
      planId: '',
      startDate: today,
      endDate: oneYearFromNow.toISOString().split('T')[0],
      status: 'active',
    };
  };

  const handleSubmit = async (values: SubscriptionFormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const payload = {
        userId: user.id,
        planId: Number(values.planId),
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
      };

      // Check if user has existing subscription to update or create new one
      const currentSubscription = user.subscriptions?.[0];
      let response;

      if (currentSubscription) {
        // Update existing subscription
        response = await api.put(
          `${configApi.API_URL.admin.subscriptions.update}/${currentSubscription.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new subscription
        response = await api.post(
          configApi.API_URL.admin.subscriptions.create,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (response?.data?.success) {
        showToast({ 
          message: `Subscription ${currentSubscription ? 'updated' : 'created'} successfully`, 
          type: 'success' 
        });
        onSuccess();
        onClose();
      } else {
        showToast({ 
          message: response.data.error || `Failed to ${currentSubscription ? 'update' : 'create'} subscription`, 
          type: 'error' 
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      showToast({ 
        message: apiError.response?.data?.error || 'Error updating subscription', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const currentSubscription = user.subscriptions?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              {currentSubscription ? 'Update Subscription' : 'Create Subscription'}
            </h2>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <User className="w-4 h-4 mr-1" />
              {user.name} ({user.email})
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {fetchingPlans ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="space-y-4">
                  {/* Current Subscription Info */}
                  {currentSubscription && (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h3 className="font-medium text-gray-900 mb-2">Current Subscription</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Plan:</strong> {currentSubscription.plan?.planName || 'N/A'}</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                            currentSubscription.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : currentSubscription.status === 'cancelled' 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {currentSubscription.status}
                          </span>
                        </p>
                        <p><strong>Valid Until:</strong> {new Date(currentSubscription.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Subscription Plan Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Plan *
                    </label>
                    <select
                      name="planId"
                      value={values.planId}
                      onChange={(e) => {
                        const nextPlanId = e.target.value;
                        setFieldValue('planId', nextPlanId);
                        // Auto-calc end date when plan changes if startDate is set
                        const selectedPlan = availablePlans.find(p => String(p.planId) === String(nextPlanId));
                        if (selectedPlan && values.startDate) {
                          const startDate = new Date(values.startDate);
                          const endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + selectedPlan.allowedDays);
                          setFieldValue('endDate', endDate.toISOString().split('T')[0]);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a plan</option>
                      {availablePlans.map((plan) => (
                        <option key={plan.planId} value={String(plan.planId)}>
                          {plan.planName} ({plan.allowedDays} days)
                        </option>
                      ))}
                    </select>
                    <FormikErrorMessage name="planId" component="div" />
                  </div>

                  {/* Plan Details */}
                  {values.planId && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      {(() => {
                        const selectedPlan = availablePlans.find(plan => String(plan.planId) === String(values.planId));
                        if (selectedPlan) {
                          return (
                            <div className="text-sm text-blue-800">
                              <p><strong>Plan:</strong> {selectedPlan.planName}</p>
                              <p><strong>Duration:</strong> {selectedPlan.allowedDays} days</p>
                              <p>
                                <strong>Projects:</strong> {selectedPlan.noOfProjects === null ? 'Unlimited' : selectedPlan.noOfProjects}
                              </p>
                              <p>
                                <strong>Specifications:</strong> {selectedPlan.noOfSpecs === null ? 'Unlimited' : selectedPlan.noOfSpecs}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Start Date *
                    </label>
                    <Field
                      type="date"
                      name="startDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <FormikErrorMessage name="startDate" component="div" />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      End Date *
                    </label>
                    <Field
                      type="date"
                      name="endDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <FormikErrorMessage name="endDate" component="div" />
                  </div>

                  {/* Auto-calculate end date based on plan */}
                  {values.planId && values.startDate && (
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const selectedPlan = availablePlans.find(plan => String(plan.planId) === String(values.planId));
                          if (selectedPlan && values.startDate) {
                            const startDate = new Date(values.startDate);
                            const endDate = new Date(startDate);
                            endDate.setDate(endDate.getDate() + selectedPlan.allowedDays);
                            setFieldValue('endDate', endDate.toISOString().split('T')[0]);
                          }
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Auto-calculate end date from plan duration
                      </button>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="cancelled">Cancelled</option>
                    </Field>
                    <FormikErrorMessage name="status" component="div" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !values.planId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {currentSubscription ? 'Update Subscription' : 'Create Subscription'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default SubscriptionUpdateModal;
