import React, { MouseEventHandler } from 'react'
import showToast from '../../utils/toast';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';

interface Errors {
    Email?: string;
    password?: string;
}

const LoginModal = ({ isOpen, closeModal }:{isOpen:boolean,closeModal:MouseEventHandler<HTMLDivElement>}) => {

    const [Email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const navigate = useNavigate();

    const validate = () => {
        const errors: Errors = {};
      
        if (!Email || Email.length < 6 || Email.length > 50 || /\s/.test(Email)) {
          errors.Email = "Email must be 6-50 characters long and contain no spaces.";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(Email)) {
            errors.Email = "Invalid email format.";
          }
        }
      
        if (!password || password.length < 6 || password.length > 12 || /\s/.test(password)) {
          errors.password = "Password must be 6-12 characters long and contain no spaces.";
        }
      
        return errors;
      };

      const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
          try {
            const params = new URLSearchParams();
            params.append("Email", Email);
            params.append("password", password);
    
            const response = await api.post(configApi.API_URL.auth.login, params.toString(), {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            });
    
            if (response) {
              localStorage.setItem("userId", response.data["userId"]);
              showToast({ message: "Login Successfull!!", type: "success" });
              setTimeout(() => {
                navigate("/profile/uploadinvoice");
              }, 2000);
            } else {
              showToast({
                message: "Login failed. Please check your credentials.",
                type: "error",
              });
            }
          } catch (error) {
            if (error instanceof Error) {
                showToast({
                  message: error.message || "Login failed. Please check your credentials.",
                  type: "error",
                });
            } else {
                showToast({
                  message: "An unknown error occurred.",
                  type: "error",
                });
            }
          }
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
              <h6 className="block -mb-2 font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-inherit">
                Your Email
              </h6>
              <div className="relative h-11 w-full min-w-[200px]">
                <input
                  className={`w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer border-blue-gray-200 border-t-transparent text-blue-gray-700 outline outline-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 ${
                    errors.Email ? "border-red-500" : ""
                  }`}
                  placeholder=" "
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Email
                </label>
                {errors.Email && (
                  <span className="text-red-500 text-sm">
                    {errors.Email}
                  </span>
                )}
              </div>
              <h6 className="block -mb-2 font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-inherit">
                Your Password
              </h6>
              <div className="relative h-11 w-full min-w-[200px]">
                <input
                  className={`w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer border-blue-gray-200 border-t-transparent text-blue-gray-700 outline outline-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder=" "
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Password
                </label>
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password}
                  </span>
                )}
              </div>
              <div className="-ml-2.5 -mt-3">
                <div className="inline-flex items-center">
                  <label
                    className="relative flex items-center p-3 rounded-full cursor-pointer"
                    htmlFor="remember"
                  >
                    <input
                      type="checkbox"
                      className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-gray-900 checked:bg-gray-900 checked:before:bg-gray-900 hover:before:opacity-10"
                      id="remember"
                    />
                    <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </span>
                  </label>
                  <label
                    className="mt-px cursor-pointer select-none font-sans text-gray-700 hover:text-gray-900"
                    htmlFor="remember"
                  >
                    Remember Me
                  </label>
                </div>
              </div>
              
              <button
                className="block w-full select-none rounded-lg bg-blue-500 py-3.5 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md transition-all hover:shadow-lg hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800"
                type="submit"
                onClick={handleSubmit}
                >
                Sign In
              </button>
                  
              <button
                className="block w-full select-none rounded-lg border border-blue-gray-500 py-3.5 text-center align-middle font-sans text-xs font-bold uppercase text-blue-gray-500 shadow-md transition-all hover:shadow-lg hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-100"
                onClick={() => {
                  setEmail("");
                  setPassword("");
                  closeModal();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LoginModal
