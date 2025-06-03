import React from 'react';
import Link from 'next/link';
import { Hash, DollarSign, TrendingUp, CheckCircle, ArrowRight, AlertCircle, Info } from 'lucide-react';

export default function TokensFAQPage() {
  const tokenBasics = [
    {
      question: "What are tokens?",
      answer: "Tokens are the basic units that AI models use to process text. They can be words, parts of words, or even punctuation marks. For example, 'Hello world!' contains 3 tokens: 'Hello', ' world', and '!'."
    },
    {
      question: "How are tokens counted?",
      answer: "Tokens are counted for both input (your prompt) and output (AI response). Different models may tokenize text differently, but Fusion AI normalizes token counting across providers for consistent billing."
    },
    {
      question: "Do different languages use different token counts?",
      answer: "Yes, languages with different character systems (like Chinese, Japanese, or Arabic) typically use more tokens per word compared to English. Fusion AI accounts for this in cost calculations."
    }
  ];

  const costingFAQs = [
    {
      question: "How much do tokens cost?",
      answer: "Token costs vary by provider and model. GPT-4 costs more per token than GPT-3.5, for example. Fusion AI shows transparent pricing and lets NeuroSwitch automatically select cost-effective models."
    },
    {
      question: "Are input and output tokens priced the same?",
      answer: "No, output tokens typically cost more than input tokens. This is because generating text requires more computational resources than processing input text."
    },
    {
      question: "Do I pay for tokens when using cache hits?",
      answer: "No! When Fusion AI serves a response from cache, you only pay for the input tokens (to process your request), not for the cached output tokens."
    }
  ];

  const optimizationTips = [
    {
      title: "Use Prompt Caching",
      description: "Enable caching for repeated queries to avoid paying for output tokens multiple times",
      savings: "Up to 80% cost reduction",
      color: "blue"
    },
    {
      title: "Optimize Prompt Length",
      description: "Be concise but specific. Longer prompts use more input tokens",
      savings: "10-30% token reduction",
      color: "green"
    },
    {
      title: "Set Token Limits",
      description: "Use max_tokens parameter to control response length and costs",
      savings: "Predictable costs",
      color: "purple"
    },
    {
      title: "Choose Right Model",
      description: "Let NeuroSwitch select cost-effective models, or choose manually based on needs",
      savings: "30-50% cost optimization",
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Token Usage FAQ</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Everything you need to know about tokens, how they're counted, and how to optimize 
          your usage for better performance and lower costs.
        </p>
      </div>

      {/* Token Basics */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Token Basics</h2>
        
        <div className="space-y-6">
          {tokenBasics.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Hash className="w-5 h-5 text-blue-600 mr-2" />
                {faq.question}
              </h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Token Counting Examples */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Token Counting Examples</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4">English Text</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">"Hello world"</span>
                <span className="font-medium text-blue-600">2 tokens</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">"How are you today?"</span>
                <span className="font-medium text-blue-600">4 tokens</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">"AI is transforming technology"</span>
                <span className="font-medium text-blue-600">5 tokens</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4">Other Languages</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">"こんにちは" (Japanese)</span>
                <span className="font-medium text-purple-600">6 tokens</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">"你好世界" (Chinese)</span>
                <span className="font-medium text-purple-600">8 tokens</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">"مرحبا بالعالم" (Arabic)</span>
                <span className="font-medium text-purple-600">7 tokens</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost FAQ */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Costs</h2>
        
        <div className="space-y-6">
          {costingFAQs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                {faq.question}
              </h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-8 border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cost Comparison by Model</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg border border-green-200">
            <thead>
              <tr className="bg-green-100 border-b border-green-200">
                <th className="text-left p-4 font-semibold text-gray-900">Model</th>
                <th className="text-center p-4 font-semibold text-gray-900">Input (per 1K tokens)</th>
                <th className="text-center p-4 font-semibold text-gray-900">Output (per 1K tokens)</th>
                <th className="text-center p-4 font-semibold text-gray-900">Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-green-100">
                <td className="p-4 font-medium text-gray-900">GPT-3.5 Turbo</td>
                <td className="p-4 text-center">$0.0015</td>
                <td className="p-4 text-center">$0.002</td>
                <td className="p-4 text-center text-sm text-gray-600">Fast, economical</td>
              </tr>
              <tr className="border-b border-green-100">
                <td className="p-4 font-medium text-gray-900">GPT-4</td>
                <td className="p-4 text-center">$0.03</td>
                <td className="p-4 text-center">$0.06</td>
                <td className="p-4 text-center text-sm text-gray-600">High quality</td>
              </tr>
              <tr className="border-b border-green-100">
                <td className="p-4 font-medium text-gray-900">Claude 3 Opus</td>
                <td className="p-4 text-center">$0.015</td>
                <td className="p-4 text-center">$0.075</td>
                <td className="p-4 text-center text-sm text-gray-600">Complex reasoning</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900">NeuroSwitch</td>
                <td className="p-4 text-center text-green-600">Auto-optimized</td>
                <td className="p-4 text-center text-green-600">Best value</td>
                <td className="p-4 text-center text-sm text-gray-600">Optimal selection</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Optimization Tips */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Token Optimization Strategies</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {optimizationTips.map((tip, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border ${getColorClasses(tip.color)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full bg-white border ${getColorClasses(tip.color).split(' ')[0]}`}>
                  {tip.savings}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Questions */}
      <section className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Token Questions</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              Do images and PDFs count as tokens?
            </h3>
            <p className="text-gray-600">
              Yes, when you upload images or PDFs, they are processed into tokens for analysis. 
              The token count depends on the content complexity and extraction method. Fusion AI 
              shows token usage for multimedia content in the response metadata.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              How do function calls affect token usage?
            </h3>
            <p className="text-gray-600">
              Function/tool calls consume tokens for the function definition, parameters, and results. 
              However, they often provide more accurate and useful responses, making them cost-effective 
              for specific tasks.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              What happens if I exceed my token limit?
            </h3>
            <p className="text-gray-600">
              If you set a max_tokens limit, the response will be truncated at that point. 
              If you exceed your account limits, the API will return an error with information 
              about upgrading your plan or waiting for the limit reset.
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Token Best Practices</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">✅ Do This</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Monitor token usage in API responses
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Use caching for repeated queries
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Set appropriate max_tokens limits
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Let NeuroSwitch optimize model selection
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">⚠️ Avoid This</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Sending unnecessarily long prompts
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Requesting overly long responses
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Ignoring caching opportunities
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Using expensive models for simple tasks
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Link 
            href="/docs/features/caching" 
            className="group p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Prompt Caching</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-gray-600 text-sm">Learn how caching reduces token costs</p>
          </Link>
          
          <Link 
            href="/docs/overview/neuroswitch" 
            className="group p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">NeuroSwitch</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-gray-600 text-sm">Automatic cost optimization</p>
          </Link>
          
          <Link 
            href="/docs/api/parameters" 
            className="group p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">API Parameters</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-gray-600 text-sm">Control token usage with parameters</p>
          </Link>
        </div>
      </section>
    </div>
  );
} 