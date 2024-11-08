import { Field, FieldProps } from "formik";
import { InputProps } from "../../utils/interface";

const FormikInput = ({ type, name, placeholder, className, innerRef, autoFocus,disabled }: InputProps) => {
  return (
    <Field name={name}>
      {({ field }: FieldProps) => (
        <input
          {...field}
          type={type}
          ref={innerRef}
          autoFocus={autoFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`${
            className ? className : ""
          } w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out text-gray-700 text-sm placeholder-gray-400 placeholder-opacity-100 ${disabled?"cursor-not-allowed":"cursor-text"}`}
        />
      )}
    </Field>
  );
};

export default FormikInput;