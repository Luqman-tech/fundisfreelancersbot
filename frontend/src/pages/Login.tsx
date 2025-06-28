import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { RootState, AppDispatch } from '../store'
import { login, verifyOTP, clearError } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

interface LoginForm {
  phoneNumber: string
}

interface OTPForm {
  otp: string
}

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')

  const { register: registerPhone, handleSubmit: handlePhoneSubmit, formState: { errors: phoneErrors } } = useForm<LoginForm>()
  const { register: registerOTP, handleSubmit: handleOTPSubmit, formState: { errors: otpErrors } } = useForm<OTPForm>()

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onPhoneSubmit = async (data: LoginForm) => {
    const result = await dispatch(login({ phoneNumber: data.phoneNumber }))
    if (login.fulfilled.match(result)) {
      setPhoneNumber(data.phoneNumber)
      setStep('otp')
      toast.success('OTP sent to your phone')
    }
  }

  const onOTPSubmit = async (data: OTPForm) => {
    const result = await dispatch(verifyOTP({ phoneNumber, otp: data.otp }))
    if (verifyOTP.fulfilled.match(result)) {
      toast.success('Login successful')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Fundis & Freelancers Platform
          </p>
        </div>

        {step === 'phone' ? (
          <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit(onPhoneSubmit)}>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...registerPhone('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^(\+254|254|0)?[17]\d{8}$/,
                    message: 'Please enter a valid Kenyan phone number'
                  }
                })}
                type="tel"
                className="input mt-1"
                placeholder="0712345678"
              />
              {phoneErrors.phoneNumber && (
                <p className="mt-1 text-sm text-error-600">{phoneErrors.phoneNumber.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit(onOTPSubmit)}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <p className="text-sm text-gray-500 mb-2">
                We sent a 6-digit code to {phoneNumber}
              </p>
              <input
                {...registerOTP('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'OTP must be 6 digits'
                  }
                })}
                type="text"
                maxLength={6}
                className="input mt-1 text-center text-2xl tracking-widest"
                placeholder="123456"
              />
              {otpErrors.otp && (
                <p className="mt-1 text-sm text-error-600">{otpErrors.otp.message}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="btn btn-outline flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login