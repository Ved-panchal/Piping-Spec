import { useState, useRef, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import showToast from '../utils/toast';
import FormikInput from '../components/FormFields/FormikInput';
import FormikErrorMessage from '../components/FormFields/FormikErrorMessage';
import api from '../utils/api/apiutils';
import { api as configApi } from '../utils/api/config';
import { bouncy } from 'ldrs';
import { AdminLoginFormValues, ApiError } from '../utils/interface';

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    bouncy.register();

    useEffect(() => {
        // Check if already logged in as admin
        const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
        const token = localStorage.getItem('admin_token');
        if (user && token && user.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        if (emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const initialValues: AdminLoginFormValues = {
        email: '',
        password: ''
    };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email format').min(6).max(50).required('Email is required'),
        password: Yup.string().min(6).max(12).required('Password is required'),
    });

    const onSubmit = async (values: AdminLoginFormValues) => {
        setLoading(true);
        try {
            const response = await api.post(configApi.API_URL.admin.auth.login, {
                email: values.email,
                password: values.password,
            });

            if (response?.data?.success) {
                const { user, token, message } = response.data;
                localStorage.setItem("admin_user", JSON.stringify(user));
                localStorage.setItem("admin_token", token);
                showToast({ message: message || "Admin Login Successful!!", type: "success" });
                navigate('/admin/dashboard');
            } else {
                showToast({ message: response.data.error || "Login failed", type: "error" });
            }
        } catch (error: unknown) {
            let errorMessage = "Unknown error";

            if (error && typeof error === "object" && "response" in error) {
                const apiError = error as ApiError;
                errorMessage = apiError.response?.data?.error || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            showToast({ message: errorMessage, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-gray-600 mt-2">Sign in to access the admin dashboard</p>
                    </div>

                    {/* Form */}
                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Admin Email
                                    </label>
                                    <FormikInput 
                                        name="email" 
                                        type="email" 
                                        placeholder="Enter your admin email" 
                                        innerRef={emailInputRef} 
                                        autoFocus 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    />
                                    <FormikErrorMessage name="email" component="div" />
                                </div>

                                <div className="mb-6 relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <FormikInput 
                                        name="password" 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Enter your password" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                                    />
                                    <FormikErrorMessage name="password" component="div" />
                                    <button
                                        type="button"
                                        className="absolute top-[42px] right-4 text-gray-500 hover:text-gray-700"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <l-bouncy size="25" speed="1.75" color="white" />
                                            <span className="ml-2">Signing in...</span>
                                        </div>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            ← Back to Main Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
