import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { FileManager } from '@/components/FileManager';
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
  Wallet,
  Settings,
  FileText,
  History,
  Brain,
  ChevronRight
} from 'lucide-react';

type DashboardSection = 'uploaded-documents' | 'reports' | 'chat-history' | 'knowledge-base' | 'settings';

export const Homepage: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [activeSection, setActiveSection] = useState<DashboardSection>('uploaded-documents');
  const { user } = useAuth();
  const { files, getFileCount } = useUserFiles();

  const handleFileUploadComplete = (uploadedFiles: any[]) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    setActiveSection('uploaded-documents');
  };

  const startVideoConsultation = () => {
    setScreenState({ currentScreen: "conversation" });
  };

  const openSettings = () => {
    setScreenState({ currentScreen: "settings" });
  };

  const fileCount = getFileCount();

  const dashboardOptions = [
    {
      id: 'uploaded-documents' as DashboardSection,
      icon: <Files className="size-4" />,
      title: 'Uploaded Documents',
      count: fileCount
    },
    {
      id: 'reports' as DashboardSection,
      icon: <BarChart3 className="size-4" />,
      title: 'Reports',
      count: 3
    },
    {
      id: 'chat-history' as DashboardSection,
      icon: <History className="size-4" />,
      title: 'Chat History',
      count: 12
    },
    {
      id: 'knowledge-base' as DashboardSection,
      icon: <Brain className="size-4" />,
      title: 'Knowledge Base',
      count: null
    },
    {
      id: 'settings' as DashboardSection,
      icon: <Settings className="size-4" />,
      title: 'Settings',
      count: null
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'uploaded-documents':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Uploaded Documents</h2>
              <div className="flex gap-3">
                <FileUpload 
                  onUploadComplete={handleFileUploadComplete}
                  maxFiles={10}
                  maxSize={25 * 1024 * 1024}
                />
              </div>
            </div>
            <FileManager />
          </div>
        );
      
      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Financial Reports</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <TrendingUp className="size-5 text-green-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Portfolio Analysis</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">Comprehensive analysis of your investment portfolio performance.</p>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600">
                  View Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <PieChart className="size-5 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Budget Overview</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">Monthly budget breakdown with spending patterns.</p>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600">
                  View Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Target className="size-5 text-purple-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Goal Progress</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">Track your financial goals and get recommendations.</p>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600">
                  View Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'chat-history':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Chat History</h2>
            <div className="space-y-3">
              {[
                { date: 'Today, 2:30 PM', topic: 'Investment Portfolio Review', duration: '15 min' },
                { date: 'Yesterday, 4:15 PM', topic: 'Retirement Planning Discussion', duration: '22 min' },
                { date: 'Jan 15, 10:30 AM', topic: 'Tax Optimization Strategies', duration: '18 min' },
                { date: 'Jan 12, 3:45 PM', topic: 'Emergency Fund Planning', duration: '12 min' },
                { date: 'Jan 10, 11:20 AM', topic: 'Budget Analysis and Recommendations', duration: '25 min' }
              ].map((chat, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600/20 rounded-lg">
                        <MessageCircle className="size-4 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">{chat.topic}</h3>
                        <p className="text-gray-400 text-xs">{chat.date} • {chat.duration}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'knowledge-base':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Knowledge Base</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Financial Jargon Guide</h3>
                <p className="text-gray-400 text-sm mb-3">Understand complex financial terms with simple explanations.</p>
                <div className="space-y-2">
                  {['Asset Allocation', 'Compound Interest', 'Diversification', 'ROI'].map((term) => (
                    <div key={term} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                      <span className="text-white text-sm">{term}</span>
                      <ChevronRight className="size-3 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Educational Articles</h3>
                <p className="text-gray-400 text-sm mb-3">Learn about personal finance and investing strategies.</p>
                <div className="space-y-2">
                  {[
                    'Getting Started with Investing',
                    'Building an Emergency Fund',
                    'Understanding Credit Scores',
                    'Retirement Planning Basics'
                  ].map((article) => (
                    <div key={article} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                      <FileText className="size-3 text-green-400" />
                      <span className="text-white text-xs">{article}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Account Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Profile Information</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Security & Privacy</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Notification Preferences</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">AI Mentor Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 cursor-pointer" onClick={openSettings}>
                    <span className="text-gray-300 text-sm">Conversation Preferences</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Language Settings</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Data & Analytics</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

        {/* Start Conversation Button - Restored */}
        <div className="mt-8">
          <Button
            onClick={startVideoConsultation}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold h-12 rounded-lg shadow-lg hover:shadow-green-600/25 transition-all duration-200"
          >
            <Video className="size-5 mr-2" />
            Start Conversation with Persona
          </Button>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <Shield className="size-3" />
            <span>Secured with bank-level encryption</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Compact Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">FinIQ.ai Dashboard</h1>
                {user && (
                  <p className="text-gray-400 text-xs">Welcome back, {user.user_metadata?.full_name || user.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Dashboard Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex gap-2 overflow-x-auto">
            {dashboardOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveSection(option.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                  activeSection === option.id
                    ? 'bg-green-600/20 border-green-600/50 text-green-400'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                }`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.title}</span>
                {option.count !== null && (
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {renderSectionContent()}
        </div>
      </div>

      {/* Right Sidebar - Jargon Guide - Restored */}
      <JargonGuide />
    </div>
  );
};