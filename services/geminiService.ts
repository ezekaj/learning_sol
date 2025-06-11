
import { GoogleGenAI, Chat, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";

// IMPORTANT: API_KEY is expected to be set in the environment.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

// Wrap initialization in try-catch to prevent app crashes
try {
  if (API_KEY && API_KEY !== 'undefined' && API_KEY.trim() !== '') {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log("Gemini AI initialized successfully");
  } else {
    console.warn("Gemini API Key not found or invalid. AI features will be limited or unavailable.");
    initializationError = "API key not configured";
  }
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
  initializationError = `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  ai = null;
}

let chat: Chat | null = null;

const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
const IMAGE_MODEL_NAME = 'imagen-3.0-generate-002';

const CHAT_SYSTEM_INSTRUCTION_BASE = `You are an expert AI assistant specializing in Solidity, smart contract development, Ethereum, and general blockchain technologies. 
Your goal is to help users learn and understand these complex topics. 
Provide clear, concise, and accurate explanations. When asked for code, provide functional Solidity examples using recent compiler versions (e.g., ^0.8.20).
Be patient and break down complex ideas into smaller, understandable parts.
When formatting code, use markdown code blocks. For Solidity, specify 'solidity'.
Example:
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 public storedData;

    function set(uint256 x) public {
        storedData = x;
    }

    function get() public view returns (uint256) {
        return storedData;
    }
}
\`\`\`
`;

// Safety settings to block harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


export const initializeChatForModule = async (moduleTitle: string, geminiPromptSeed?: string): Promise<string | null> => {
  if (!ai) {
    return initializationError || "Gemini AI Service not initialized. API Key may be missing.";
  }

  let systemInstruction = CHAT_SYSTEM_INSTRUCTION_BASE;
  if (moduleTitle) {
    systemInstruction += `\n\nThe user is currently focusing on the learning module: "${moduleTitle}". Please tailor your explanations and examples to this topic where relevant.`;
  }
  if (geminiPromptSeed) {
     systemInstruction += `\n\nConsider this initial prompt related to the module: "${geminiPromptSeed}"`;
  }
  
  try {
    chat = ai.chats.create({
      model: TEXT_MODEL_NAME,
      config: { 
        systemInstruction: systemInstruction,
        safetySettings: safetySettings, 
      },
      history: [], // Start with an empty history; App.tsx handles the initial greeting message.
    });
    return null; // No error
  } catch (error) {
    console.error("Error initializing Gemini chat:", error);
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('permission denied')) {
            return "Error: The Gemini API key is invalid or lacks permissions. Please check your configuration.";
        }
        return `Error initializing AI assistant: ${error.message}`;
    }
    return "An unexpected error occurred while initializing the AI assistant.";
  }
};

export const sendMessageToGeminiChat = async (message: string): Promise<string> => {
  if (!ai) {
    return "Gemini AI Service not initialized. API Key may be missing.";
  }
  if (!chat) {
    // Attempt to re-initialize if chat is null, e.g., after an error or if not called before.
    const initError = await initializeChatForModule("General Blockchain Topics"); 
    if (initError || !chat) { // Check !chat again in case initError was null but chat still failed to set.
        return initError || "Failed to initialize chat session. Please try selecting a module again.";
    }
  }
  
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message: message });
    return response.text || "AI response was empty";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('permission denied')) {
            return "Error: The Gemini API key is invalid or lacks permissions. Please check your configuration.";
        }
        // Handle cases where the model might be blocked due to safety or other reasons.
        // The specific error message or structure might vary based on the SDK version and error type.
        if (error.message.toLowerCase().includes('blocked') || error.message.toLowerCase().includes('safety')) {
             return "Error: The AI's response was blocked. This might be due to safety filters or the nature of the request. Please try rephrasing or a different question.";
        }
        return `Error communicating with AI: ${error.message}. Please try again.`;
    }
    return "An unexpected error occurred while communicating with the AI.";
  }
};

