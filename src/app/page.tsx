'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "@/components/FormElements/Inputs/Input";
import Button from "@/components/FormElements/Button";
import { toast } from 'react-hot-toast'
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";

export default function Home() {
  const session = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading ] = useState(false);

  useEffect(() => {
    if(session?.status == 'authenticated'){
        router.push('/users');
    }
  }, [session?.status, router])

  const {
      register,
      handleSubmit,
      formState: {
          errors
      }
  }  = useForm<FieldValues>({
      defaultValues: {
          email: '',
          password: ''
      }
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {

      const callback = await signIn("credentials", {
        ...data,
        redirect: false,
      });
  
      if (callback?.error) {
        toast.error('Invalid credentials');
      } else {
        toast.success("Successfully logged in!");
        router.push('/users');
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className = " flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
      <div className = "sm:mx-auto sm:w-full sm:max-w-md">
        <Image alt="Logo" height={180} width={300} className="mx-auto" src="/images/logo/logo.svg"/>
        <h2 className = "mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account   
        </h2> 
      </div> 
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <Input register={register} label="Email Address" type='email' id ='email' errors={errors} showLabel={true}/>
                  <Input register={register}  label="Password" type='password' id ='password' errors={errors} showLabel={true}/>
                  <Button disabled={isLoading} fullWidth type='submit' >Login</Button>
              </form>
          </div>
      </div>
    </div>
  );
}
