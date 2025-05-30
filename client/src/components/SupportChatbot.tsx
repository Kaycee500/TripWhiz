import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, MessageCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VectorStore, VectorDocument } from "@/lib/VectorStore";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SiteMapPage {
  url: string;
  title: string;
  content: string;
}

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your TripWhiz Support assistant. I can help you with flight searches, price tracking, VPN market switching, and any questions about our travel tools. What can I help you with today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [vectorStore] = useState(() => new VectorStore());
  const [knowledgeReady, setKnowledgeReady] = useState(false);
  const [lastKnowledgeUpdate, setLastKnowledgeUpdate] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize knowledge base on mount
  useEffect(() => {
    initializeKnowledgeBase();
  }, []);

  // Set up daily knowledge refresh (24 hours)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshKnowledgeBase();
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(refreshInterval);
  }, []);

  // Initialize knowledge base from sitemap
  const initializeKnowledgeBase = async () => {
    try {
      // Check if knowledge base already exists and is recent
      const stats = vectorStore.getStats();
      if (stats.totalDocuments > 0 && lastKnowledgeUpdate) {
        const hoursSinceUpdate = (Date.now() - lastKnowledgeUpdate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 24) {
          setKnowledgeReady(true);
          return;
        }
      }

      await refreshKnowledgeBase();
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
      setKnowledgeReady(true); // Continue without knowledge base
    }
  };

  // Refresh knowledge base from sitemap
  const refreshKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/sitemap');
      if (!response.ok) {
        throw new Error('Failed to fetch sitemap');
      }

      const siteMap: SiteMapPage[] = await response.json();

      // Clear existing page documents
      const allDocs = vectorStore.getAllDocuments();
      const conversationDocs = allDocs.filter(doc => doc.metadata.type === 'conversation');
      vectorStore.clear();

      // Re-add conversation history
      conversationDocs.forEach(doc => vectorStore.add(doc));

      // Process each page and create embeddings with rate limiting
      for (let i = 0; i < siteMap.length; i++) {
        const page = siteMap[i];
        try {
          const embeddingResponse = await fetch('/api/openai/embeddings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: `${page.title}: ${page.content}`
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            const document: VectorDocument = {
              id: page.url,
              embedding,
              metadata: {
                url: page.url,
                title: page.title,
                content: page.content,
                type: 'page'
              }
            };

            vectorStore.add(document);
          } else {
            console.error(`Failed to get embedding for page ${page.url}:`, embeddingResponse.statusText);
          }

          // Rate limiting: Wait 100ms between requests to avoid hitting API limits
          if (i < siteMap.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Failed to process page ${page.url}:`, error);
        }
      }

      setLastKnowledgeUpdate(new Date());
      setKnowledgeReady(true);

      toast({
        title: "Knowledge updated",
        description: `Indexed ${siteMap.length} pages for better support responses.`,
      });

    } catch (error) {
      console.error('Failed to refresh knowledge base:', error);
      setKnowledgeReady(true);
    }
  };

  // Generate embedding for user query
  const generateQueryEmbedding = async (text: string): Promise<number[] | null> => {
    try {
      const response = await fetch('/api/openai/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate query embedding:', error);
      return null;
    }
  };

  // Handle user message submission
  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Self-training: Add user message to vector store
      const userEmbedding = await generateQueryEmbedding(userMessage.content);
      if (userEmbedding) {
        const conversationDoc: VectorDocument = {
          id: `conversation_${userMessage.id}`,
          embedding: userEmbedding,
          metadata: {
            content: userMessage.content,
            type: 'conversation',
            timestamp: userMessage.timestamp.toISOString()
          }
        };
        vectorStore.add(conversationDoc);
      }

      // RAG: Retrieve relevant context
      let context = '';
      if (userEmbedding && knowledgeReady) {
        const similarDocs = vectorStore.similaritySearch(userEmbedding, 3);
        context = similarDocs
          .filter(result => result.similarity > 0.7) // Only include highly relevant results
          .map(result => {
            const { title, content, type } = result.document.metadata;
            if (type === 'page' && title) {
              return `${title}: ${content}`;
            }
            return content;
          })
          .join('\n\n');
      }

      // Generate AI response
      const chatResponse = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: userMessage.content
            }
          ],
          context
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const chatData = await chatResponse.json();
      const aiResponse = chatData.choices[0].message.content;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Self-training: Add AI response to vector store
      const aiEmbedding = await generateQueryEmbedding(aiResponse);
      if (aiEmbedding) {
        const responseDoc: VectorDocument = {
          id: `response_${assistantMessage.id}`,
          embedding: aiEmbedding,
          metadata: {
            content: aiResponse,
            type: 'conversation',
            timestamp: assistantMessage.timestamp.toISOString()
          }
        };
        vectorStore.add(responseDoc);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment, or feel free to explore the TripWhiz features directly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const stats = vectorStore.getStats();

  return (
    <>
      {/* Floating Support Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-2xl border-2 border-gray-200">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold">TripWhiz Support</h3>
                      <div className="flex items-center space-x-2 text-xs opacity-90">
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                          AI Assistant
                        </Badge>
                        {knowledgeReady && (
                          <span className="text-xs">
                            {stats.totalDocuments} docs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshKnowledgeBase}
                      className="w-8 h-8 p-0 text-white hover:bg-white/20"
                      title="Refresh knowledge base"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 p-0 text-white hover:bg-white/20"
                      aria-label="Close chat"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                          <span className="text-sm text-gray-500">Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  {!knowledgeReady && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-yellow-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">Loading knowledge base...</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about TripWhiz..."
                      disabled={loading}
                      className="flex-1"
                      aria-label="Type your message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || loading}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}