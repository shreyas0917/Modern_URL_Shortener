import React, { useState } from 'react'
import { Link, Copy, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { shortenUrl } from '../services/api'

const InputBox = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    
    try {
      const response = await shortenUrl(url)
      
      if (response.success) {
        setResult(response.data)
        toast.success('URL shortened successfully!')
      } else {
        toast.error(response.message || 'Failed to shorten URL')
      }
    } catch (error) {
      console.error('Error shortening URL:', error)
      toast.error('An error occurred while shortening the URL')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const resetForm = () => {
    setUrl('')
    setResult(null)
  }

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Shorten Your URL
        </h2>
        <p className="text-gray-300">
          Enter your long URL below and get a short, shareable link instantly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="input"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Shortening...
            </>
          ) : (
            <>
              <Link className="w-5 h-5" />
              Shorten URL
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-gray-800 border border-gray-600 rounded-lg">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-green-400 mb-2">Success!</h3>
            <p className="text-gray-300">Your URL has been shortened successfully</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Short URL:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={result.shortUrl}
                  readOnly
                  className="input flex-1 bg-gray-700 border-gray-500 text-white font-mono"
                />
                <button
                  onClick={() => copyToClipboard(result.shortUrl)}
                  className="btn btn-secondary"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Original URL</p>
                <p className="text-white text-sm truncate">{result.originalUrl}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Hits</p>
                <p className="text-white font-bold text-lg">{result.hits}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Created</p>
                <p className="text-white text-sm">{new Date(result.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => copyToClipboard(result.shortUrl)}
              className="btn btn-success flex-1"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>
            <button
              onClick={resetForm}
              className="btn btn-secondary flex-1"
            >
              Shorten Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InputBox
