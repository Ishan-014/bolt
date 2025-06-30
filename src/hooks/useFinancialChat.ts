import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface UseFinancialChatReturn {
  generateResponse: (message: string) => Promise<string>;
  isGenerating: boolean;
}

// Jargon terms database
const jargonTerms = [
  {
    term: "Asset Allocation",
    definition: "The strategy of dividing investments among different asset categories like stocks, bonds, and cash to optimize risk and return."
  },
  {
    term: "Compound Interest",
    definition: "Interest calculated on the initial principal and accumulated interest from previous periods. Einstein called it the 'eighth wonder of the world.'"
  },
  {
    term: "Diversification",
    definition: "The practice of spreading investments across various financial instruments to reduce risk exposure."
  },
  {
    term: "Liquidity",
    definition: "How quickly and easily an asset can be converted into cash without significantly affecting its price."
  },
  {
    term: "Bull Market",
    definition: "A financial market characterized by rising prices and investor optimism, typically lasting for months or years."
  },
  {
    term: "Bear Market",
    definition: "A market condition where prices fall 20% or more from recent highs, often accompanied by widespread pessimism."
  },
  {
    term: "APR",
    definition: "Annual Percentage Rate - the yearly cost of borrowing money, including interest and fees, expressed as a percentage."
  },
  {
    term: "Credit Score",
    definition: "A numerical representation of creditworthiness, typically ranging from 300-850, used by lenders to assess risk."
  },
  {
    term: "ROI",
    definition: "Return on Investment - a measure of investment efficiency calculated as (Gain - Cost) / Cost × 100%."
  },
  {
    term: "Premium",
    definition: "The amount paid for an insurance policy, typically on a monthly, quarterly, or annual basis."
  },
  {
    term: "Portfolio",
    definition: "A collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents."
  },
  {
    term: "Volatility",
    definition: "The degree of variation in a trading price series over time, usually measured by the standard deviation of returns."
  },
  {
    term: "Equity",
    definition: "The value of shares issued by a company, or the ownership interest in a property after debts are paid."
  },
  {
    term: "Dividend",
    definition: "A payment made by corporations to their shareholders, usually as a distribution of profits."
  },
  {
    term: "Inflation",
    definition: "The rate at which the general level of prices for goods and services rises, eroding purchasing power."
  }
];

export const useFinancialChat = (): UseFinancialChatReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const fetchUserDocuments = async () => {
    if (!user) return [];

    try {
      const { data: files, error } = await supabase
        .from('user_files')
        .select('file_name, description, category, file_type')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false })
        .limit(10); // Limit to recent 10 files to avoid token limits

      if (error) {
        console.error('Error fetching user documents:', error);
        return [];
      }

      return files || [];
    } catch (error) {
      console.error('Error in fetchUserDocuments:', error);
      return [];
    }
  };

  const fetchUserFinancialProfile = async () => {
    if (!user) return null;

    try {
      const { data: profile, error } = await supabase
        .from('financial_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching financial profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in fetchUserFinancialProfile:', error);
      return null;
    }
  };

  const buildContextualPrompt = async (userMessage: string) => {
    // Fetch user's documents and financial profile
    const [userDocuments, financialProfile] = await Promise.all([
      fetchUserDocuments(),
      fetchUserFinancialProfile()
    ]);

    // Build comprehensive context
    let contextualPrompt = `You are FinIQ.ai, a professional AI financial mentor and advisor with expertise in investment planning, budgeting, tax optimization, retirement planning, and general financial literacy.

Your role is to:
- Provide personalized financial advice and insights
- Explain complex financial concepts in simple, understandable terms
- Help users make informed financial decisions
- Use real-world examples and be encouraging while maintaining professional standards
- Focus on practical, actionable advice
- Be conversational but authoritative

Guidelines:
- Keep responses concise but comprehensive (2-4 paragraphs max)
- Use bullet points for lists or steps
- Ask follow-up questions when you need more context
- Provide specific, actionable recommendations
- Always consider risk management and diversification
- Mention when users should consult with human financial advisors for complex situations

AVAILABLE FINANCIAL JARGON DEFINITIONS:
${jargonTerms.map(term => `- ${term.term}: ${term.definition}`).join('\n')}

When users ask about financial terms, reference these definitions and explain them in context.`;

    // Add user's financial profile context if available
    if (financialProfile) {
      contextualPrompt += `\n\nUSER'S FINANCIAL PROFILE:`;
      if (financialProfile.monthly_income) {
        contextualPrompt += `\n- Monthly Income: $${financialProfile.monthly_income.toLocaleString()}`;
      }
      if (financialProfile.monthly_expenses) {
        contextualPrompt += `\n- Monthly Expenses: $${financialProfile.monthly_expenses.toLocaleString()}`;
      }
      if (financialProfile.savings_goal) {
        contextualPrompt += `\n- Savings Goal: $${financialProfile.savings_goal.toLocaleString()}`;
      }
      if (financialProfile.risk_tolerance) {
        contextualPrompt += `\n- Risk Tolerance: ${financialProfile.risk_tolerance}`;
      }
      if (financialProfile.investment_experience) {
        contextualPrompt += `\n- Investment Experience: ${financialProfile.investment_experience}`;
      }
      if (financialProfile.financial_goals && financialProfile.financial_goals.length > 0) {
        contextualPrompt += `\n- Financial Goals: ${financialProfile.financial_goals.join(', ')}`;
      }
      contextualPrompt += `\n\nUse this profile information to provide personalized advice.`;
    }

    // Add user's uploaded documents context
    if (userDocuments.length > 0) {
      contextualPrompt += `\n\nUSER'S UPLOADED DOCUMENTS:`;
      userDocuments.forEach((doc, index) => {
        contextualPrompt += `\n${index + 1}. ${doc.file_name} (${doc.category})`;
        if (doc.description) {
          contextualPrompt += ` - ${doc.description}`;
        }
      });
      contextualPrompt += `\n\nThe user has uploaded these financial documents. Reference them when relevant and suggest specific analysis or actions based on the document types they've shared.`;
    }

    // Add specific document-related suggestions
    if (userDocuments.length > 0) {
      const documentTypes = [...new Set(userDocuments.map(doc => doc.category))];
      contextualPrompt += `\n\nDOCUMENT-SPECIFIC GUIDANCE:`;
      
      if (documentTypes.includes('document')) {
        contextualPrompt += `\n- For financial documents: Suggest reviewing for tax optimization, expense tracking, or investment opportunities`;
      }
      if (documentTypes.includes('spreadsheet')) {
        contextualPrompt += `\n- For spreadsheets: Recommend budget analysis, cash flow review, or portfolio rebalancing`;
      }
      if (documentTypes.includes('image')) {
        contextualPrompt += `\n- For images: May contain receipts, statements, or charts that could inform financial planning`;
      }
    }

    contextualPrompt += `\n\nUser question: ${userMessage}`;

    return contextualPrompt;
  };

  const generateResponse = async (message: string): Promise<string> => {
    setIsGenerating(true);
    
    try {
      // Build contextual prompt with user data
      const contextualPrompt = await buildContextualPrompt(message);

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAbRyVhI0m3qMKQ_uLFk46S361B6Pz5EHA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: contextualPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid response format from Google Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      console.error('Error generating financial response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API')) {
          throw new Error('Unable to connect to AI service. Please check your internet connection and try again.');
        }
        throw error;
      }
      
      throw new Error('Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateResponse,
    isGenerating
  };
};