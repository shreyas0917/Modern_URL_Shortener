import React from 'react'
import { Link } from 'react-router-dom'
import { Link as LinkIcon } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 shadow-lg">
      <div className="container mx-auto px-8">
        <div className="flex justify-between items-center py-6">
          <Link 
            to="/" 
            className="flex items-center gap-4 text-2xl font-bold text-white hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LinkIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-white">
              URL Shortener
            </span>
          </Link>
          
          <div className="flex items-center gap-10">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-blue-400 font-medium px-4 py-3 rounded-xl hover:bg-blue-900/20 transition-colors text-lg"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
