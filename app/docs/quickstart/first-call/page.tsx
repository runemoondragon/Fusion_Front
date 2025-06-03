import React from 'react';
import Link from 'next/link';
import { Copy, CheckCircle, AlertTriangle, ArrowRight, Terminal } from 'lucide-react';

export default function FirstCallPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Your First Call</h1>
        <p className="text-xl text-gray-600">
          Learn how to make your first API request to Fusion AI and understand the response format.
        </p>
      </div>

      {/* Prerequisites */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Before You Start</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-800 text-sm">You have a Fusion AI API key (starts with <code className="bg-blue-100 px-1 rounded">sk-fusion-</code>)</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-800 text-sm">You have cURL installed or a tool like Postman</span>
          </div>
        </div>
        <p className="text-blue-700 text-sm mt-3">
          Don't have an API key yet? <Link href="/docs/quickstart" className="underline font-medium">Get one here →</Link>
        </p>
      </section>

      {/* Basic Request */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Making Your First Request</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Basic Chat Request</h3>
            <p className="text-gray-600 mb-4">
              Replace <code className="bg-gray-100 px-2 py-1 rounded">YOUR_API_KEY</code> with your actual API key:
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4 relative group">
              <button 
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -X POST https://api.mcp4.ai/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Hello! Can you explain what you are?",
    "provider": "neuroswitch"
  }'`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Expected Response</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`{
  "prompt": "Hello! Can you explain what you are?",
  "response": {
    "text": "Hello! I'm an AI assistant accessed through Fusion AI's platform. Fusion AI uses NeuroSwitch technology to intelligently route your requests to the most suitable AI model..."
  },
  "provider": "openai",
  "model": "gpt-4",
  "tokens": {
    "total_tokens": 89,
    "input_tokens": 10,
    "output_tokens": 79
  },
  "routing_decision": {
    "reason": "General conversation works well with GPT-4",
    "confidence": 0.87
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding the Response */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding the Response</h2>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Fields</h3>
              <div className="space-y-3">
                <div>
                  <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">response.text</code>
                  <p className="text-gray-600 text-sm mt-1">The AI's response to your prompt</p>
                </div>
                <div>
                  <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">provider</code>
                  <p className="text-gray-600 text-sm mt-1">Which AI provider was used (openai, claude, google)</p>
                </div>
                <div>
                  <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">model</code>
                  <p className="text-gray-600 text-sm mt-1">Specific model that processed your request</p>
                </div>
                <div>
                  <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">tokens</code>
                  <p className="text-gray-600 text-sm mt-1">Token usage breakdown for billing</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">NeuroSwitch Info</h3>
              <div className="space-y-3">
                <div>
                  <code className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-sm">routing_decision</code>
                  <p className="text-gray-600 text-sm mt-1">Why NeuroSwitch chose this model</p>
                </div>
                <div>
                  <code className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-sm">confidence</code>
                  <p className="text-gray-600 text-sm mt-1">How confident the routing decision was (0-1)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Different Request Types */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Try Different Request Types</h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Code Question</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-xs overflow-x-auto">
{`{
  "prompt": "Write a Python function to reverse a string",
  "provider": "neuroswitch"
}`}
              </pre>
            </div>
            <p className="text-gray-600 text-sm mt-2">May route to Claude for code tasks</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Creative Writing</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-xs overflow-x-auto">
{`{
  "prompt": "Write a short story about a robot",
  "provider": "neuroswitch"
}`}
              </pre>
            </div>
            <p className="text-gray-600 text-sm mt-2">May route to GPT-4 for creative tasks</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Math Problem</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-xs overflow-x-auto">
{`{
  "prompt": "Solve: 2x + 5 = 13",
  "provider": "neuroswitch"
}`}
              </pre>
            </div>
            <p className="text-gray-600 text-sm mt-2">May route to Gemini for mathematical reasoning</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Specific Provider</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-xs overflow-x-auto">
{`{
  "prompt": "Explain quantum computing",
  "provider": "openai",
  "model": "gpt-4"
}`}
              </pre>
            </div>
            <p className="text-gray-600 text-sm mt-2">Force a specific model instead of NeuroSwitch</p>
          </div>
        </div>
      </section>

      {/* Common Errors */}
      <section className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-3">Common Errors</h3>
            <div className="space-y-3">
              <div>
                <code className="text-red-700 bg-red-100 px-2 py-1 rounded text-sm">401 Unauthorized</code>
                <p className="text-red-800 text-sm mt-1">Check that your API key is correct and starts with <code>sk-fusion-</code></p>
              </div>
              <div>
                <code className="text-red-700 bg-red-100 px-2 py-1 rounded text-sm">400 Bad Request</code>
                <p className="text-red-800 text-sm mt-1">Ensure your JSON is valid and includes the required <code>prompt</code> field</p>
              </div>
              <div>
                <code className="text-red-700 bg-red-100 px-2 py-1 rounded text-sm">429 Rate Limited</code>
                <p className="text-red-800 text-sm mt-1">You've hit your rate limit. Wait a moment and try again</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/docs/quickstart/sdks" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
            <Terminal className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Use SDKs</h3>
            <p className="text-gray-600 text-sm mb-3">
              Integrate with Python, JavaScript, and other languages.
            </p>
            <div className="text-blue-600 font-medium text-sm flex items-center">
              Try SDKs <ArrowRight className="ml-1 w-3 h-3" />
            </div>
          </Link>

          <Link href="/docs/features/streaming" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-green-600">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Enable Streaming</h3>
            <p className="text-gray-600 text-sm mb-3">
              Get real-time responses as they're generated.
            </p>
            <div className="text-blue-600 font-medium text-sm flex items-center">
              Learn streaming <ArrowRight className="ml-1 w-3 h-3" />
            </div>
          </Link>

          <Link href="/docs/api" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-purple-600">📤</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Full API Reference</h3>
            <p className="text-gray-600 text-sm mb-3">
              Explore all endpoints and parameters.
            </p>
            <div className="text-blue-600 font-medium text-sm flex items-center">
              View docs <ArrowRight className="ml-1 w-3 h-3" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
} 