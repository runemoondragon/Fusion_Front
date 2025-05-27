import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import { Element } from 'hast';
// import type { CodeProps } from 'react-markdown/lib/ast-to-react'; // Removed this due to import error

// Register languages
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);

// Define types for better type checking
interface Message {
  id?: number | string; // Allow string for temporary IDs
  role: 'user' | 'assistant';
  content: string | any; // Allow 'any' for initial state, but expect string for rendering
  provider?: string;
  isError?: boolean; // Add optional isError for styling error messages
  isLoading?: boolean; // Added for temporary loading state
  // Consider adding timestamp if needed for local display sorting before saving
}

// Copied from ChatLayout - consider moving to a shared types file (e.g., types/chat.ts)
interface ChatSession {
  id: number;
  user_id: number;
  title: string | null;
  ui_selected_provider: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

interface AiResponseType {
  output?: string;
  text?: string;
  tokens?: number;
  fallback_reason?: string;
}

interface ApiResponseData {
  prompt: string;
  response: AiResponseType;
  provider: string;
  model: string | null;
  tokens?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    max_tokens?: number;
  };
  tool_name?: string;
  file_downloads?: any[];
}

interface AiModel {
  id: string;         // Will store the id_string from the DB (e.g., "openai/gpt-4.1")
  name: string;       // Display name from DB (e.g., "OpenAI: GPT-4.1")
  provider: string;   // General provider name from DB (e.g., "OpenAI", "Google", "Anthropic")
  is_active: boolean;
}

interface ChatWindowProps {
  activeChatId: number | null;
  onChatCreated: (newChat: ChatSession) => void; // Callback to inform layout of new chat
  // Add lifted state props from ChatLayout
  selectedModel: string; // This is the ID like "neuroswitch", "openai", "gpt-4o"
  allModels: AiModel[];   // List of all available AiModel objects
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  neuroStatus: 'green' | 'orange' | '';
  setNeuroStatus: React.Dispatch<React.SetStateAction<'green' | 'orange' | ''>>;
  // We might also need onMessageSaved or similar to trigger chat list refresh in layout
}

// Define the structure for a single message from GET /api/chats/:chatId response
interface FetchedMessage extends Message { // Extends existing Message interface
    id: number;
    chat_id: number;
    timestamp: string;
    // provider and model_used are already in Message if it came from an assistant
}

// Define the structure for the response of GET /api/chats/:chatId
interface FetchedChatSession extends ChatSession {
    messages: FetchedMessage[];
}

// Define a specific type for the props of the custom code component
interface CustomCodeProps {
  node?: Element; // Made node optional to align with TS error
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any; // Allow other props
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  activeChatId, 
  onChatCreated,
  selectedModel, // Destructure new props
  allModels,     // Destructure new props
  setSelectedModel, 
  neuroStatus, 
  setNeuroStatus
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [tokensUsed, setTokensUsed] = useState(0);
  const maxTokens = 200000;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [isLoadingMessages, setIsLoadingMessages] = useState(false); // New state for loading existing chat