export const generateDiagramForConcept = async (prompt: string): Promise<{ base64Image?: string; error?: string }> => {
  if (!ai) {
    return { error: "Gemini AI Service not initialized. API Key may be missing." };
  }
  try {
    const response = await ai.models.generateImages({
        model: IMAGE_MODEL_NAME,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
        // safetySettings are not directly part of generateImages config based on current guidelines for this specific model type.
        // However, the Gemini API for image generation inherently applies safety filters.
        // We'll rely on the API's error handling or response structure to indicate safety blocks.
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0]?.image?.imageBytes) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return { base64Image: `data:image/png;base64,${base64ImageBytes}` };
    } else {
         // Check for explicit blocking in the response structure if available
        // The exact structure for indicating a safety block might vary.
        // For instance, if `generatedImages` is empty but there's a reason field, or if an error is thrown.
        // This is a speculative check based on common API patterns.
        if (response.generatedImages && response.generatedImages.length > 0 && (response.generatedImages[0] as any).finishReason === 'SAFETY') {
            return { error: "The image generation request was blocked by safety filters. Please rephrase your prompt." };
        }
        if ((response as any).error && (response as any).error.message && (response as any).error.message.toLowerCase().includes('safety')) {
           return { error: "The image generation request was blocked by safety filters. Please rephrase your prompt." };
        }
        return { error: "AI did not return an image. This could be due to safety filters, prompt complexity, or an issue with the image generation service. Please try a different prompt."};
    }
  } catch (error) {
    console.error("Error generating diagram with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('permission denied')) {
            return { error: "Error: The Gemini API key is invalid or lacks permissions for image generation."};
        }
         if (error.message.toLowerCase().includes('prompt') && (error.message.toLowerCase().includes('blocked') || error.message.toLowerCase().includes('safety'))) {
            return { error: "The prompt was blocked by safety filters. Please rephrase your request." };
        }
        // Check for specific error codes or messages related to safety if the SDK provides them
        if ((error as any).code === 'BLOCKED_BY_SAFETY_FILTER' || (error as any).status === 'BLOCKED_PROMPT') {
           return { error: "The image generation request was blocked by safety filters. Please rephrase your prompt." };
        }
        return { error: `Error generating diagram: ${error.message}` };
    }
    return { error: "An unexpected error occurred while generating the diagram." };
  }
};


// This function is kept as an example of direct content generation if needed,
// but the chat interface is primary for this app.
export const getTopicExplanation = async (topic: string, details: string): Promise<string> => {
  if (!ai) {
    return "Gemini AI Service not initialized. API Key may be missing.";
  }
  try {
    const prompt = `Explain the following blockchain/Solidity topic: "${topic}". Specific details or question: "${details}". Provide a comprehensive yet easy-to-understand explanation formatted with markdown.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: prompt,
        config: {
            systemInstruction: CHAT_SYSTEM_INSTRUCTION_BASE,
            safetySettings: safetySettings,
            // Add other configs like temperature if needed, but keep it simple for now
        }
    });

    // Check if the response was blocked
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason === 'SAFETY') {
        return "Error: The AI's response was blocked due to safety settings. Please try rephrasing your query.";
    }
    if (!response.text && response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason !== 'STOP') {
        return `Error: AI could not generate a response. Reason: ${response.candidates[0].finishReason}. Please try again.`;
    }
    
    return response.text || "AI response was empty";
  } catch (error) {
    console.error("Error getting topic explanation from Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('permission denied')) {
            return "Error: The Gemini API key is invalid or lacks permissions. Please check your configuration.";
        }
        if (error.message.toLowerCase().includes('blocked') || error.message.toLowerCase().includes('safety')) {
             return "Error: The request was blocked. This might be due to safety filters or the nature of the request. Please try rephrasing.";
        }
        return `Error fetching explanation: ${error.message}`;
    }
    return "An unexpected error occurred while fetching explanation.";
  }
};
