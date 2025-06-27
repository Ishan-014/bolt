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
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-hidden">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="size-5 text-green-400" />
          <h2 className="text-white text-xl font-bold">Jargon Guide</h2>
        </div>
        <p className="text-gray-400 text-sm">Understand financial terms used by your mentor</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
        <input
          type="text"
          placeholder="Search terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('investment')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'investment' 
                ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30' 
                : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Investment
          </button>
          <button
            onClick={() => setSelectedCategory('banking')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'banking' 
                ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Banking
          </button>
          <button
            onClick={() => setSelectedCategory('insurance')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'insurance' 
                ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30' 
                : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Insurance
          </button>
        </div>
      </div>

      {/* Terms List with Hidden Scrollbar */}
      <div className="jargon-scroll-container overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
        <div className="space-y-3">
          {filteredTerms.map((term, index) => (
            <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-all duration-200">
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
              <p className="text-gray-300 text-sm leading-relaxed">{term.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="size-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No terms found matching your search.</p>
        </div>
      )}
    </div>
  );
};