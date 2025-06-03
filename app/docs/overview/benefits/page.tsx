import React from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Globe, 
  Key, 
  DollarSign, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Code, 
  Zap, 
  Settings,
  CheckCircle,
  ArrowRight,
  Shield,
  Target,
  Layers,
  TrendingUp
} from 'lucide-react';

export default function BenefitsPage() {
  const userBenefits = [
    {
      icon: Brain,
      title: "Smart Routing with Zero Headache",
      description: "You don't have to choose the \"best\" AI for your task — NeuroSwitch does it for you. It analyzes your prompt in real time and routes it to the most suitable model (OpenAI, Claude, Gemini, etc.), considering performance, cost, and capabilities.",
      highlight: "It's like having an AI project manager who always picks the right tool for the job.",
      color: "blue"
    },
    {
      icon: Globe,
      title: "Multi-Model Access in One Interface",
      description: "Say goodbye to tab-hopping between providers. With Fusion, you get access to all major LLMs in one unified chat interface — including GPT-4, Claude Opus, Gemini 1.5, and more.",
      highlight: "Use the power of multiple providers, without managing multiple accounts.",
      color: "green"
    },
    {
      icon: Key,
      title: "Bring Your Own API Keys (BYOAPI)",
      description: "Got your own OpenAI, Claude, or Gemini key? Plug it in and go. Fusion routes through your key, tracks cost correctly, and even logs usage transparently.",
      highlight: "Keep full control of your usage, security, and billing.",
      color: "purple"
    },
    {
      icon: DollarSign,
      title: "Intelligent Cost Optimization",
      description: "Fusion doesn't just route smart — it routes cheap when it can. You'll get the most accurate provider within your budget or constraints, automatically.",
      highlight: "Why pay GPT-4 rates for a simple grammar fix?",
      color: "yellow"
    },
    {
      icon: MessageCircle,
      title: "Seamless Continuity Across Sessions",
      description: "Switch providers mid-conversation, no problem. Fusion and NeuroSwitch preserve your context and clean it to match the next model — even across models with different memory limits or formats.",
      highlight: "It feels like one AI, even when it's three.",
      color: "indigo"
    },
    {
      icon: BarChart3,
      title: "Transparent Usage + Credit Tracking",
      description: "See your token usage, cost breakdowns, provider logs, fallback behavior, and more — all in your personal activity dashboard. No more billing black boxes.",
      highlight: "Know exactly where every token and cent goes.",
      color: "red"
    },
    {
      icon: Users,
      title: "Flexible Team + Role Management",
      description: "Admins can manage user roles, allocate credits, set model access controls, and define API allowances — so teams stay organized and compliant.",
      highlight: "Built for individuals, startups, and full orgs alike.",
      color: "teal"
    },
    {
      icon: Code,
      title: "Unified API Access for Devs",
      description: "Developers get a single API endpoint to send queries. Behind the scenes, Fusion handles routing, cost, and context logic — so you can focus on building your product.",
      highlight: "The \"Stripe of AI Providers\" — one key, all models.",
      color: "orange"
    },
    {
      icon: TrendingUp,
      title: "Dynamic Pricing Engine",
      description: "All pricing is real-time and transparent, pulled from a backend model database with configurable markups, model-specific rates, and tiered allowances.",
      highlight: "No surprises — just predictable, scalable usage.",
      color: "pink"
    },
    {
      icon: Settings,
      title: "Built-in Tools & Expansions",
      description: "Fusion's backend already supports tools like code editing, file generation, and web scraping. These tools are available to AI agents and soon to users.",
      highlight: "It's not just a chat interface — it's a command center.",
      color: "gray",
      badge: "Coming Soon"
    }
  ];

  const builderBenefits = [
    {
      icon: Globe,
      title: "Unified Multi-Provider Access",
      description: "Access and interact with multiple AI models (OpenAI, Claude, Gemini, etc.) from a single interface. Easily switch between providers or let NeuroSwitch intelligently route queries.",
      color: "blue"
    },
    {
      icon: Brain,
      title: "Intelligent Model Routing (NeuroSwitch)",
      description: "Powered by a fine-tuned classifier that selects the best model for a given query. Delivers zero-friction intelligent AI switching for optimal performance. Maintains session continuity across providers, making all models feel like one seamless assistant.",
      color: "purple"
    },
    {
      icon: MessageCircle,
      title: "Session Continuity & Conversation Memory",
      description: "Built-in logic preserves chat history even when changing providers. Supports stateless operation via history passed in payload — solving continuity issues across distributed environments.",
      color: "green"
    },
    {
      icon: Layers,
      title: "Modular Architecture",
      description: "Extensible backend allows plug-and-play integration of new providers. Clean separation between routing logic, providers, and frontend interface.",
      color: "indigo"
    },
    {
      icon: Key,
      title: "Bring Your Own API (BYOAPI)",
      description: "Users can add their own API keys securely and privately. Enables cost control, privacy, and access to premium capabilities.",
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Admin Controls & Usage Limits",
      description: "Centralized admin panel to set usage quotas, manage provider integrations, and control access. Enables easy scaling and user management in team or enterprise environments.",
      color: "red"
    },
    {
      icon: Zap,
      title: "Modern, Mobile-Optimized UI",
      description: "Responsive, ChatGPT-like chat interface. Smooth input experience with always-visible chat input on mobile. Dropdown-based model selector with submodel support.",
      color: "orange"
    },
    {
      icon: Target,
      title: "Stateless & Scalable Design",
      description: "Production-ready improvements allow scaling via client-side history handling, Redis-based session persistence (optional), and session affinity fallback.",
      color: "teal"
    },
    {
      icon: BarChart3,
      title: "Debugging and Transparency Tools",
      description: "Clear logging for model selection, token tracking, and user session flow. Helps developers and admins monitor, audit, and improve performance.",
      color: "pink"
    },
    {
      icon: Settings,
      title: "Open Ecosystem for Research and Customization",
      description: "Ideal for internal teams, power users, and researchers testing multiple AI models in real-time. Future-proof: customizable classifier, prompt formatters, and user experience.",
      color: "gray"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
      green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
      yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
      indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
      red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
      teal: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
      pink: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
      gray: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Key Benefits of Fusion AI</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover why developers, researchers, and organizations choose Fusion AI for their AI orchestration needs.
        </p>
      </div>

      {/* User Benefits Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">For Users & Teams</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make AI accessible, cost-effective, and effortless for everyone.
          </p>
        </div>

        <div className="space-y-8">
          {userBenefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            const colors = getColorClasses(benefit.color);
            
            return (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.border} border`}>
                    <IconComponent className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                      {benefit.badge && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {benefit.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {benefit.description}
                    </p>
                    
                    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                      <div className="flex items-start">
                        <CheckCircle className={`w-5 h-5 ${colors.text} mr-3 mt-0.5 flex-shrink-0`} />
                        <p className={`${colors.text} font-medium italic`}>
                          {benefit.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Builder Benefits Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">For Builders & Developers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Technical advantages that make Fusion AI the ideal platform for building AI-powered applications.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {builderBenefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            const colors = getColorClasses(benefit.color);
            
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.border} border`}>
                    <IconComponent className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Fusion AI?</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-sm">✗</span>
              </span>
              Without Fusion AI
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-600">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span className="text-sm">Manage multiple AI provider accounts separately</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span className="text-sm">Guess which model works best for each task</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span className="text-sm">Switch contexts manually between conversations</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span className="text-sm">Track usage across multiple billing systems</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span className="text-sm">Handle provider outages and rate limits manually</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </span>
              With Fusion AI
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-600">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-sm">One unified interface for all AI providers</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-sm">NeuroSwitch automatically picks the best model</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-sm">Seamless conversation continuity across models</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-sm">Unified billing and transparent usage tracking</span>
              </li>
              <li className="flex items-start text-gray-600">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-sm">Automatic failover and intelligent routing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience These Benefits?</h2>
        <p className="text-gray-600 mb-6">
          Join thousands of developers and teams who are already building with Fusion AI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/docs/quickstart" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link 
            href="/docs/api" 
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            View API Docs
          </Link>
        </div>
        
        <p className="text-gray-500 text-sm mt-4">
          Free tier available • No credit card required • Setup in under 5 minutes
        </p>
      </section>
    </div>
  );
} 