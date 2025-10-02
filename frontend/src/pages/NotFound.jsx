import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="text-center px-8">
        <div className="mb-12">
          <h1 className="text-8xl font-bold text-gray-500 mb-6">404</h1>
          <h2 className="text-4xl font-bold text-white mb-6">Page Not Found</h2>
          <p className="text-gray-400 max-w-lg mx-auto text-lg leading-relaxed">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            to="/" 
            className="btn btn-primary inline-flex items-center gap-3 text-lg py-4 px-8"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="btn btn-secondary inline-flex items-center gap-3 text-lg py-4 px-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
