import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { FileManager } from '@/components/FileManager';
import { UserStats } from '@/components/UserStats';
import { JargonGuide } from '@/components/JargonGuide';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { useAuth } from '@/hooks/useAuth';
import { useUserFiles } from '@/hooks/useUserFiles';
import { 
  Video, 
  Files, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Target,
  ArrowRight,
  Upload,
  MessageCircle,
  BarChart3,
  User,
  CheckCircle,
  Zap,
  Users,
  DollarSign,
  PieChart,
  Wallet
} from 'lucide-react';

export const Homepage: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [showFileManager, setShowFileManager] = useState(false);
  const { user } = useAuth();
  const { files, getFileCount } = useUserFiles();

  const handleFileUploadComplete = (uploadedFiles: any[]) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    // Show success message or redirect to analysis
    if (uploadedFiles.length > 0) {
      // Optionally show file manager after upload
      setShowFileManager(true);
    }
  };

  const startVideoConsultation = () => {
    setScreenState({ currentScreen: "conversation" });
  };

  const features = [
    {
      icon: <Upload className="size-8 text-green-400" />,
      title: "Upload Financial Documents",
      description: "Securely upload bank statements, tax documents, investment portfolios, and more for AI analysis.",
      action: "Upload Files",
      onClick: () => document.querySelector('[data-upload-trigger]')?.click()
    },
    {
      icon: <Video className="size-8 text-green-500" />,
      title: "Video Consultation",
      description: "Get personalized financial advice through face-to-face video calls with your AI mentor.",
      action: "Start Video Call",
      onClick: startVideoConsultation
    },
    {
      icon: <BarChart3 className="size-8 text-green-600" />,
      title: "Financial Analysis",
      description: "Receive detailed insights and recommendations based on your uploaded documents and profile.",
      action: "View Analysis",
      onClick: () => setShowFileManager(true)
    },
    {
      icon: <BookOpen className="size-8 text-green-300" />,
      title: "Learning Resources",
      description: "Access our comprehensive financial jargon guide and educational materials.",
      action: "Learn More",
      onClick: () => setShowFileManager(false)
    }
  ];

  const fileCount = getFileCount();

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Sidebar - User Stats */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-white text-xl font-bold mb-2">Financial Overview</h2>
          <p className="text-gray-400 text-sm">Your financial health at a glance</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-300 text-sm font-medium">Total Balance</div>
              <div className="text-green-400"><Wallet className="size-5" /></div>
            </div>
            <div className="text-white text-xl font-bold mb-1">$45,230.50</div>
            <div className="flex items-center gap-1 text-sm text-green-400">
              <TrendingUp className="size-3" />
              +2.5%
            </div>
          </div>

          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-300 text-sm font-medium">Monthly Savings</div>
              <div className="text-green-400"><Target className="size-5" /></div>
            </div>
            <div className="text-white text-xl font-bold mb-1">$3,200.00</div>
            <div className="flex items-center gap-1 text-sm text-green-400">
              <TrendingUp className="size-3" />
              +12.3%
            </div>
          </div>

          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-300 text-sm font-medium">Investment Portfolio</div>
              <div className="text-green-400"><PieChart className="size-5" /></div>
            </div>
            <div className="text-white text-xl font-bold mb-1">$28,450.75</div>
            <div className="flex items-center gap-1 text-sm text-red-400">
              <TrendingUp className="size-3 rotate-180" />
              -1.2%
            </div>
          </div>

          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-300 text-sm font-medium">Monthly Income</div>
              <div className="text-green-400"><DollarSign className="size-5" /></div>
            </div>
            <div className="text-white text-xl font-bold mb-1">$8,500.00</div>
            <div className="flex items-center gap-1 text-sm text-green-400">
              <TrendingUp className="size-3" />
              +5.8%
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-white text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white text-sm font-medium">Salary Deposit</div>
                  <div className="text-gray-400 text-xs">Jan 15, 2025</div>
                </div>
                <div className="text-green-400 font-semibold">+$8,500</div>
              </div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white text-sm font-medium">Investment Purchase</div>
                  <div className="text-gray-400 text-xs">Jan 12, 2025</div>
                </div>
                <div className="text-red-400 font-semibold">-$2,000</div>
              </div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white text-sm font-medium">Dividend Payment</div>
                  <div className="text-gray-400 text-xs">Jan 10, 2025</div>
                </div>
                <div className="text-green-400 font-semibold">+$450</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-white text-lg font-semibold mb-4">Goals Progress</h3>
          <div className="space-y-4">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-medium">Emergency Fund</span>
                <span className="text-gray-400 text-sm">75%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="text-gray-400 text-xs mt-1">$7,500 / $10,000</div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-medium">Retirement Fund</span>
                <span className="text-gray-400 text-sm">45%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="text-gray-400 text-xs mt-1">$45,000 / $100,000</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex items-center justify-center p-8">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 bg-green-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-20 w-40 h-40 bg-green-700 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-500 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="size-9 text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  FinIQ.ai
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
                Your AI-powered financial mentor. Upload documents, get personalized advice, 
                and take control of your financial future.
              </p>
              
              {/* User Welcome */}
              {user && (
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                  <User className="size-4" />
                  <span>Welcome back, {user.user_metadata?.full_name || user.email}</span>
                </div>
              )}

              {/* File Count Badge */}
              {fileCount > 0 && (
                <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-600/30 rounded-full px-4 py-2 text-green-400">
                  <CheckCircle className="size-4" />
                  <span className="text-sm font-medium">{fileCount} files uploaded</span>
                </div>
              )}
            </div>

            {/* Main File Upload Section */}
            <div className="mb-16">
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 mb-8 shadow-2xl">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 rounded-full mb-6">
                    <Upload className="size-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Upload Your Financial Documents
                  </h2>
                  <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Get started by uploading your bank statements, investment portfolios, 
                    tax documents, or any financial files for AI-powered analysis and insights.
                  </p>
                </div>

                {/* File Upload Component */}
                <div className="flex justify-center" data-upload-trigger>
                  <FileUpload 
                    onUploadComplete={handleFileUploadComplete}
                    maxFiles={10}
                    maxSize={25 * 1024 * 1024} // 25MB
                  />
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <Shield className="size-4" />
                    Bank-level security
                  </span>
                  <span className="flex items-center gap-2">
                    <Files className="size-4" />
                    Multiple file formats
                  </span>
                  <span className="flex items-center gap-2">
                    <Target className="size-4" />
                    Instant AI analysis
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={startVideoConsultation}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold h-auto shadow-lg hover:shadow-green-600/25 transition-all duration-200"
                >
                  <Video className="size-5 mr-2" />
                  Start Video Consultation
                  <ArrowRight className="size-5 ml-2" />
                </Button>
                
                <Button
                  onClick={() => setShowFileManager(!showFileManager)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-8 py-4 rounded-full text-lg font-semibold h-auto transition-all duration-200"
                >
                  <Files className="size-5 mr-2" />
                  {fileCount > 0 ? `Manage ${fileCount} Files` : 'Manage Files'}
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:bg-gray-700 transition-all duration-300 hover:scale-105 cursor-pointer group shadow-lg"
                  onClick={feature.onClick}
                >
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:text-green-300 hover:bg-green-600/10 p-0 h-auto font-medium group-hover:translate-x-1 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      feature.onClick?.();
                    }}
                  >
                    {feature.action}
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="text-4xl font-bold text-green-400 mb-2">10K+</div>
                <div className="text-gray-400">Documents Analyzed</div>
              </div>
              <div className="text-center bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
                <div className="text-gray-400">User Satisfaction</div>
              </div>
              <div className="text-center bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
                <div className="text-gray-400">AI Availability</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-600/30 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Transform Your Financial Future?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who have already improved their financial health with FinIQ.ai. 
                Start with a simple file upload or jump into a video consultation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={startVideoConsultation}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-green-600/25 transition-all duration-200"
                >
                  <MessageCircle className="size-5 mr-2" />
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Conditional */}
      {showFileManager ? (
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <FileManager className="p-6" />
        </div>
      ) : (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="size-5 text-green-400" />
              <h2 className="text-white text-xl font-bold">Financial Jargon Guide</h2>
            </div>
            <p className="text-gray-400 text-sm">Understand financial terms used by your mentor</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search terms..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Sample terms */}
          <div className="space-y-3">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-1 rounded border text-green-400 bg-green-400/10 border-green-400/20">
                  <PieChart className="size-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">Asset Allocation</h3>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border text-green-400 bg-green-400/10 border-green-400/20">
                    investment
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">The strategy of dividing investments among different asset categories like stocks, bonds, and cash to optimize risk and return.</p>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-1 rounded border text-green-400 bg-green-400/10 border-green-400/20">
                  <TrendingUp className="size-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">Compound Interest</h3>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
                    general
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">Interest calculated on the initial principal and accumulated interest from previous periods. Einstein called it the 'eighth wonder of the world.'</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
            <h3 className="text-green-400 font-semibold text-sm mb-2">💡 Pro Tip</h3>
            <p className="text-gray-300 text-xs">
              Ask your AI mentor to explain any financial term you don't understand. They can provide personalized examples based on your situation!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};