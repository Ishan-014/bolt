import { useState } from 'react';

interface UseFinancialChatReturn {
  generateResponse: (message: string) => Promise<string>;
  isGenerating: boolean;
}

export const useFinancialChat = (): UseFinancialChatReturn => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateResponse = async (message: string): Promise<string> => {
    setIsGenerating(true);
    
    try {
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
                  text: `You are FinIQ.ai, a professional AI financial mentor and advisor with expertise in investment planning, budgeting, tax optimization, retirement planning, and general financial literacy. 

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

Remember: You're helping people improve their financial health and achieve their goals.

User question: ${message}`
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