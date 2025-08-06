import React, { useState, useEffect, useRef } from 'react';
import styles from './App.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  response: string;
  session_id: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load session ID from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chat_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chat_session_id', sessionId);
    }
  }, [sessionId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus('Please upload a PDF file only.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus(`✅ Successfully uploaded: ${file.name}`);
        // Clear any existing session when a new file is uploaded
        setSessionId(null);
        localStorage.removeItem('chat_session_id');
        setMessages([]);
      } else {
        const errorData = await response.text();
        setUploadStatus(`❌ Upload failed: ${errorData}`);
      }
    } catch (error) {
      setUploadStatus(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const requestBody = {
        query: userMessage.content,
        ...(sessionId && { session_id: sessionId }),
      };

      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      // Update session ID if received
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem('chat_session_id');
    setError('');
    setUploadStatus('');
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Document AI Chat Assistant</h1>
          <div className={styles.controls}>
            <div className={styles.fileUpload}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className={styles.fileInput}
                id="file-upload"
              />
              <label htmlFor="file-upload" className={styles.fileLabel}>
                {isUploading ? 'Uploading...' : '📄 Upload PDF'}
              </label>
            </div>
            <button 
              onClick={clearChatHistory}
              className={styles.clearButton}
              disabled={messages.length === 0}
            >
              🗑️ Clear Chat
            </button>
          </div>
          {uploadStatus && (
            <div className={styles.uploadStatus}>
              {uploadStatus}
            </div>
          )}
        </header>

        <main className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Upload a PDF document and start asking questions!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.messageWrapper} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <div className={styles.message}>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    <div className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className={`${styles.messageWrapper} ${styles.assistantMessage}`}>
                <div className={styles.message}>
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className={styles.error}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSendMessage} className={styles.inputForm}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question about your document..."
                disabled={isLoading}
                className={styles.messageInput}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={styles.sendButton}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default App;
