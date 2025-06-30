import React from 'react';
import { JargonTooltip } from '@/components/JargonTooltip';

// Financial jargon terms with definitions
const jargonTerms = [
  {
    term: "Asset Allocation",
    definition: "The strategy of dividing investments among different asset categories like stocks, bonds, and cash to optimize risk and return.",
    variations: ["asset allocation", "asset allocations", "allocating assets"]
  },
  {
    term: "Compound Interest",
    definition: "Interest calculated on the initial principal and accumulated interest from previous periods.",
    variations: ["compound interest", "compounding", "compound growth"]
  },
  {
    term: "Diversification",
    definition: "The practice of spreading investments across various financial instruments to reduce risk exposure.",
    variations: ["diversification", "diversify", "diversified", "diversifying"]
  },
  {
    term: "Liquidity",
    definition: "How quickly and easily an asset can be converted into cash without significantly affecting its price.",
    variations: ["liquidity", "liquid", "liquidate", "liquidation"]
  },
  {
    term: "Bull Market",
    definition: "A financial market characterized by rising prices and investor optimism, typically lasting for months or years.",
    variations: ["bull market", "bull markets", "bullish"]
  },
  {
    term: "Bear Market",
    definition: "A market condition where prices fall 20% or more from recent highs, often accompanied by widespread pessimism.",
    variations: ["bear market", "bear markets", "bearish"]
  },
  {
    term: "APR",
    definition: "Annual Percentage Rate - the yearly cost of borrowing money, including interest and fees, expressed as a percentage.",
    variations: ["apr", "annual percentage rate"]
  },
  {
    term: "Credit Score",
    definition: "A numerical representation of creditworthiness, typically ranging from 300-850, used by lenders to assess risk.",
    variations: ["credit score", "credit scores", "credit rating"]
  },
  {
    term: "ROI",
    definition: "Return on Investment - a measure of investment efficiency calculated as (Gain - Cost) / Cost × 100%.",
    variations: ["roi", "return on investment", "returns"]
  },
  {
    term: "Premium",
    definition: "The amount paid for an insurance policy, typically on a monthly, quarterly, or annual basis.",
    variations: ["premium", "premiums", "insurance premium"]
  },
  {
    term: "Portfolio",
    definition: "A collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents.",
    variations: ["portfolio", "portfolios", "investment portfolio"]
  },
  {
    term: "Volatility",
    definition: "The degree of variation in a trading price series over time, usually measured by the standard deviation of returns.",
    variations: ["volatility", "volatile", "volatilities"]
  },
  {
    term: "Equity",
    definition: "The value of shares issued by a company, or the ownership interest in a property after debts are paid.",
    variations: ["equity", "equities", "stock equity"]
  },
  {
    term: "Dividend",
    definition: "A payment made by corporations to their shareholders, usually as a distribution of profits.",
    variations: ["dividend", "dividends", "dividend payment"]
  },
  {
    term: "Inflation",
    definition: "The rate at which the general level of prices for goods and services rises, eroding purchasing power.",
    variations: ["inflation", "inflationary", "inflate"]
  },
  {
    term: "Budget",
    definition: "A plan for how to spend and save money over a specific period, typically monthly or yearly.",
    variations: ["budget", "budgets", "budgeting"]
  },
  {
    term: "Emergency Fund",
    definition: "Money set aside to cover unexpected expenses or financial emergencies, typically 3-6 months of living expenses.",
    variations: ["emergency fund", "emergency funds", "emergency savings"]
  },
  {
    term: "401k",
    definition: "A retirement savings plan sponsored by an employer that allows employees to save and invest for retirement on a tax-deferred basis.",
    variations: ["401k", "401(k)", "four-oh-one-k"]
  },
  {
    term: "IRA",
    definition: "Individual Retirement Account - a tax-advantaged account designed to help you save for retirement.",
    variations: ["ira", "individual retirement account"]
  },
  {
    term: "Mutual Fund",
    definition: "An investment vehicle that pools money from many investors to purchase securities like stocks, bonds, or other assets.",
    variations: ["mutual fund", "mutual funds"]
  }
];

export const highlightJargon = (text: string): React.ReactNode => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Create a map of all variations to their main term
  const variationMap = new Map<string, { term: string; definition: string }>();
  
  jargonTerms.forEach(jargon => {
    jargon.variations.forEach(variation => {
      variationMap.set(variation.toLowerCase(), {
        term: jargon.term,
        definition: jargon.definition
      });
    });
  });

  // Create a regex pattern that matches all variations (case-insensitive)
  const allVariations = Array.from(variationMap.keys());
  const pattern = new RegExp(`\\b(${allVariations.join('|')})\\b`, 'gi');

  const parts = text.split(pattern);
  
  return parts.map((part, index) => {
    const lowerPart = part.toLowerCase();
    const jargonInfo = variationMap.get(lowerPart);
    
    if (jargonInfo) {
      return (
        <JargonTooltip
          key={index}
          term={jargonInfo.term}
          definition={jargonInfo.definition}
        >
          {part}
        </JargonTooltip>
      );
    }
    
    return part;
  });
};