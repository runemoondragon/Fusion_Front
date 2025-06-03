import React from 'react';
import Link from 'next/link';
import { Brain, Zap, TrendingUp, CheckCircle, ArrowRight, AlertCircle, Info, Target } from 'lucide-react';

export default function NeuroSwitchFAQPage() {
  const basicQuestions = [
    {
      question: "What is NeuroSwitch?",
      answer: "NeuroSwitch is Fusion AI's intelligent routing system that automatically selects the best AI model for each request. It analyzes your prompt, considers factors like complexity, domain, cost, and performance to route your request to the optimal provider."
    },
    {
      question: "How does NeuroSwitch choose which model to use?",
      answer: "NeuroSwitch uses machine learning to analyze your prompt's characteristics - complexity, domain (code, creative writing, analysis, etc.), length, and context. It then matches these to the strengths of available models while considering your preferences for cost vs quality."
    },
    {
      question: "Can I still choose a specific model manually?",
      answer: "Yes! You can override NeuroSwitch by specifying a provider parameter like 'openai', 'claude', or 'gemini'. NeuroSwitch is used when you set provider to 'neuroswitch' or omit the provider parameter entirely."
    }
  ];

  const routingFactors = [
    {
      title: "Prompt Complexity",
      description: "Analyzes reasoning depth, multi-step tasks, and complexity requirements",
      icon: <Brain className="w-5 h-5" />,
      examples: ["Simple Q&A → GPT-3.5 Turbo", "Complex reasoning → Claude 3 Opus", "Math problems → GPT-4"]
    },
    {
      title: "Domain Classification",
      description: "Identifies the subject area and matches to model strengths",
      icon: <Target className="w-5 h-5" />,
      examples: ["Code generation → GPT-4", "Creative writing → Claude", "Data analysis → GPT-4"]
    },
    {
      title: "Cost Optimization",
      description: "Balances quality needs with cost efficiency",
      icon: <TrendingUp className="w-5 h-5" />,
      examples: ["Simple tasks → cheaper models", "Critical work → premium models", "Batch jobs → optimized routing"]
    }
  ];

  const advancedQuestions = [
    {
      question: "How accurate is NeuroSwitch routing?",
      answer: "NeuroSwitch achieves 92% accuracy in selecting the optimal model based on quality benchmarks and cost efficiency. It continuously learns from usage patterns and feedback to improve routing decisions."
    },
    {
      question: "Does NeuroSwitch consider my previous conversations?",
      answer: "Yes, NeuroSwitch maintains session context and will route follow-up messages in a conversation to the same model to maintain consistency, unless there's a significant change in requirements."
    },
    {
      question: "Can I provide hints to influence NeuroSwitch decisions?",
      answer: "You can use prompt prefixes like 'For creative writing:', 'Code generation:', or 'Complex analysis:' to help NeuroSwitch understand your intent and route accordingly."
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">NeuroSwitch FAQ</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn how Fusion AI's intelligent routing system automatically selects the best AI model 
          for your specific needs, optimizing for quality, speed, and cost.
        </p>
      </div>

      {/* Basic Questions */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How NeuroSwitch Works</h2>
        
        <div className="space-y-6">
          {basicQuestions.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Brain className="w-5 h-5 text-purple-600 mr-2" />
                {faq.question}
              </h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Routing Factors */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Routing Decision Factors</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {routingFactors.map((factor, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                {React.cloneElement(factor.icon, { className: 'w-6 h-6 text-purple-600' })}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{factor.title}</h3>
              <p className="text-gray-600 mb-4">{factor.description}</p>
              
              <div className="space-y-2">
                {factor.examples.map((example, exampleIndex) => (
                  <div key={exampleIndex} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {example}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Routing Process */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Routing Process Flow</h2>
        
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Prompt Analysis</h3>
            <p className="text-sm text-gray-600">
              NeuroSwitch analyzes prompt content, length, complexity, and domain indicators
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-purple-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Model Scoring</h3>
            <p className="text-sm text-gray-600">
              Each available model receives a score based on predicted performance for this task
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-green-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Cost-Quality Balance</h3>
            <p className="text-sm text-gray-600">
              Considers your account preferences and balances quality needs with cost efficiency
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-orange-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Route & Execute</h3>
            <p className="text-sm text-gray-600">
              Routes to optimal model and provides transparent reasoning in response
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Questions */}
      <section className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced NeuroSwitch</h2>
        
        <div className="space-y-6">
          {advancedQuestions.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                {faq.question}
              </h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Model Strengths Matrix */}
      <section className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-8 border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Model Strengths & Use Cases</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg border border-green-200">
            <thead>
              <tr className="bg-green-100 border-b border-green-200">
                <th className="text-left p-4 font-semibold text-gray-900">Model</th>
                <th className="text-center p-4 font-semibold text-gray-900">Best For</th>
                <th className="text-center p-4 font-semibold text-gray-900">Speed</th>
                <th className="text-center p-4 font-semibold text-gray-900">Cost</th>
                <th className="text-center p-4 font-semibold text-gray-900">Quality</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-green-100">
                <td className="p-4 font-medium text-gray-900">GPT-3.5 Turbo</td>
                <td className="p-4 text-center text-sm">Quick tasks, simple Q&A</td>
                <td className="p-4 text-center">⚡⚡⚡</td>
                <td className="p-4 text-center">💰</td>
                <td className="p-4 text-center">⭐⭐⭐</td>
              </tr>
              <tr className="border-b border-green-100">
                <td className="p-4 font-medium text-gray-900">GPT-4 Turbo</td>
                <td className="p-4 text-center text-sm">Code, analysis, complex reasoning</td>
                <td className="p-4 text-center">⚡⚡</td>
                <td className="p-4 text-center">💰💰💰</td>
                <td className="p-4 text-center">⭐⭐⭐⭐⭐</td>
              </tr>
              <tr className="border-b border-green-100">
                <td className="p-4 font-medium text-gray-900">Claude 3 Opus</td>
                <td className="p-4 text-center text-sm">Creative writing, long-form content</td>
                <td className="p-4 text-center">⚡</td>
                <td className="p-4 text-center">💰💰💰💰</td>
                <td className="p-4 text-center">⭐⭐⭐⭐⭐</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900">Gemini Pro</td>
                <td className="p-4 text-center text-sm">Research, factual queries</td>
                <td className="p-4 text-center">⚡⚡</td>
                <td className="p-4 text-center">💰💰</td>
                <td className="p-4 text-center">⭐⭐⭐⭐</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Configuration Options */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">NeuroSwitch Configuration</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Routing</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "prompt": "Explain quantum computing",
  "provider": "neuroswitch"
}`}
              </pre>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Uses intelligent routing with balanced cost-quality optimization
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Preferences</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "prompt": "Write a creative story",
  "provider": "neuroswitch",
  "preferences": {
    "priority": "quality",
    "domain_hint": "creative"
  }
}`}
              </pre>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Prioritizes quality over cost with domain hint for better routing
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Questions & Troubleshooting</h2>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              Why did NeuroSwitch choose a different model than I expected?
            </h3>
            <p className="text-gray-600 text-sm">
              NeuroSwitch optimizes for overall value. Check the routing_reason in the response for 
              specific explanation. You can override with specific provider if needed.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              Can I see NeuroSwitch's decision process?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes! Every response includes routing_reason and confidence_score fields showing 
              why that model was selected and how confident NeuroSwitch was in the decision.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              How do I optimize NeuroSwitch for my use case?
            </h3>
            <p className="text-gray-600 text-sm">
              Use clear prompts, add domain hints like "Code:", provide feedback through the API, 
              and set account preferences for cost vs quality balance.
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Best Practices for NeuroSwitch</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">✅ Optimize Routing</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Use clear, specific prompts
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Add domain hints when relevant
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Review routing decisions in responses
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Set account preferences for your typical use
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">⚠️ Consider Manual Routing When</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Consistency is critical across requests
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Testing specific model capabilities
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Strict cost or latency requirements
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Very specialized domain knowledge needed
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
            href="/docs/overview/data-flow" 
            className="group p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Data Flow</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-gray-600 text-sm">See how NeuroSwitch fits in the request flow</p>
          </Link>
          
          <Link 
            href="/docs/models" 
            className="group p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Model Comparison</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-gray-600 text-sm">Compare available AI models</p>
          </Link>
          
          <Link 
            href="/docs/api/parameters" 
            className="group p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">API Parameters</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-gray-600 text-sm">Control NeuroSwitch behavior</p>
          </Link>
        </div>
      </section>
    </div>
  );
} 