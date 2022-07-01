import { Control, Controller, RegisterOptions } from 'react-hook-form';
import React, { InputHTMLAttributes } from 'react';

interface CustomInput extends InputHTMLAttributes<any>{
  control: Control;
  name: string;
  defaultValue?: string;
  option?: RegisterOptions;
  [key: string]: any;
}

export default function Input({
  control,
  type,
  name,
  className,
  defaultValue,
  option,
  ...rest
}: CustomInput) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue ?? ""}
      rules={option}
      render={({ field, fieldState, formState }) => (
        <input
          type={type}
          className={className}
          {...field}
          {...rest}
          onChange={(e) => {
            if (option?.validate) {
              for (const [, fun] of Object.entries(option.validate)) {
                if (fun(e.target.value) !== true) {
                  return;
                }
              }
            }
            if (option?.valueAsNumber) {
              field.onChange(Number(e.target.value));
            } else {
              field.onChange(e.target.value);
            }
          }}
        />
      )}
    />
  );
}
