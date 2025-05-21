'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// TODO: Share OAuth button component if not already done
interface OAuthProviderButtonProps {
  providerName: string;
  logoSrc: string;
  onClick: () => void;
}

const OAuthProviderButton: React.FC<OAuthProviderButtonProps> = ({ providerName, logoSrc, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Sign up with ${providerName}`}
    className="w-10 h-10 inline-flex items-center justify-center border border-neutral-300 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
  >
    <Image src={logoSrc} alt={providerName} width={24} height={24} className="w-5 h-5" />
  </button>
)

interface SignupFormProps {
  onSuccess: () => void // Callback after successful signup
  onSwitchToLogin: () => void // Callback to switch modal view to login
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSignup, setIsEmailSignup] = useState(false) // State to toggle email form

  const handleOAuthSignup = (provider: string) => {
    // Store return URL before redirecting
    localStorage.setItem('auth_return_url', '/')
    // Redirect to backend OAuth route
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/${provider}`
    // onSuccess will likely be handled by the page detecting the auth token after redirect
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) { // Example validation
      setError('Password must be at least 8 characters long.')
      return
    }
    if (!agreedToTerms) {
        setError('You must agree to the Terms of Service.')
        return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/email/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }
      localStorage.setItem('auth_token', data.token)
      onSuccess() // Call the success callback
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const oauthProviders = [
    { name: 'Google', logoSrc: '/google-logo.aacb4c7fe7b2200fd0f19101d3e5b6b1.svg', onClick: () => handleOAuthSignup('google') },
    { name: 'Microsoft', logoSrc: '/microsoft-logo.232bed9486815048a01cb94c9e7cd25e.svg', onClick: () => handleOAuthSignup('microsoft') },
    { name: 'Apple', logoSrc: '/apple-logo.361cc8941957f07da1580885f7440af7.svg', onClick: () => handleOAuthSignup('apple') },
    // Add others if needed
  ]

  return (
    <div className="w-full space-y-6">
      {/* OAuth Buttons Section */}
      <div className="text-center">
        <p className="text-sm text-neutral-600 mb-4">Sign up with your preferred provider:</p>
        <div className="flex justify-center space-x-3">
          {oauthProviders.map((provider) => (
            <OAuthProviderButton
              key={provider.name}
              providerName={provider.name}
              logoSrc={provider.logoSrc}
              onClick={provider.onClick}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center">
        <div className="flex-grow border-t border-neutral-300"></div>
        <span className="px-3 text-xs text-neutral-500 bg-white">OR</span>
        <div className="flex-grow border-t border-neutral-300"></div>
      </div>

      {/* Email Form Section */}
      {!isEmailSignup ? (
        <button
          onClick={() => setIsEmailSignup(true)}
          className="w-full flex justify-center py-2.5 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          Continue with Email
        </button>
      ) : (
        <form className="space-y-4" onSubmit={handleEmailSignup}>
          <div>
            <label htmlFor="signup-email-address" className="sr-only">Email address</label>
            <input
              id="signup-email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2.5 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="sr-only">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none relative block w-full px-3 py-2.5 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="signup-confirm-password" className="sr-only">Confirm Password</label>
            <input
              id="signup-confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none relative block w-full px-3 py-2.5 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Terms of Service Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms" aria-describedby="terms-description"
                name="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-neutral-300 rounded"
              />
            </div>
            <div className="ml-3 text-xs">
              <label htmlFor="terms" className="font-light text-neutral-600">
                I agree to the {' '}
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-orange-600 hover:text-orange-500 underline">
                    Terms of Service
                </Link>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-xs" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                ${isLoading || !agreedToTerms ? 'bg-neutral-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-orange-600'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors`}
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? 'Processing...' : 'Create Account'}
            </button>
          </div>
          <button 
            type="button"
            onClick={() => setIsEmailSignup(false)}
            className="mt-2 w-full flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
            disabled={isLoading}
          >
            Back to signup options
          </button>
        </form>
      )}

      {/* Switch to Login Link */}
      <div className="text-xs text-center mt-4">
        <p className="font-light text-neutral-600">
          Already have an account? {' '}
          <button onClick={onSwitchToLogin} className="font-medium text-orange-600 hover:text-orange-500 underline">
            Log In
          </button>
        </p>
      </div>

      {/* Removed the old terms text paragraph */}
    </div>
  )
}

export default SignupForm 