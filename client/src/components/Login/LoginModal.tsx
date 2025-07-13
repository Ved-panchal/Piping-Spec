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

const LoginModal = ({ isOpen, closeModal, onLoginSuccess }: LoginModalProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [currentStep, setCurrentStep] = useState<'email' | 'otp'>('email');
    const [emailForReset, setEmailForReset] = useState('');
    const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('left');
    const [otpValues, setOtpValues] = useState(Array(6).fill(''));
    const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
    const emailInputRef = useRef<HTMLInputElement>(null);

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

    const forgotPasswordSchema = Yup.object({
        email: Yup.string().email('Invalid email format').required('Email is required'),
    });

    const validationSchema = Yup.object({
        Email: Yup.string().email('Invalid email format').min(6).max(50).required('Email is required'),
        password: Yup.string().min(6).max(12).required('Password is required'),
    });

   const onSubmit = async (values: LoginFormValues) => {
  setLoading(true);
  try {
    const response = await api.post(configApi.API_URL.auth.login, {
      email: values.Email,
      password: values.password,
    });

    if (response?.data?.success) {
      const { user, token, plan, message } = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("plan", JSON.stringify(plan));
      showToast({ message: message || "Login Successful!!", type: "success" });
      onLoginSuccess(user);
      closeModal();
    } else {
      showToast({ message: response.data.error || "Login failed", type: "error" });
    }
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    let statusCode = null;

    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as ApiError;
      errorMessage = apiError.response?.data?.error || errorMessage;
      statusCode = apiError.response?.status || null;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast({ message: errorMessage, type: "error" });

    if (statusCode === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
  } finally {
    setLoading(false);
  }
};


    const handleForgotPassword = () => {
        setAnimationDirection('left');
        setForgotPasswordMode(true);
        setCurrentStep('email');
    };

    const handleBackToLogin = () => {
        setAnimationDirection('right');
        setTimeout(() => {
            setForgotPasswordMode(false);
            setCurrentStep('email');
        }, 300);
    };

    const handleEmailSubmit = async (values: { email: string }) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setEmailForReset(values.email);
            setAnimationDirection('left');
            setCurrentStep('otp');
            showToast({ message: 'OTP sent to your email', type: 'success' });
        } catch (error) {
            showToast({ message: 'Failed to send OTP', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (values: { otp: string }) => {
        setLoading(true);
        const fullOtp = values.otp;
        if (fullOtp.length !== 6) {
            showToast({ message: 'Please enter a valid 6-digit OTP', type: 'error' });
            setLoading(false);
            return;
        }
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast({ message: 'Password reset link sent to your email', type: 'success' });
            handleBackToLogin();
        } catch (error) {
            showToast({ message: 'Invalid OTP', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getAnimationClass = (direction: 'left' | 'right') => {
        return direction === 'left' 
            ? 'animate-[slide-in-left_0.3s_ease-in-out]' 
            : 'animate-[slide-in-right_0.3s_ease-in-out]';
    };

    return isOpen ? (
        <div
            className="fixed inset-0 z-[999] grid h-screen w-full place-items-center bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={closeModal}
        >
            <div
                className="relative mx-auto w-full max-w-md rounded-xl bg-white shadow-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    {!forgotPasswordMode ? (
                        <div className={getAnimationClass(animationDirection)}>
                            <h4 className="text-2xl font-semibold text-blue-gray-900">Sign In</h4>
                            <p className="mb-3 text-base text-gray-700">Enter your Email and password to Sign In.</p>
                            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                                {({ handleSubmit }) => (
                                    <Form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="text-sm font-bold text-gray-700">Your Email</label>
                                            <FormikInput name="Email" type="email" placeholder="Enter your email" innerRef={emailInputRef} autoFocus />
                                            <FormikErrorMessage name="Email" component="div" />
                                        </div>
                                        <div className="mb-4 relative">
                                            <label className="text-sm font-bold text-gray-700">Your Password</label>
                                            <FormikInput name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" />
                                            <FormikErrorMessage name="password" component="div" />
                                            <div className="absolute top-[38px] right-3">
                                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500 cursor-pointer" onClick={togglePasswordVisibility} /> : <Eye className="w-5 h-5 text-gray-500 cursor-pointer" onClick={togglePasswordVisibility} />}
                                            </div>
                                        </div>
                                        <div className="mb-6 flex items-center justify-between">
                                            <label className="inline-flex items-center">
                                                <Field type="checkbox" name="remember" className="h-5 w-5 text-gray-600" />
                                                <span className="ml-2 text-gray-700">Remember Me</span>
                                            </label>
                                            <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-blue-500 hover:text-blue-700">Forgot Password?</button>
                                        </div>
                                        <div className="flex justify-between">
                                            <button type="submit" disabled={loading} className="w-[48%] h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-transform hover:scale-105">
                                                {loading ? <l-bouncy size="25" speed="1.75" color="white" /> : "Sign In"}
                                            </button>
                                            <button type="button" onClick={closeModal} className="w-[48%] h-10 bg-gray-300 text-black font-bold rounded hover:bg-gray-400 transition-transform hover:scale-105">Cancel</button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    ) : (
                        <div className={getAnimationClass(animationDirection)}>
                            <h4 className="text-2xl font-semibold text-blue-gray-900">{currentStep === 'email' ? 'Reset Password' : 'Enter OTP'}</h4>
                            <p className="mb-3 text-base text-gray-700">{currentStep === 'email' ? 'Enter your email to receive a reset link' : `We sent a code to ${emailForReset}`}</p>
                            {currentStep === 'email' ? (
                                <Formik initialValues={{ email: '' }} validationSchema={forgotPasswordSchema} onSubmit={handleEmailSubmit}>
                                    {({ handleSubmit }) => (
                                        <Form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label className="text-sm font-bold text-gray-700">Your Email</label>
                                                <FormikInput name="email" type="email" placeholder="Enter your email" autoFocus />
                                                <FormikErrorMessage name="email" component="div" />
                                            </div>
                                            <div className="flex justify-between mt-6">
                                                <button type="button" onClick={handleBackToLogin} className="w-[48%] p-2 bg-gray-300 text-black font-bold rounded hover:bg-gray-400 transition-transform hover:scale-105">Back</button>
                                                <button type="submit" disabled={loading} className="w-[48%] p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-transform hover:scale-105">
                                                    {loading ? <l-bouncy size="25" speed="1.75" color="white" /> : "Submit"}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            ) : (
                                <Formik initialValues={{ otp: '' }} onSubmit={() => handleOtpSubmit({ otp: otpValues.join('') })}>
                                    {({ handleSubmit }) => (
                                        <Form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label className="text-sm font-bold text-gray-700">Enter OTP</label>
                                                <div className="flex justify-between gap-2">
                                                    {otpValues.map((digit, index) => (
                                                        <input
                                                            key={index}
                                                            ref={(el) => (otpRefs.current[index] = el)}
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={1}
                                                            className="w-10 h-12 text-center border border-gray-300 rounded-md text-xl focus:outline-none focus:border-blue-500"
                                                            value={digit}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (!/\d?/.test(val)) return;
                                                                const newOtp = [...otpValues];
                                                                newOtp[index] = val;
                                                                setOtpValues(newOtp);
                                                                if (val && index < 5) otpRefs.current[index + 1]?.focus();
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
                                                                    otpRefs.current[index - 1]?.focus();
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-6">
                                                <button type="button" onClick={() => setCurrentStep('email')} className="w-[48%] p-2 bg-gray-300 text-black font-bold rounded hover:bg-gray-400 transition-transform hover:scale-105">Back</button>
                                                <button type="submit" disabled={loading} className="w-[48%] p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-transform hover:scale-105">
                                                    {loading ? <l-bouncy size="25" speed="1.75" color="white" /> : "Verify"}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;
};

export default LoginModal;
