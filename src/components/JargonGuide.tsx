import React, { useState } from 'react';
import { Search, BookOpen, TrendingUp, TrendingDown, DollarSign, Shield, Building, PieChart } from 'lucide-react';

interface JargonTerm {
  term: string;
  definition: string;
  category: 'investment' | 'banking' | 'insurance' | 'general';
  icon: React.ReactNode;
}

const jargonTerms: JargonTerm[] = [
  {
    term: "Asset Allocation",
    definition: "The strategy of dividing investments among different asset categories like stocks, bonds, and cash to optimize risk and return.",
    category: "investment",
    icon: <PieChart className="size-4" />
  },
  {
    term: "Compound Interest",
    definition: "Interest calculated on the initial principal and accumulated interest from previous periods. Einstein called it the 'eighth wonder of the world.'",
    category: "general",
    icon: <TrendingUp className="size-4" />
  },
  {
    term: "Diversification",
    definition: "The practice of spreading investments across various financial instruments to reduce risk exposure.",
    category: "investment",
    icon: <Shield className="size-4" />
  },
  {
    term: "Liquidity",
    definition: "How quickly and easily an asset can be converted into cash without significantly affecting its price.",
    category: "general",
    icon: <DollarSign className="size-4" />
  },
  {
    term: "Bull Market",
    definition: "A financial market characterized by rising prices and investor optimism, typically lasting for months or years.",
    category: "investment",
    icon: <TrendingUp className="size-4" />
  },
  {
    term: "Bear Market",
    definition: "A market condition where prices fall 20% or more from recent highs, often accompanied by widespread pessimism.",
    category: "investment",
    icon: <TrendingDown className="size-4" />
  },
  {
    term: "APR",
    definition: "Annual Percentage Rate - the yearly cost of borrowing money, including interest and fees, expressed as a percentage.",
    category: "banking",
    icon: <Building className="size-4" />
  },
  {
    term: "Credit Score",
    definition: "A numerical representation of creditworthiness, typically ranging from 300-850, used by lenders to assess risk.",
    category: "banking",
    icon: <Shield className="size-4" />
  },
  {
    term: "ROI",
    definition: "Return on Investment - a measure of investment efficiency calculated as (Gain - Cost) / Cost × 100%.",
    category: "investment",
    icon: <TrendingUp className="size-4" />
  },
  {
    term: "Premium",
    definition: "The amount paid for an insurance policy, typically on a monthly, quarterly, or annual basis.",
    category: "insurance",
    icon: <Shield className="size-4" />
  },
  {
    term: "Portfolio",
    definition: "A collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents.",
    category: "investment",
    icon: <PieChart className="size-4" />
  },
  {
    term: "Volatility",
    definition: "The degree of variation in a trading price series over time, usually measured by the standard deviation of returns.",
    category: "investment",
    icon: <TrendingUp className="size-4" />
  },
  {
    term: "Equity",
    definition: "The value of shares issued by a company, or the ownership interest in a property after debts are paid.",
    category: "general",
    icon: <Building className="size-4" />
  },
  {
    term: "Dividend",
    definition: "A payment made by corporations to their shareholders, usually as a distribution of profits.",
    category: "investment",
    icon: <DollarSign className="size-4" />
  },
  {
    term: "Inflation",
    definition: "The rate at which the general level of prices for goods and services rises, eroding purchasing power.",
    category: "general",
    icon: <TrendingUp className="size-4" />
  }
];

const categoryColors = {
  investment: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  banking: 'text-green-400 bg-green-400/10 border-green-400/20',
  insurance: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  general: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
};

export const JargonGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTerms = jargonTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-80 bg-black/40 backdrop-blur-sm border-l border-white/10 p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-white text-xl font-bold">Financial Jargon Guide</h2>
        </div>
        <p className="text-white/60 text-sm">Understand financial terms used by your mentor</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 size-4" />
        <input
          type="text"
          placeholder="Search terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('investment')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'investment' 
                ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30' 
                : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
            }`}
          >
            Investment
          </button>
          <button
            onClick={() => setSelectedCategory('banking')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'banking' 
                ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
            }`}
          >
            Banking
          </button>
          <button
            onClick={() => setSelectedCategory('insurance')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'insurance' 
                ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30' 
                : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
            }`}
          >
            Insurance
          </button>
        </div>
      </div>

      {/* Terms List */}
      <div className="space-y-3">
        {filteredTerms.map((term, index) => (
          <div key={index} className="bg-black/20 border border-white/10 rounded-lg p-4 hover:bg-black/30 transition-all duration-200">
            <div className="flex items-start gap-3 mb-2">
              <div className={`p-1 rounded border ${categoryColors[term.category]}`}>
                {term.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">{term.term}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[term.category]}`}>
                  {term.category}
                </span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{term.definition}</p>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="size-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No terms found matching your search.</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <h3 className="text-primary font-semibold text-sm mb-2">💡 Pro Tip</h3>
        <p className="text-white/70 text-xs">
          Ask your AI mentor to explain any financial term you don't understand. They can provide personalized examples based on your situation!
        </p>
      </div>
    </div>
  );
};