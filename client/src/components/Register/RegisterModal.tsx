import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormikInput from '../FormFields/FormikInput';
import FormikErrorMessage from '../FormFields/FormikErrorMessage';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { packages } from '../Pricing/PricingPackages';
import PricingCard from '../Pricing/PricingCard/PricingCard';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';
import showToast from '../../utils/toast';
import { bouncy } from 'ldrs';

interface ApiError extends Error {
  response?: {
    data?: {
      error?:string;
    };
    status?: number;
  };
}


const RegisterModal = ({ isOpen, closeModal, selectedPlanIndex }: { isOpen: boolean; closeModal: () => void; selectedPlanIndex: number | null }) => {
  bouncy.register();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const initialValues = {
    name: '',
    companyName: '',
    email: '',
    industry: '',
    country: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    companyName: Yup.string().required('Company Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    industry: Yup.string().required('Industry is required'),
    country: Yup.string().required('Country is required'),
    phoneNumber: Yup.string().matches(/^\d+$/, 'Phone number is not valid'),
    password: Yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const onSubmit = async (values: typeof initialValues) => {
    setLoading(true);
    try {
        const payload = {
            ...values,
            plan: selectedPlanIndex !== null ? selectedPlanIndex + 1 : null,
        };

        const response = await api.post(configApi.API_URL.user.create, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response && response.data) {
            const { success, message, error } = response.data;

            if (success) {
                showToast({
                    message: message || 'Registration successful!',
                    type: 'success',
                });
                closeModal();
            } else {
                showToast({
                    message: error || response.data.msg || 'Registration failed. Please try again.',
                    type: 'error',
                });
            }
        } else {
            showToast({
                message: 'Registration failed. Please try again.',
                type: 'error',
            });
        }
    } catch (error) {
        const apiError = error as ApiError;
        if (apiError.response && apiError.response.data) {
            const errorMessage = apiError.response.data.error || 'Something went wrong. Please try again later.';
            showToast({
                message: errorMessage,
                type: 'error',
            });
        } else if (error instanceof Error) {
            showToast({
                message: error.message || 'An unexpected error occurred.',
                type: 'error',
            });
        } else {
            showToast({
                message: 'Internal Server Error.',
                type: 'error',
            });
        }
    } finally {
      setLoading(false);
    }
};



  return (
    <>
      {isOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-[999] grid h-screen w-full place-items-center bg-black bg-opacity-60 opacity-100 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeModal}
        >
          <div
            className="relative mx-auto flex w-full h-full max-w-[85rem] max-h-[45rem] flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full h-full">
              {/* Left side - Form Fields (70% width) */}
              <div className="w-[70%] p-6">
                <h4 className="block font-sans text-2xl font-semibold leading-snug tracking-normal text-blue-gray-900">Register</h4>
                <p className="block mb-3 font-sans text-base font-normal leading-relaxed text-gray-700">Please fill in the form to register.</p>

                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                  {({ handleSubmit }) => (
                    <Form
                      onSubmit={handleSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <FormikInput name="name" type="text" placeholder="Enter your name" />
                          <FormikErrorMessage name="name" component="div" />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <FormikInput name="companyName" type="text" placeholder="Enter your company name" />
                          <FormikErrorMessage name="companyName" component="div" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <FormikInput name="email" type="email" placeholder="Enter your email" />
                        <FormikErrorMessage name="email" component="div" />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="industry">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <Field as="select" name="industry" className="w-full px-3 py-2 border rounded-lg">
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

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <FormikInput name="country" type="text" placeholder="Enter your country" />
                          <FormikErrorMessage name="country" component="div" />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                            Phone Number (Optional)
                          </label>
                          <FormikInput name="phoneNumber" type="text" placeholder="Enter your phone number" />
                          <FormikErrorMessage name="phoneNumber" component="div" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <FormikInput name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" />
                          <FormikErrorMessage name="password" component="div" />
                          <span className="absolute inset-y-0 right-2 top-10 cursor-pointer" onClick={togglePasswordVisibility}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>

                        <div className="relative">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <FormikInput name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" />
                          <FormikErrorMessage name="confirmPassword" component="div" />
                          <span className="absolute inset-y-0 right-2 top-10 cursor-pointer" onClick={toggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>
                      </div>

                      <div className="flex w-full justify-between mt-4">
                      <button
                          type="submit"
                          disabled={loading}
                          className="relative box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden w-[48%] min-w-20 h-10 text-small bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2 flex items-center font-semibold justify-center gap-2 transition-all duration-300 ease-in-out hover:scale-105"
                        >
                          {loading ? <l-bouncy size="25" speed="1.75" color="white" /> : "Register"}
                        </button>
                        <button
                          type="button"
                          className="w-[48%] border bg-gray-300 text-black font-bold py-2 px-6 rounded hover:bg-gray-400 transition-all ease-in-out duration-300 hover:scale-105"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>

              {/* Right side (30% width) */}
              <div className="w-[30%] bg-gray-100 p-6">
                {selectedPlanIndex !== null && (
                  <PricingCard
                    name={packages[selectedPlanIndex].name}
                    Price={packages[selectedPlanIndex].Price}
                    benefits={packages[selectedPlanIndex].benefits}
                    index={selectedPlanIndex}
                    showButton={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterModal;
