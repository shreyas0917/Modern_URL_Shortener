import React from 'react'
import InputBox from '../components/InputBox'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="py-20">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Shorten Your URLs
            </h1>
            <p className="text-gray-300 text-xl mb-12 max-w-2xl mx-auto">
              Create short, memorable links for your long URLs with professional analytics and security.
            </p>
          </div>
        </div>
      </div>

      {/* URL Shortener Section */}
      <div className="py-20">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto">
            <InputBox />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-800">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-6">
                Why Choose Our URL Shortener?
              </h2>
              <p className="text-gray-300 text-lg">
                Simple, fast, and secure URL shortening with analytics
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Fast & Reliable</h3>
                <p className="text-gray-300">
                  Lightning-fast URL shortening with 99.9% uptime
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Analytics</h3>
                <p className="text-gray-300">
                  Track clicks and engagement with detailed analytics
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Secure</h3>
                <p className="text-gray-300">
                  Enterprise-grade security with rate limiting
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
