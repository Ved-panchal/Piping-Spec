import { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import showToast from '../../utils/toast';
import FormikInput from '../FormFields/FormikInput';
import FormikErrorMessage from '../FormFields/FormikErrorMessage';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';
import { bouncy } from 'ldrs';
import { ApiError, LoginFormValues, LoginModalProps } from '../../utils/interface';


const LoginModal = ({ isOpen, closeModal,onLoginSuccess  }: LoginModalProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);
    // const navigate = useNavigate();
    bouncy.register();

    useEffect(() => {
        if (isOpen && emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            closeModal();
            return;
          }
        };
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
          document.removeEventListener("keydown", handleEscapeKey);
        };
      }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const initialValues: LoginFormValues = {
        Email: '',
        password: ''
    };

    const validationSchema = Yup.object({
        Email: Yup.string()
            .email('Invalid email format')
            .min(6, 'Email must be at least 6 characters long')
            .max(50, 'Email cannot be more than 50 characters long')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters long')
            .max(12, 'Password cannot be more than 12 characters long')
            .required('Password is required'),
    });

    const onSubmit = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            const requestBody = {
                email: values.Email,
                password: values.password,
            };

            // Send the POST request with JSON payload
            const response = await api.post(configApi.API_URL.auth.login, requestBody, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response && response.data) {
                const { success, message, error, user,token,plan } = response.data;

                if (success) {
                    localStorage.setItem("user", JSON.stringify(user));
                    localStorage.setItem("token", JSON.stringify(token));
                    localStorage.setItem("plan", JSON.stringify(plan));
                    showToast({ message: message || "Login Successful!!", type: "success" });

                    onLoginSuccess(user); // Call the success function
                    closeModal();
                } else {
                    showToast({ message: error || "Login failed. Please check your credentials.", type: "error" });
                }
            } else {
                showToast({ message: "Login failed. Please check your credentials.", type: "error" });
            }
        }  catch (error) {
            const apiError = error as ApiError;
            if (apiError.response && apiError.response.data) {
                const errorMessage = apiError.response.data.error+"Login failed. Please check your credentials.";
                showToast({ message: errorMessage, type: "error" });
            } else if (error instanceof Error) {
                showToast({ message: error.message+"An unknown error occurred.", type: "error" });
            } else {
                showToast({ message: "An unknown error occurred.", type: "error" });
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
                        className="relative mx-auto flex w-full max-w-[24rem] flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-4 p-6">
                            <h4 className="block font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                                Sign In
                            </h4>
                            <p className="block mb-3 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
                                Enter your Email and password to Sign In.
                            </p>

                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={onSubmit}
                            >
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
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Email">
                                                Your Email
                                            </label>
                                            <FormikInput
                                                name="Email"
                                                type="email"
                                                placeholder="Enter your email"
                                                innerRef={emailInputRef}
                                                autoFocus={true}
                                            />
                                            <FormikErrorMessage name="Email" component="div" />
                                        </div>

                                        <div className="mb-4 relative">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                                Your Password
                                            </label>
                                            <FormikInput
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                            />
                                            <FormikErrorMessage name="password" component="div" />
                                            <div className="absolute top-[38px] right-3 flex items-center">
                                                {showPassword ? (
                                                    <EyeOff
                                                        className="h-5 w-5 text-gray-500 cursor-pointer"
                                                        onClick={togglePasswordVisibility}
                                                    />
                                                ) : (
                                                    <Eye
                                                        className="h-5 w-5 text-gray-500 cursor-pointer"
                                                        onClick={togglePasswordVisibility}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-6">
                                            <label className="inline-flex items-center">
                                                <Field
                                                    type="checkbox"
                                                    name="remember"
                                                    className="form-checkbox h-5 w-5 text-gray-600"
                                                />
                                                <span className="ml-2 text-gray-700">Remember Me</span>
                                            </label>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="relative box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden w-[48%] min-w-20 h-10 text-small bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2 flex items-center font-semibold justify-center gap-2 transition-all duration-300 ease-in-out hover:scale-105"
                                            >
                                                {loading ? (
                                                    <l-bouncy size="25" speed="1.75" color="white" />
                                                ) : (
                                                    "Sign In"
                                                )}
                                            </button>
                                            <button
                                                className="border border-grey bg-gray-300 text-black font-bold py-2 px-6 rounded hover:bg-gray-400 transition-all ease-in-out duration-300 hover:scale-105 w-[48%]"
                                                onClick={() => {
                                                    closeModal();
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginModal;