  // Effect to handle activeChatId changes (new chat, loading existing chat)
  useEffect(() => {
    const loadChatMessages = async (chatId: number) => {
      console.log(`ChatWindow: Attempting to load messages for chat ID: ${chatId}`);
      setIsLoadingMessages(true);
      setMessages([]); // Clear existing messages first
      setInput(''); // Clear input field as well
      // setTokensUsed(0); // Reset token usage for the loaded session

      const token = localStorage.getItem('auth_token');
      if (!token) {
        // This case should ideally be handled globally, but good to have a local check
        // setMessages([{ role: 'assistant', content: 'Authentication error: Cannot load chat.' }]);
        console.error('ChatWindow: No auth token found, cannot load chat.');
        setIsLoadingMessages(false);
        if (textareaRef.current) textareaRef.current.focus(); // Focus even on error/return
        return;
      }

      try {
        const response = await axios.get<FetchedChatSession>(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const chatData = response.data;
        
        // Map FetchedMessage to Message if necessary, though structure might be compatible
        // For now, assuming FetchedMessage is compatible with local Message type
        setMessages(chatData.messages);
        // When loading a chat, update the selectedModel in the parent (ChatLayout)
        if (chatData.ui_selected_provider) {
          setSelectedModel(chatData.ui_selected_provider); 
        } else {
          // setSelectedModel(getDefaultModel()); // getDefaultModel is in ChatLayout
          // Need a way to get default if not set, or ChatLayout handles this
        }
        console.log(`ChatWindow: Successfully loaded ${chatData.messages.length} messages for chat ID: ${chatId}`);

      } catch (err: any) {
        console.error('ChatWindow: Error fetching chat messages:', err);
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error loading chat: ${err.response?.data?.error || err.message}` }]);
      }
      setIsLoadingMessages(false);
      if (textareaRef.current) textareaRef.current.focus(); // Focus after loading attempt
    };

    if (activeChatId === null) {
      // New chat mode: reset state
      setMessages([]);
      setInput('');
      // setSelectedModel(getDefaultModel()); // Handled by ChatLayout or on new chat creation
      setImageData(null);
      setImagePreview(null);
      setCurrentMode(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setNeuroStatus('');
      setTokensUsed(0);
      setLoading(false); 
      setIsLoadingMessages(false); // Ensure this is also false
      console.log('ChatWindow: New chat mode activated, state reset.');
      if (textareaRef.current) textareaRef.current.focus(); // Focus for new chat
    } else {
      // Existing chat mode: fetch messages for activeChatId
      loadChatMessages(activeChatId);
    }
  }, [activeChatId, setSelectedModel, setNeuroStatus]); // Added dependencies from lifted state

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = '40px';
      ta.style.height = `${Math.max(40, ta.scrollHeight)}px`;
    }
  }, [input]);

  const handleSend = async (e?: FormEvent<HTMLFormElement>) => {
    console.log('[ChatWindow handleSend] Current activeChatId:', activeChatId, 'Current local messages count:', messages.length); // DEBUG LOG
    if (e) e.preventDefault();
    if (!input.trim() && !imageData) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Authentication error: Please log in.', isError: true },
      ]);
      return;
    }

    // Capture current input and image data *before* clearing for the payload
    const userMessageContent = input.trim();
    const imageToSend = imageData;
    const modeToSend = currentMode;
    const uiSelectedProviderForSession = selectedModel;

    const userMessage: Message = { role: 'user', content: userMessageContent };

    // Add user message to UI
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Prepare and add temporary assistant loading message
    const tempLoadingMessageId = `assistant-loading-${Date.now()}`;
    let tempProviderForIcon = selectedModel;
    if (selectedModel && selectedModel.includes('/')) {
        const parts = selectedModel.split('/');
        if (parts.length > 0) {
            tempProviderForIcon = parts[0].toLowerCase(); // e.g., "openai" from "openai/gpt-4.1"
        }
    } else if (selectedModel) {
        tempProviderForIcon = selectedModel.toLowerCase();
    }

    const tempAssistantMessage: Message = {
        id: tempLoadingMessageId,
        role: 'assistant',
        content: 'Thinking...', // Placeholder content
        provider: tempProviderForIcon, // Use parsed provider for icon
        isLoading: true,
    };
    setMessages((prevMessages) => [...prevMessages, tempAssistantMessage]);

    // Now clear input fields and related state
    setInput('');
    setImageData(null);
    setImagePreview(null);
    setCurrentMode(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setLoading(true); // This now primarily controls the input field's disabled state and general loading perception
    setNeuroStatus('');

    let assistantResponseText = 'Error contacting AI.';
    let actualProvider = 'Unknown';
    let actualModelUsed = 'Unknown';
    let responseTokensData: ApiResponseData['tokens'] | undefined = undefined;
    let messageIsError = false;
    let toolNameUsed: string | undefined = undefined;

    try {
      // 1. Construct payload for /api/chat (Fusion Backend)
      let apiPayload: {
        prompt: string;
        provider?: string; // For "neuroswitch", "openai", "claude", "gemini"
        model?: string;    // For specific model IDs like "gpt-4o", or "NeuroSwitch" if we revert
        image?: string | null;
        mode?: string | null;
      } = {
        prompt: userMessageContent,
        image: imageToSend,
        mode: modeToSend,
      };

      const knownProviderLevelSelections = ['neuroswitch', 'openai', 'claude', 'gemini'];

      if (knownProviderLevelSelections.includes(selectedModel)) {
        // Case: NeuroSwitch selected OR Provider default selected
        // (e.g., selectedModel is "neuroswitch" or "openai")
        apiPayload.provider = selectedModel;
        // No 'model' field sent to /api/chat for these top-level provider/NeuroSwitch selections
      } else {
        // Case: Provider + specific model selected
        // selectedModel is now an id_string like "openai/gpt-4.1" or "google/gemini-1.5-flash"
        const parts = selectedModel.split('/');
        if (parts.length === 2) {
          let providerNameFromIdString = parts[0].toLowerCase(); // e.g., "openai", "anthropic", "google"
          if (providerNameFromIdString === 'anthropic') {
            apiPayload.provider = 'claude';
          } else if (providerNameFromIdString === 'google') {
            apiPayload.provider = 'gemini';
          } else {
            // Directly use if it's already 'openai' or any other future provider that matches this convention
            apiPayload.provider = providerNameFromIdString; 
          }
          apiPayload.model = parts[1];    // e.g., "gpt-4.1", "claude-3.5-sonnet"
        } else {
          // Fallback if id_string format is unexpected
          console.warn(`ChatWindow: Could not parse provider/model from selectedModel id_string '${selectedModel}'. Sending it as provider. This might lead to unexpected behavior.`);
          apiPayload.provider = selectedModel; // Attempt to send the whole string as a provider
        }
      }
      
      console.log('[ChatWindow] Payload to /api/chat (Fusion Backend):', JSON.stringify(apiPayload, null, 2));


      // 2. Get response from AI Service (/api/chat)
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}` // Keep existing auth header
      };

      if (activeChatId !== null) {
        headers['X-Chat-ID'] = activeChatId.toString();
      }
      // If activeChatId is null, the X-Chat-ID header will be omitted.
      // The backend can use the absence of this header to identify a new chat.

      const aiServiceRes = await axios.post<ApiResponseData>(
        '/api/chat',
        apiPayload, // Use the newly constructed payload
        {
          headers: headers // Pass the constructed headers object
        }
      );

      const aiServiceData = aiServiceRes.data;
      assistantResponseText = aiServiceData.response.text || aiServiceData.response.output || '[No response text]';
      actualProvider = aiServiceData.provider; // Use the new 'provider' field
      actualModelUsed = aiServiceData.model || aiServiceData.provider; // Use specific model, fallback to provider for display if model is null
      responseTokensData = aiServiceData.tokens;
      toolNameUsed = aiServiceData.tool_name;

      if (toolNameUsed) {
        assistantResponseText = `${assistantResponseText}\n\n🔩 Used tool: ${toolNameUsed}`;
      }

      if (responseTokensData && typeof responseTokensData.total_tokens === 'number') {
        setTokensUsed(prev => prev + responseTokensData!.total_tokens!); // Accumulate tokens if it makes sense, or use session tokens
      }
      if (selectedModel === 'neuroswitch') {
        setNeuroStatus(aiServiceData.response.fallback_reason ? 'orange' : 'green');
      }

      // 2. Save chat turn to history (/api/chats)
      try {
        const titleSuggestion = activeChatId === null ? userMessageContent.substring(0, 75) : null;
        
        const saveHistoryPayload = {
          chatId: activeChatId, // This will be null for a new chat
          title_suggestion: titleSuggestion,
          ui_selected_provider_for_session: uiSelectedProviderForSession,
          user_message_content: userMessageContent,
          assistant_message_content: assistantResponseText,
          assistant_message_actual_provider: actualProvider,
          assistant_message_actual_model_used: actualModelUsed 
        };

        console.log('Saving to chat history:', saveHistoryPayload);
        const historyRes = await axios.post<{ chat: ChatSession, message: string }>('/api/chats', saveHistoryPayload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (activeChatId === null && historyRes.data.chat) {
            console.log('New chat created on backend:', historyRes.data.chat);
            onChatCreated(historyRes.data.chat); // Notify layout about the new chat
        } else {
            // If chat existed, maybe update its last_message_at time in ChatLayout or refresh list
            console.log('Message added to existing chat:', historyRes.data.chat?.id);
        }

      } catch (historyError: any) {
        console.error("Error saving chat history:", historyError);
        // Decide how to handle this, maybe a small non-intrusive UI indicator
        // For now, the chat turn is in ChatWindow state, but not persisted if this fails.
      }

    } catch (err: any) {
      console.error("Error sending message to AI service:", err);
      messageIsError = true; // Mark this as an error message

      if (err && err.isAxiosError && err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 402) {
          assistantResponseText = err.response.data.message || 'You do not have enough credits to complete this action. Please top up to continue.';
        } else {
          // Other server errors (500, 400, 401, etc.)
          assistantResponseText = err.response.data.details || err.response.data.error || 'An error occurred with the AI service.';
        }
      } else if (err && err.isAxiosError && err.request) {
        // The request was made but no response was received
        assistantResponseText = 'The AI service is not responding. Please check your connection or try again later.';
      } else {
        // Something happened in setting up the request that triggered an Error or a non-Axios error
        assistantResponseText = 'An unexpected error occurred while sending your message.';
        // For non-Axios errors, log the error object if it might be useful
        if (err && !(err.isAxiosError)) {
            console.error("Non-Axios error details:", err);
        }
      }

    } finally {
      setLoading(false);
      // Update the temporary loading message with the actual response or error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempLoadingMessageId
            ? {
                ...msg, // Retain role, id
                content: assistantResponseText,
                provider: actualProvider, // Update with the actual provider from the response
                isError: messageIsError,
                isLoading: false, // Mark as no longer loading
              }
            : msg
        )
      );
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageData(base64String);
        setImagePreview(base64String);
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsDataURL(file);
    } else {
      setImageData(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModeButtonClick = (mode: string) => {
    setCurrentMode(currentMode === mode ? null : mode);
  };

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const renderMessages = () => (
    messages.map((msg, index) => {
      // START: Contract Violation Check
      if (typeof msg.content !== 'string') {
        console.error(
          'ChatWindow: Message content is not a string!',
          {
            chatId: activeChatId,
            messageIndex: index,
            provider: msg.provider,
            payloadType: typeof msg.content,
            payload: msg.content,
          }
        );
        let prettyPrintedContent = '[Unsupported response structure]';
        try {
          prettyPrintedContent = JSON.stringify(msg.content, null, 2);
        } catch (e) {
          console.error('ChatWindow: Failed to stringify non-string content', e);
        }
        const key = msg.id ? `msg-${msg.id}-contract-violation` : `msg-idx-${index}-${msg.role}-contract-violation`;
        // This error message will also be wrapped by the new centered container
        return (
          <div key={key} className="flex justify-start mb-4">
            <div className="max-w-xl lg:max-w-3xl px-4 py-2 rounded-lg shadow bg-red-100 text-red-700">
              <p className="font-semibold">Contract Violation:</p>
              <pre className="whitespace-pre-wrap text-xs"><code>{prettyPrintedContent}</code></pre>
            </div>
          </div>
        );
      }
      // END: Contract Violation Check

      const messageKey = msg.id ? `msg-${msg.id}` : `msg-idx-${index}-${msg.role}`;
      const currentMessageContent = msg.content || ''; 

      // Common classes for message bubbles
      const bubbleBaseClasses = "px-3 py-1.5 rounded-lg shadow p-4 rounded-md"; // REMOVED font-mono from here
      
      if (msg.role === 'user') {
        return (
          <div key={messageKey} className="flex items-start gap-3 mb-4 justify-end"> {/* User messages on the right */}
            {/* User Message Bubble (appears before avatar in source for flex justify-end) */}
            <div
              className={`message-content-container ${bubbleBaseClasses} bg-gray-200 text-black rounded-br-none max-w-xl lg:max-w-2xl`}
            >
              {/* Content rendering remains the same */}
              {msg.isError ? (
                <p className="text-red-100 text-sm">{currentMessageContent}</p> // Adjusted error color for dark bg
              ) : (
                <div className="prose prose-invert max-w-none chat-message-content font-sans text-xs">
                  <ReactMarkdown
                    components={{
                      pre: ({ node, ...props }) => {
                        // Ensure children is an array and has at least one element
                        const childrenArray = React.Children.toArray(props.children);
                        const codeNode = childrenArray[0] as React.ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
                        
                        if (codeNode && codeNode.type === 'code' && typeof codeNode.props?.className === 'string') {
                          const match = /language-(\w+)/.exec(codeNode.props.className || '');
                          const language = match ? match[1] : undefined;
                          // Ensure codeNode.props.children is treated as a string
                          const codeString = String(codeNode.props.children ?? '').replace(/\n$/, '');
                          return (
                            <div className="my-2">
                              <SyntaxHighlighter
                                style={atomDark as any}
                                language={language || 'text'}
                                PreTag="div"
                                className="rounded-lg px-3 py-2 overflow-x-auto font-mono text-sm leading-tight"
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                        return <pre {...props} className="font-mono text-sm leading-tight my-2 p-2 bg-gray-700/50 rounded-md overflow-x-auto" />;
                      },
                      code: (props: CustomCodeProps) => { // Changed signature to take combined props
                        const { node, className, children, ...rest } = props;
                        const inline = props.inline;

                        if (!node) return null; // Handle potentially undefined node

                        if (inline) {
                          return (
                            <code
                              className="bg-gray-600/50 text-gray-200 px-1 py-0.5 rounded font-mono text-[0.9em]"
                              {...rest} // Spread the rest of the props
                            >
                              {children}
                            </code>
                          );
                        }
                        const match = /language-(\w+)/.exec(className || '');
                        if (match) {
                            return (
                                <div className="my-2">
                                    <SyntaxHighlighter
                                        style={atomDark as any}
                                        language={match[1]}
                                        PreTag="div"
                                        className="rounded-lg px-3 py-2 overflow-x-auto font-mono text-sm leading-tight"
                                        {...rest} // Spread the rest of the props
                                    >
                                        {String(children ?? '').replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }
                        return (
                          <code 
                            className={`${className || ''} font-mono text-xs bg-gray-700/30 rounded p-1 block whitespace-pre-wrap overflow-x-auto`}
                            {...rest} // Spread the rest of the props
                          >
                            {children}
                          </code>
                        );
                      },
                      // Example optional overrides for compactness (uncomment and adjust if needed):
                      // p: ({node, ...props}) => <p className="my-1 text-xs" {...props} />,
                      // ul: ({node, ...props}) => <ul className="my-1 pl-5 text-xs" {...props} />,
                      // ol: ({node, ...props}) => <ol className="my-1 pl-5 text-xs" {...props} />,
                      // blockquote: ({node, ...props}) => <blockquote className="my-1 pl-3 border-l-2 border-gray-500 italic text-xs" {...props} />,
                      // h1: ({node, ...props}) => <h1 className="text-lg font-semibold my-1.5" {...props} />,
                      // h2: ({node, ...props}) => <h2 className="text-base font-semibold my-1.5" {...props} />,
                      // h3: ({node, ...props}) => <h3 className="text-sm font-semibold my-1.5" {...props} />,
                    }}
                  >
                    {currentMessageContent}
                  </ReactMarkdown>
                </div>
                )}
              </div>
            {/* User Avatar Placeholder */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">
              You
            </div>
          </div>
        );
      } else { // Assistant messages
        return (
          <div key={messageKey} className="flex items-start gap-3 mb-4 justify-start"> {/* Assistant messages on the left */}
            {/* Assistant Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-white text-xs overflow-hidden">
              {(() => {
                const providerName = msg.provider?.toLowerCase().replace(/\s+/g, '-') || 'default';
                // Icon logic remains the same
                if (providerName === 'openai') return <img src="/openai.png" alt="OpenAI" className="w-full h-full object-contain" />;
                if (providerName === 'claude') return <img src="/claude.png" alt="Claude" className="w-full h-full object-contain" />;
                if (providerName === 'gemini') return <img src="/gemini.png" alt="Gemini" className="w-full h-full object-contain" />;
                if (providerName === 'neuroswitch' || providerName === 'neuro-switch') return <img src="/neuro-switch.png" alt="NeuroSwitch" className="w-full h-full object-contain" />;
                return (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                );
              })()}
            </div>
            {/* Assistant Message Bubble */}
            <div
              className={`message-content-container ${bubbleBaseClasses} bg-gray-100 text-slate-900 rounded-bl-none max-w-xl lg:max-w-2xl`}
            >
              {/* Content rendering conditional on isLoading, isError, or normal content */}
              {msg.isLoading ? (
                <div className="flex items-center text-sm text-slate-700 py-1">
                  <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Thinking...</span>
                </div>
              ) : msg.isError ? (
                <p className="text-red-500 text-sm">{currentMessageContent}</p> 
              ) : (
                <div className="prose prose-invert max-w-none chat-message-content font-sans text-xs">
                  <ReactMarkdown
                    components={{
                      pre: ({ node, ...props }) => {
                        // Ensure children is an array and has at least one element
                        const childrenArray = React.Children.toArray(props.children);
                        const codeNode = childrenArray[0] as React.ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
                        
                        if (codeNode && codeNode.type === 'code' && typeof codeNode.props?.className === 'string') {
                          const match = /language-(\w+)/.exec(codeNode.props.className || '');
                          const language = match ? match[1] : undefined;
                          // Ensure codeNode.props.children is treated as a string
                          const codeString = String(codeNode.props.children ?? '').replace(/\n$/, '');
                          return (
                            <div className="my-2">
                              <SyntaxHighlighter
                                style={atomDark as any}
                                language={language || 'text'}
                                PreTag="div"
                                className="rounded-lg px-3 py-2 overflow-x-auto font-mono text-sm leading-tight"
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                        return <pre {...props} className="font-mono text-sm leading-tight my-2 p-2 bg-gray-700/50 rounded-md overflow-x-auto" />;
                      },
                      code: (props: CustomCodeProps) => { // Changed signature to take combined props
                        const { node, className, children, ...rest } = props;
                        const inline = props.inline;

                        if (!node) return null; // Handle potentially undefined node

                        if (inline) {
                          return (
                            <code
                              className="bg-gray-600/50 text-gray-200 px-1 py-0.5 rounded font-mono text-[0.9em]"
                              {...rest} // Spread the rest of the props
                            >
                              {children}
                            </code>
                          );
                        }
                        const match = /language-(\w+)/.exec(className || '');
                        if (match) {
                            return (
                                <div className="my-2">
                                    <SyntaxHighlighter
                                        style={atomDark as any}
                                        language={match[1]}
                                        PreTag="div"
                                        className="rounded-lg px-3 py-2 overflow-x-auto font-mono text-sm leading-tight"
                                        {...rest} // Spread the rest of the props
                                    >
                                        {String(children ?? '').replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }
                        return (
                          <code 
                            className={`${className || ''} font-mono text-xs bg-gray-700/30 rounded p-1 block whitespace-pre-wrap overflow-x-auto`}
                            {...rest} // Spread the rest of the props
                          >
                            {children}
                          </code>
                        );
                      },
                      // Example optional overrides for compactness (uncomment and adjust if needed):
                      // p: ({node, ...props}) => <p className="my-1 text-xs" {...props} />,
                      // ul: ({node, ...props}) => <ul className="my-1 pl-5 text-xs" {...props} />,
                      // ol: ({node, ...props}) => <ol className="my-1 pl-5 text-xs" {...props} />,
                      // blockquote: ({node, ...props}) => <blockquote className="my-1 pl-3 border-l-2 border-gray-500 italic text-xs" {...props} />,
                      // h1: ({node, ...props}) => <h1 className="text-lg font-semibold my-1.5" {...props} />,
                      // h2: ({node, ...props}) => <h2 className="text-base font-semibold my-1.5" {...props} />,
                      // h3: ({node, ...props}) => <h3 className="text-sm font-semibold my-1.5" {...props} />,
                    }}
                  >
                    {currentMessageContent}
                  </ReactMarkdown>
              </div>
            )}
            </div>
          </div>
        );
      }
    })
  );
  
  return (
    <div className="flex flex-col h-full w-full px-4 pb-4 relative font-sans">
      
      <div className="flex-1 overflow-y-auto p-3 pt-16">
        {/* Centered, max-width container for messages */}
        <div className="mx-auto w-full max-w-3xl"> 
        {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full text-sm text-gray-600">Loading messages...</div>
        ) : renderMessages()}
        </div>
      </div>

      {/* Input area - Reverted from fixed to normal flow */}
      <div className="input-wrapper mt-auto px-0 sm:px-0 lg:px-0  pt-2 border-t">
        <div className="max-w-5xl mx-auto px-2">
          {imagePreview && (
            <div className="mb-1">
              <div className="relative  inline-block">
                <img
                  className="max-h-16 sm:max-h-24 rounded-lg "
                  src={imagePreview}
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white rounded-full p-0.5 shadow-sm hover:bg-gray-100"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="relative">
          <div className="mb-2 text-xs text-gray-500">
  <span>
    Tokens Used: {tokensUsed} / {maxTokens} ({Math.floor((tokensUsed / maxTokens) * 100)}%)
  </span>
  <div className="w-full bg-gray-200 h-2 rounded">
    <div
      className="bg-blue-500 h-2 rounded"
      style={{ width: `${Math.min((tokensUsed / maxTokens) * 100, 100)}%` }}
    ></div>
  </div>
</div>
            <div className="flex items-end space-x-1 bg-white rounded-lg border border-gray-300 p-1.5 shadow-md">
              <button
                type="button"
                onClick={handleImageUploadClick}
                className="p-1.5 text-gray-400 hover:text-gray-600"
                title="Upload Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                rows={1}
                className="flex-1 border-0 bg-transparent p-1.5 focus:ring-0 focus:outline-none resize-none max-h-28 overflow-y-auto min-h-[2.25rem]"
                placeholder="Type something... (⌘ + Enter to send)"
                style={{ height: '36px' }}
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !imageData)}
                className={`p-1.5 text-blue-500 hover:text-blue-600 ${loading || (!input.trim() && !imageData) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Send Message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            
            <div className="mt-2 overflow-x-auto pb-1 feature-buttons-container">
              <div className="flex items-center flex-nowrap space-x-1.5">
                {[
                  { key: 'deep_research', label: 'Deep Research', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3.5 4.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" clipRule="evenodd" /></svg> },
                  { key: 'think', label: 'Think', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg> },
                  { key: 'write_code', label: 'Write/Code', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg> },
                  { key: 'image', label: 'Image', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg> },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => handleModeButtonClick(mode.key)}
                    className={`feature-button inline-flex items-center px-2.5 py-1 rounded-full border text-xs whitespace-nowrap 
                      ${currentMode === mode.key
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

      
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;