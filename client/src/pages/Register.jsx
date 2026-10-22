import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Film,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../services/movieService'

// Helper to evaluate password strength
const getPasswordStrength = (pwd = '') => {
  if (!pwd) return { score: 0, label: '', color: 'bg-cs-border' }

  let score = 0
  if (pwd.length >= 8) score += 1
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1

  if (score <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-cs-error', text: 'text-cs-error' }
  } else if (score <= 3) {
    return { score: 2, label: 'Medium', color: 'bg-cs-accent', text: 'text-cs-accent' }
  }
  return { score: 3, label: 'Strong', color: 'bg-cs-success', text: 'text-cs-success' }
}

const Register = () => {
  const navigate = useNavigate()
  const auth = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  const passwordValue = watch('password') || ''
  const strength = getPasswordStrength(passwordValue)

  const onSubmit = async (data) => {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const res = await registerUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      })

      const user = res.data?.user
      auth.login(user)
      toast.success(`Welcome to CineScope, ${user.name}! Your account has been created.`)
      navigate('/', { replace: true })
    } catch (err) {
      let msg = 'Registration failed. Please try again.'
      if (err.errors && err.errors.length > 0) {
        msg = err.errors.map((e) => e.message).join('. ')
      } else if (err.message) {
        msg = err.message
      }
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cs-bg flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cs-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Home Button */}
      <div className="w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cs-text-secondary hover:text-cs-accent transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Centered Registration Card */}
      <div className="w-full max-w-md bg-cs-card border border-cs-border rounded-3xl p-6 sm:p-8 shadow-cs-lg relative z-10 backdrop-blur-md">
        {/* CineScope Branding Header */}
        <div className="text-center mb-7">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2.5 mb-3 group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-cs-accent/15 border border-cs-accent/30 flex items-center justify-center text-cs-accent shadow-cs-accent/20 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Film size={26} className="text-cs-accent" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-cs-text flex items-center gap-1">
                Cine<span className="text-cs-accent">Scope</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cs-text-secondary font-bold block -mt-1">
                Cinema Redefined
              </span>
            </div>
          </Link>

          <h1 className="text-xl sm:text-2xl font-black text-cs-text tracking-tight mt-3">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-cs-text-secondary mt-1 max-w-xs mx-auto leading-relaxed">
            Join CineScope to build your watchlist, rate films, and discover hidden cinematic gems.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-fade-in">
            <AlertCircle size={18} className="text-cs-error shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300 font-medium leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name field */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-wider text-cs-text mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cs-text-secondary">
                <User size={16} />
              </div>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name cannot exceed 50 characters',
                  },
                })}
                className={`w-full bg-cs-bg-secondary border rounded-xl pl-10 pr-4 py-3 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none transition-all duration-200 ${
                  errors.name
                    ? 'border-cs-error focus:border-cs-error ring-1 ring-cs-error/40'
                    : 'border-cs-border focus:border-cs-accent focus:ring-1 focus:ring-cs-accent/30'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-cs-error flex items-center gap-1">
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-cs-text mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cs-text-secondary">
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                className={`w-full bg-cs-bg-secondary border rounded-xl pl-10 pr-4 py-3 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none transition-all duration-200 ${
                  errors.email
                    ? 'border-cs-error focus:border-cs-error ring-1 ring-cs-error/40'
                    : 'border-cs-border focus:border-cs-accent focus:ring-1 focus:ring-cs-accent/30'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-cs-error flex items-center gap-1">
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-cs-text mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cs-text-secondary">
                <Lock size={16} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters (letters & numbers)"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)/,
                    message: 'Password must contain at least one letter and one number',
                  },
                })}
                className={`w-full bg-cs-bg-secondary border rounded-xl pl-10 pr-11 py-3 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none transition-all duration-200 ${
                  errors.password
                    ? 'border-cs-error focus:border-cs-error ring-1 ring-cs-error/40'
                    : 'border-cs-border focus:border-cs-accent focus:ring-1 focus:ring-cs-accent/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cs-text-secondary hover:text-cs-text transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-cs-error flex items-center gap-1">
                <span>{errors.password.message}</span>
              </p>
            )}

            {/* Password Strength Indicator */}
            {passwordValue.length > 0 && (
              <div className="mt-2.5 space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cs-text-secondary flex items-center gap-1">
                    <ShieldCheck size={12} className={strength.text} />
                    Password strength:
                  </span>
                  <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      strength.score >= 1 ? strength.color : 'bg-cs-border'
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      strength.score >= 2 ? strength.color : 'bg-cs-border'
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      strength.score >= 3 ? strength.color : 'bg-cs-border'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-cs-text mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cs-text-secondary">
                <Lock size={16} />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) =>
                    val === passwordValue || 'Passwords do not match',
                })}
                className={`w-full bg-cs-bg-secondary border rounded-xl pl-10 pr-11 py-3 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none transition-all duration-200 ${
                  errors.confirmPassword
                    ? 'border-cs-error focus:border-cs-error ring-1 ring-cs-error/40'
                    : 'border-cs-border focus:border-cs-accent focus:ring-1 focus:ring-cs-accent/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cs-text-secondary hover:text-cs-text transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-cs-error flex items-center gap-1">
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                {...register('agreeTerms', {
                  required: 'You must agree to the terms to continue',
                })}
                className="w-4 h-4 mt-0.5 rounded border-cs-border bg-cs-bg-secondary text-cs-accent focus:ring-cs-accent/40 cursor-pointer accent-amber-400"
              />
              <span className="text-xs text-cs-text-secondary group-hover:text-cs-text leading-tight transition-colors">
                I agree to the CineScope{' '}
                <span className="text-cs-accent hover:underline">Terms of Service</span> and{' '}
                <span className="text-cs-accent hover:underline">Privacy Policy</span>.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="mt-1 text-xs text-cs-error flex items-center gap-1">
                <span>{errors.agreeTerms.message}</span>
              </p>
            )}
          </div>

          {/* Register Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/30 shadow-lg hover:shadow-cs-accent/50 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} className="transition-transform group-hover:scale-110" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer / Switch to Login */}
        <div className="mt-8 pt-6 border-t border-cs-border text-center">
          <p className="text-xs sm:text-sm text-cs-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-cs-accent hover:text-yellow-400 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
