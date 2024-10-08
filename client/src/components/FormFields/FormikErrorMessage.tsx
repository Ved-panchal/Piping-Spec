import { ErrorMessage } from "formik";

interface ErrorMesage {
    name: string;
    component: any;
    className?: string;
}

const FormikErrorMessage = ({ name, component,className } : ErrorMesage) => {
  return (
    <div>
      <ErrorMessage 
      name={name} 
      component={component} 
      className={`${className ? className : 'text-red-500 text-sm'}`}
      />
    </div>
  );
};

export default FormikErrorMessage;
