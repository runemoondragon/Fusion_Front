import React from 'react';
import Link from 'next/link';
import { Terminal, Key, Shield, Zap, Clock, AlertTriangle } from 'lucide-react';

export default function APIReferencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Reference</h1>
        <p className="text-xl text-gray-600">
          Complete documentation for the Fusion AI API. Build powerful AI applications with our unified interface.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/docs/api/endpoints" className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <Terminal className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-blue-900">Endpoints</h3>
          <p className="text-blue-700 text-sm">All available API endpoints</p>
        </Link>
        
        <Link href="/docs/api/auth" className="bg-green-50 border border-green-200 rounded-lg p-4 hover:border-green-300 transition-colors">
          <Shield className="w-6 h-6 text-green-600 mb-2" />
          <h3 className="font-semibold text-green-900">Authentication</h3>
          <p className="text-green-700 text-sm">API keys and security</p>
        </Link>
        
        <Link href="/docs/api/errors" className="bg-red-50 border border-red-200 rounded-lg p-4 hover:border-red-300 transition-colors">
          <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
          <h3 className="font-semibold text-red-900">Error Handling</h3>
          <p className="text-red-700 text-sm">Error codes and responses</p>
        </Link>
      </div>

      {/* Base URLs */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Base URLs</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Production</h3>
            <code className="text-blue-600 bg-blue-50 px-3 py-1 rounded">https://api.mcp4.ai</code>
            <p className="text-gray-600 text-sm mt-2">Use this for all production applications</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Alternative Endpoint</h3>
            <code className="text-blue-600 bg-blue-50 px-3 py-1 rounded">https://neuro.mcp4.ai</code>
            <p className="text-gray-600 text-sm mt-2">Direct access to NeuroSwitch routing</p>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication</h2>
        
        <p className="text-gray-600 mb-6">
          The Fusion AI API uses API key authentication. Include your API key in the Authorization header of all requests.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Bearer Token Format</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm">
{`Authorization: Bearer sk-fusion-your-api-key-here`}
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Key className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">API Key Format</h3>
                <p className="text-blue-800 text-sm">
                  All Fusion AI API keys start with <code className="bg-blue-100 px-2 py-1 rounded">sk-fusion-</code> followed by a 56-character string.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Limits</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Request Limits</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Free Tier</span>
                <span className="font-medium">1,000 requests/hour</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Pro Tier</span>
                <span className="font-medium">10,000 requests/hour</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Enterprise</span>
                <span className="font-medium">Custom limits</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Rate Limit Headers</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200`}
              </pre>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Check these headers to monitor your usage
            </p>
          </div>
        </div>
      </section>

      {/* Core Endpoints */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Endpoints</h2>
        
        <div className="space-y-6">
          {/* Chat Completion */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chat Completion</h3>
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                <code className="text-sm text-gray-600">/chat</code>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Send a chat message and receive an AI response. Supports NeuroSwitch routing and direct provider targeting.
            </p>

            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -X POST https://api.mcp4.ai/chat \\
  -H "Authorization: Bearer sk-fusion-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Explain quantum computing",
    "provider": "neuroswitch",
    "temperature": 0.7,
    "max_tokens": 500
  }'`}
              </pre>
            </div>

            <div className="mt-4">
              <Link href="/docs/api/endpoints" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View full endpoint documentation →
              </Link>
            </div>
          </div>

          {/* Models */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">List Models</h3>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                <code className="text-sm text-gray-600">/models</code>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Get a list of all available AI models and their capabilities.
            </p>

            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -H "Authorization: Bearer sk-fusion-..." \\
  https://api.mcp4.ai/models`}
              </pre>
            </div>
          </div>

          {/* Credits */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Check Credits</h3>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                <code className="text-sm text-gray-600">/credits</code>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Check your remaining credit balance and usage statistics.
            </p>

            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -H "Authorization: Bearer sk-fusion-..." \\
  https://api.mcp4.ai/credits`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Response Format */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Response Format</h2>
        
        <p className="text-gray-600 mb-6">
          All API responses follow a consistent JSON format with metadata about the request and provider used.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Successful Response</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`{
  "prompt": "Explain quantum computing",
  "response": {
    "text": "Quantum computing is a revolutionary computing paradigm..."
  },
  "provider": "openai",
  "model": "gpt-4",
  "tokens": {
    "total_tokens": 156,
    "input_tokens": 12,
    "output_tokens": 144
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "routing_decision": {
    "reason": "Optimal for general knowledge questions",
    "confidence": 0.92
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Error Response</h3>
            <div className="bg-red-50 rounded-lg p-4">
              <pre className="text-sm text-red-700 overflow-x-auto">
{`{
  "error": "invalid_request",
  "message": "The prompt parameter is required",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00.000Z"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Streaming */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Streaming Support</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Get real-time responses as they're generated by setting <code className="bg-white px-2 py-1 rounded">stream: true</code> in your request.
        </p>

        <div className="bg-gray-900 rounded-lg p-4">
          <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -X POST https://api.mcp4.ai/chat \\
  -H "Authorization: Bearer sk-fusion-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a story",
    "provider": "neuroswitch",
    "stream": true
  }'`}
          </pre>
        </div>

        <div className="mt-4">
          <Link href="/docs/features/streaming" className="text-purple-600 hover:text-purple-700 font-medium">
            Learn more about streaming →
          </Link>
        </div>
      </section>

      {/* SDK Support */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">SDKs and Libraries</h2>
        
        <p className="text-gray-600 mb-6">
          Use our official SDKs to integrate Fusion AI into your applications with just a few lines of code.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Python SDK</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm">
{`pip install fusion-ai

from fusion_ai import FusionAI
client = FusionAI("sk-fusion-...")
response = client.chat("Hello world!")`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">JavaScript SDK</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm">
{`npm install @fusion-ai/sdk

import FusionAI from '@fusion-ai/sdk';
const client = new FusionAI('sk-fusion-...');
const response = await client.chat('Hello world!');`}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/docs/quickstart/sdks" className="text-blue-600 hover:text-blue-700 font-medium">
            View all SDKs and examples →
          </Link>
        </div>
      </section>

      {/* Interactive API Explorer */}
      <section className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive API Explorer</h2>
        
        <p className="text-gray-600 mb-6">
          Want to test the API directly? Use our interactive Swagger documentation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="https://neuro.mcp4.ai/api-docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Terminal className="w-4 h-4 mr-2" />
            Open Swagger UI
          </a>
          
          <Link 
            href="/docs/quickstart/first-call" 
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Try cURL Examples
          </Link>
        </div>
      </section>
    </div>
  );
} 