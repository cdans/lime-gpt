'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/views/Header';
import { Sidebar } from '@/components/views/Sidebar';
import { ChatInterface } from '@/components/views/ChatInterface';
import { Message, ChatSession } from '@/types';

// Mock system prompt
const SYSTEM_PROMPT = `Du bist limetaxIQ, ein KI-Assistent für deutsche Steuerberater und Steuerkanzleien.

Deine Aufgaben:
- Beantworte steuerrechtliche Fragen präzise und mit Quellenangaben
- Unterstütze bei der Mandantenvorbereitung und Fristenverwaltung
- Erkläre komplexe Sachverhalte verständlich für Steuerberater
- Gib IMMER Quellen an (z.B. § 1 AO, § 15 EStG)

Antworte immer auf Deutsch, professionell und präzise.
Bei Unsicherheit: Weise auf Interpretationsspielräume hin.`;

const DATA_SOURCES = [
  'Abgabenordnung (AO)',
  'Einkommensteuergesetz (EStG)',
  'Umsatzsteuergesetz (UStG)',
  'Mandanten-Datenbank',
  'BFH-Urteile',
];

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('limetax-sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
        setMessages(parsed[0].messages);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('limetax-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Neuer Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(updatedSessions);
    
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
        setMessages(updatedSessions[0].messages);
      } else {
        setCurrentSessionId(undefined);
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    // Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add user message to current session
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update session title if it's the first message
    let updatedSessions = sessions;
    if (currentSessionId) {
      updatedSessions = sessions.map((session) => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            title: session.messages.length === 0 ? content.slice(0, 50) : session.title,
            messages: updatedMessages,
            updatedAt: new Date(),
          };
        }
        return session;
      });
      setSessions(updatedSessions);
    } else {
      // Create new session if none exists
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: content.slice(0, 50),
        messages: updatedMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      setCurrentSessionId(newSession.id);
    }

    // Call API (will be implemented in Phase 7)
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call in Phase 7
      // For now, simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: 'Dies ist eine Mock-Antwort. Die echte LLM-Integration wird in Phase 7 implementiert.',
        citations: [
          { id: 'cite-1', source: '§ 1 AO', title: 'Abgabenordnung' },
        ],
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Update session with assistant message
      if (currentSessionId) {
        setSessions(
          sessions.map((session) => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                messages: finalMessages,
                updatedAt: new Date(),
              };
            }
            return session;
          })
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          systemPrompt={SYSTEM_PROMPT}
          dataSources={DATA_SOURCES}
        />
      </div>
    </div>
  );
}
