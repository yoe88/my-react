import type { NextPage } from 'next';
import { FieldErrors, useForm } from 'react-hook-form';
import { useState } from 'react';
import { cls } from '../../libs/utils';
import Input from '../../components/hook-form/Input';

interface Form {
  email?: string;
  phone?: number;
  telecom?: number;
}

const Input1: NextPage = () => {
  const { register, handleSubmit, reset, watch, control } = useForm<Form>(
    {
      defaultValues: {
        telecom: 0,
        phone: 0
      }
    }
  );
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const onEmailClick = () => {
    reset();
    setMethod('email');
  };
  const onPhoneClick = () => {
    reset();
    setMethod('phone');
  };
  const onValid = (data: Form) => {
    console.log(data);
  };
  const onInValid = (errors: FieldErrors) => {
    console.log(errors);
  };
  console.log(watch());
  return (
    <div className="mt-16 px-4">
      <div className="mt-12">
        <div className="flex flex-col items-center">
          <h5 className="text-sm font-medium text-gray-500">Enter using:</h5>
          <div className="mt-8  grid  w-full grid-cols-2 border-b ">
            <button
              className={cls(
                'border-b-2 pb-4 text-sm font-medium',
                method === 'email'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-400'
              )}
              onClick={onEmailClick}
            >
              Email
            </button>
            <button
              className={cls(
                'border-b-2 pb-4 text-sm font-medium',
                method === 'phone'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-400'
              )}
              onClick={onPhoneClick}
            >
              Phone
            </button>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onValid, onInValid)}
          className="mt-8 flex flex-col space-y-4"
        >
          {method === 'email' ? (
            <>
              <Input
                control={control}
                type="text"
                name="username"
                maxLength={5}
                className="border border-purple-400"
                option={{
                  required: '입력해주세요',
                  validate: {
                    overLength: (value: string) => value.length < 11 || '최대 10자입니다.',
                    notContainAt: (value: string) => !value.includes('@') || '@는 포함할 수 없습니다.'
                  }
                }}
              />
              <Input
                control={control}
                name="telecom"
                className="border border-orange-500"
                option={
                  {
                    required: true,
                    valueAsNumber: true
                  }}
              />

              <input className="border border-blue-500" {...register('phone', { valueAsNumber: true })}/>
            </>
          ) : null}

          <button className="border border-purple-400">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Input1;
