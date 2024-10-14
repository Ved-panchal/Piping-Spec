import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import showToast from '../../utils/toast';
import FormikInput from '../FormFields/FormikInput';
import FormikErrorMessage from '../FormFields/FormikErrorMessage';
import { bouncy } from 'ldrs';
import api from '../../utils/api/apiutils';
import { api as configApi } from '../../utils/api/config';

interface ProjectFormValues {
  code: string;
  description: string;
  company: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: ProjectFormValues) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  bouncy.register();

  const initialValues: ProjectFormValues = {
    code: '',
    description: '',
    company: '',
  };

  const validationSchema = Yup.object({
    code: Yup.string()
      .matches(/^[A-Z0-9]{3}$/, 'Code must be 3 alphanumeric characters')
      .required('Project Code is required'),
    description: Yup.string().required('Project Description is required'),
    company: Yup.string().required('Company Name is required'),
  });

  const handleSubmit = async (values: ProjectFormValues) => {
    setLoading(true);
    try {
      const requestBody = {
        projectCode: values.code,
        projectDescription: values.description,
        companyName: values.company,
      };

      const response = await api.post(configApi.API_URL.project.create, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response) {
        console.log(response);
        showToast({ message: 'Project created successfully!', type: 'success' });
        onClose(); 
        onSubmit(values);
      } else {
        showToast({ message: "Error Creating Project", type: 'error' });
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast({
          message: error.message || 'Failed to create project. Please try again.',
          type: 'error',
        });
      } else {
        showToast({
          message: 'An unknown error occurred.',
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
          onClick={onClose}
        >
          <div
            className="relative mx-auto flex w-full max-w-[24rem] flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 p-6">
              <h4 className="block font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                Create Project
              </h4>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
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
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                        Project Code
                      </label>
                      <FormikInput
                        name="code"
                        type="text"
                        placeholder="Enter project code"
                      />
                      <FormikErrorMessage name="code" component="div" />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Project Description
                      </label>
                      <FormikInput
                        name="description"
                        type="text"
                        placeholder="Enter project description"
                      />
                      <FormikErrorMessage name="description" component="div" />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                        Company Name
                      </label>
                      <FormikInput
                        name="company"
                        type="text"
                        placeholder="Enter company name"
                      />
                      <FormikErrorMessage name="company" component="div" />
                    </div>

                    <div className="flex w-full justify-between">
                      <button
                        type="submit"
                        disabled={loading}
                        className="relative box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden w-[48%] min-w-20 h-10 text-small bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 flex items-center font-semibold justify-center gap-2 transition-all duration-300 ease-in-out hover:scale-105"
                      >
                        {loading ? (
                          <l-bouncy size="25" speed="1.75" color="white" />
                        ) : (
                          'Create Project'
                        )}
                      </button>
                      <button
                        className="border border-grey bg-gray-300 text-black font-bold py-2 px-6 rounded hover:bg-gray-400 transition-all ease-in-out duration-300 hover:scale-105 w-[48%]"
                        onClick={onClose}
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

export default CreateProjectModal;
