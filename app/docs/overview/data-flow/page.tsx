import React from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, Globe, Shield, Zap, Code, CheckCircle, Database, Lock, Activity } from 'lucide-react';

export default function DataFlowPage() {
  const flowSteps = [
    {
      number: '1',
      title: 'Request Received',
      description: 'Your application sends a request to Fusion AI API',
      icon: <Code className="w-6 h-6" />,
      color: 'blue',
      details: [
        'HTTPS/TLS 1.3 encrypted connection',
        'API key authentication',
        'Request validation and sanitization',
        'Rate limiting checks'
      ]
    },
    {
      number: '2',
      title: 'NeuroSwitch Analysis',
      description: 'AI-powered prompt classification and routing decision',
      icon: <Brain className="w-6 h-6" />,
      color: 'purple',
      details: [
        'Prompt complexity analysis',
        'Domain classification (code, text, creative, etc.)',
        'Cost-performance optimization',
        'Provider availability check'
      ]
    },
    {
      number: '3',
      title: 'Provider Routing',
      description: 'Request is routed to the optimal AI provider',
      icon: <Globe className="w-6 h-6" />,
      color: 'green',
      details: [
        'Secure provider API call',
        'Request format transformation',
        'Context preservation',
        'Failover handling'
      ]
    },
    {
      number: '4',
      title: 'Response Processing',
      description: 'Provider response is processed and returned',
      icon: <Zap className="w-6 h-6" />,
      color: 'orange',
      details: [
        'Response normalization',
        'Quality validation',
        'Cost calculation',
        'Usage logging'
      ]
    }
  ];

  const securityMeasures = [
    {
      title: 'End-to-End Encryption',
      description: 'All data in transit uses TLS 1.3 encryption',
      icon: <Lock className="w-5 h-5" />
    },
    {
      title: 'Zero Data Retention',
      description: 'Prompts and responses are not stored on Fusion servers',
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: 'Secure Processing',
      description: 'All routing decisions happen in secure, isolated environments',
      icon: <Database className="w-5 h-5" />
    },
    {
      title: 'Audit Trails',
      description: 'Complete logging for transparency and debugging',
      icon: <Activity className="w-5 h-5" />
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Flow</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Understand how your data moves through the Fusion AI system, from request to response, 
          with complete transparency and security at every step.
        </p>
      </div>

      {/* Visual Flow Diagram */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Request Flow Overview</h2>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {flowSteps.map((step, index) => (
            <div key={step.number} className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getColorClasses(step.color).split(' ')[1]} border-2 ${getColorClasses(step.color).split(' ')[2]}`}>
                <span className={`font-bold text-lg ${getColorClasses(step.color).split(' ')[0]}`}>
                  {step.number}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{step.description}</p>
              
              <div className={`p-3 rounded-lg ${getColorClasses(step.color).split(' ')[1]} border ${getColorClasses(step.color).split(' ')[2]}`}>
                {React.cloneElement(step.icon, { 
                  className: `w-6 h-6 mx-auto mb-2 ${getColorClasses(step.color).split(' ')[0]}` 
                })}
              </div>
              
              {index < flowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 transform translate-x-1/2">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Step-by-Step Breakdown</h2>
        
        {flowSteps.map((step, index) => (
          <div key={step.number} className={`p-6 rounded-lg border ${getColorClasses(step.color)}`}>
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClasses(step.color).split(' ')[1]} border-2 ${getColorClasses(step.color).split(' ')[2]}`}>
                {React.cloneElement(step.icon, { 
                  className: `w-6 h-6 ${getColorClasses(step.color).split(' ')[0]}` 
                })}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Step {step.number}: {step.title}
                </h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Security & Privacy */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Security & Privacy</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {securityMeasures.map((measure, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {React.cloneElement(measure.icon, { className: 'w-5 h-5 text-green-600' })}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{measure.title}</h3>
                  <p className="text-sm text-gray-600">{measure.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BYOAPI Flow */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">BYOAPI Data Flow</h2>
        
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            When using Bring Your Own API (BYOAPI), your data flows directly to your chosen provider 
            while still benefiting from NeuroSwitch routing intelligence.
          </p>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-purple-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Route Decision</h3>
              <p className="text-sm text-gray-600">
                NeuroSwitch analyzes your prompt and selects the optimal provider from your configured API keys
              </p>
            </div>
            
            <div className="text-center p-6 border border-blue-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Connection</h3>
              <p className="text-sm text-gray-600">
                Your request goes directly to the provider using your API key, with no intermediate storage
              </p>
            </div>
            
            <div className="text-center p-6 border border-green-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Billing</h3>
              <p className="text-sm text-gray-600">
                Costs are billed directly to your provider account, with transparent usage tracking in Fusion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technical Implementation</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Processing</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">Sub-100ms routing decisions</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">Async processing for optimal performance</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">Intelligent caching and deduplication</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">Real-time streaming support</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">Global edge network for low latency</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">Auto-scaling based on demand</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">99.9% uptime SLA with redundancy</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600">SOC 2 Type II compliant data centers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring & Analytics */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Monitoring & Analytics</h2>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Metrics</h3>
            <p className="text-sm text-gray-600">
              Monitor request latency, success rates, and provider performance in real-time
            </p>
          </div>
          
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <Database className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Usage Analytics</h3>
            <p className="text-sm text-gray-600">
              Detailed breakdown of token usage, costs, and routing decisions
            </p>
          </div>
          
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Audit Logs</h3>
            <p className="text-sm text-gray-600">
              Complete audit trail for compliance and debugging purposes
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">See Data Flow in Action</h2>
        <p className="text-gray-600 mb-6">
          Experience the seamless data flow and intelligent routing of Fusion AI. 
          Try it today and see the transparency for yourself.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/docs/quickstart" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link 
            href="/docs/overview/neuroswitch" 
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Learn About NeuroSwitch
          </Link>
        </div>
      </section>
    </div>
  );
} 