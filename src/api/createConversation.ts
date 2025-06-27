import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  // Get settings from Jotai store
  const settings = getDefaultStore().get(settingsAtom);
  
  // Add debug logs
  console.log('Creating conversation with settings:', settings);
  console.log('Greeting value:', settings.greeting);
  console.log('Context value:', settings.context);
  
  // Build the context string for financial mentoring
  let contextString = "You are a professional financial mentor and advisor with expertise in investment planning, budgeting, tax optimization, retirement planning, and general financial literacy. ";
  
  if (settings.name) {
    contextString += `You are talking with ${settings.name}. `;
  }
  
  contextString += "Provide personalized financial advice, explain complex financial concepts in simple terms, and help users make informed financial decisions. ";
  contextString += "Use real-world examples and be encouraging while maintaining professional standards. ";
  
  if (settings.context) {
    contextString += `Additional context: ${settings.context}`;
  }
  
  const payload = {
    persona_id: settings.persona || "p53279eb2464",
    replica_id: settings.replica || "rb17cf590e15",
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : "Hello! I'm your AI financial mentor. I'm here to help you navigate your financial journey, whether it's investment planning, budgeting, retirement strategies, or understanding complex financial concepts. What financial goals would you like to discuss today?",
    conversational_context: contextString
  };
  
  console.log('Sending payload to API:', payload);
  
  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token ?? "",
    },
    body: JSON.stringify(payload),
  });

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};