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
  CheckCircle
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
      icon: <Upload className="size-8 text-primary" />,
      title: "Upload Financial Documents",
      description: "Securely upload bank statements, tax documents, investment portfolios, and more for AI analysis.",
      action: "Upload Files",
      onClick: () => document.querySelector('[data-upload-trigger]')?.click()
    },
    {
      icon: <Video className="size-8 text-green-400" />,
      title: "Video Consultation",
      description: "Get personalized financial advice through face-to-face video calls with your AI mentor.",
      action: "Start Video Call",
      onClick: startVideoConsultation
    },
    {
      icon: <BarChart3 className="size-8 text-blue-400" />,
      title: "Financial Analysis",
      description: "Receive detailed insights and recommendations based on your uploaded documents and profile.",
      action: "View Analysis",
      onClick: () => setShowFileManager(true)
    },
    {
      icon: <BookOpen className="size-8 text-purple-400" />,
      title: "Learning Resources",
      description: "Access our comprehensive financial jargon guide and educational materials.",
      action: "Learn More",
      onClick: () => setShowFileManager(false)
    }
  ];

  const fileCount = getFileCount();

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Sidebar - User Stats */}
      <UserStats />
      
      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black min-h-screen flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-[url('/images/dialogBlur.svg')] opacity-20" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent mb-6">
                FinIQ.ai
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto">
                Your AI-powered financial mentor. Upload documents, get personalized advice, 
                and take control of your financial future.
              </p>
              
              {/* User Welcome */}
              {user && (
                <div className="flex items-center justify-center gap-2 text-white/60 mb-4">
                  <User className="size-4" />
                  <span>Welcome back, {user.user_metadata?.full_name || user.email}</span>
                </div>
              )}

              {/* File Count Badge */}
              {fileCount > 0 && (
                <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 text-primary">
                  <CheckCircle className="size-4" />
                  <span className="text-sm font-medium">{fileCount} files uploaded</span>
                </div>
              )}
            </div>

            {/* Main File Upload Section */}
            <div className="mb-16">
              <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-3xl p-12 mb-8">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6">
                    <Upload className="size-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Upload Your Financial Documents
                  </h2>
                  <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
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

                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/60">
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
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold h-auto"
                >
                  <Video className="size-5 mr-2" />
                  Start Video Consultation
                  <ArrowRight className="size-5 ml-2" />
                </Button>
                
                <Button
                  onClick={() => setShowFileManager(!showFileManager)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-semibold h-auto"
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
                  className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={feature.onClick}
                >
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 p-0 h-auto font-medium"
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
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-white/70">Documents Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
                <div className="text-white/70">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
                <div className="text-white/70">AI Availability</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Transform Your Financial Future?
              </h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Join thousands of users who have already improved their financial health with FinIQ.ai. 
                Start with a simple file upload or jump into a video consultation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={startVideoConsultation}
                  className="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-full font-semibold"
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
        <FileManager className="w-80 bg-black/40 backdrop-blur-sm border-l border-white/10 overflow-y-auto" />
      ) : (
        <JargonGuide />
      )}
    </div>
  );
};