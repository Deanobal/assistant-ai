import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isPreviewTestMode, getRuntimeDataEnv } from '@/lib/runtimeDataEnv';
import SupportChatBubble from './SupportChatBubble';
import SupportChatIntakeForm from './SupportChatIntakeForm';
import SupportChatComposer from './SupportChatComposer';

const STORAGE_KEY = 'assistantai-support-chat';

const systemIntro = {
  id: 'intro',
  sender_type: 'system',
  sender_name: 'AssistantAI Assistant',
  message_body: 'You’re chatting with AssistantAI Assistant. I can help qualify your enquiry, answer straightforward questions, and route anything urgent or complex to our human team.',
};

export default function ChatWidget() {
  const location = useLocation();
  const previewTestMode = isPreviewTestMode();
  const runtimeDataEnv = getRuntimeDataEnv();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [threadError, setThreadError] = useState('');
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [form, setForm] = useState({ name: '', email: '', mobile: '', message: '' });
  const [storedThread, setStoredThread] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!isOpen || !storedThread?.conversationId || conversation) return;

    const loadThread = async () => {
      setIsLoadingThread(true);
      setThreadError('');
      try {
        const response = await base44.functions.invoke('getSupportConversation', {
          conversationId: storedThread.conversationId,
          email: storedThread.email,
          runtimeDataEnv,
        });
        setConversation(response.data.conversation);
        setMessages(response.data.messages || []);
        setForm((prev) => ({
          ...prev,
          name: storedThread.name || prev.name,
          email: storedThread.email || prev.email,
        }));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        setStoredThread(null);
        setThreadError(error?.response?.data?.error || error.message || 'Unable to load the saved conversation.');
      } finally {
        setIsLoadingThread(false);
      }
    };

    loadThread();
  }, [conversation, isOpen, storedThread]);

  const threadMessages = useMemo(() => {
    if (!conversation) {
      return [systemIntro];
    }
    return [systemIntro, ...messages];
  }, [conversation, messages]);

  const handleStartConversation = async () => {
    setIsSubmitting(true);
    setThreadError('');
    try {
      const response = await base44.functions.invoke('startSupportConversation', {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        message: form.message,
        sourcePage: location.pathname,
        runtimeDataEnv,
      });
      const nextConversation = response.data.conversation;
      const nextMessages = response.data.messages || [];
      setConversation(nextConversation);
      setMessages(nextMessages);
      setForm((prev) => ({ ...prev, message: '' }));
      const nextStored = {
        conversationId: nextConversation.id,
        email: nextConversation.visitor_email,
        name: nextConversation.visitor_name,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStored));
      setStoredThread(nextStored);
    } catch (error) {
      setThreadError(error?.response?.data?.error || error.message || 'Unable to send your message right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    setIsSubmitting(true);
    setThreadError('');
    try {
      const response = await base44.functions.invoke('replySupportConversation', {
        conversationId: conversation.id,
        email: form.email,
        name: form.name,
        message: replyBody,
        sourcePage: location.pathname,
        runtimeDataEnv,
      });
      setMessages((prev) => response.data.aiMessage ? [...prev, response.data.message, response.data.aiMessage] : [...prev, response.data.message]);
      setConversation((prev) => response.data.conversation || prev);
      setReplyBody('');
    } catch (error) {
      setThreadError(error?.response?.data?.error || error.message || 'Unable to send your reply right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[380px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b13]/95 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl"
          >
            <div className="border-b border-white/8 bg-white/[0.03] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[11px] text-cyan-300">
                    Chat with AssistantAI Assistant
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">Send us a message</h3>
                  <p className="mt-1 text-xs text-gray-400">Support and sales enquiries for AssistantAI.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 max-h-[420px] overflow-y-auto">
              {threadMessages.map((message) => (
                <SupportChatBubble key={message.id} message={message} />
              ))}
              {isLoadingThread && (
                <SupportChatBubble message={{ id: 'loading', sender_type: 'system', message_body: 'Loading your conversation…' }} />
              )}
            </div>

            <div className="border-t border-white/8 px-4 py-4 space-y-3">
              {threadError && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {threadError}
                </div>
              )}

              {previewTestMode && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300">
                  Support messaging is disabled in preview test mode so test actions do not write into production data.
                </div>
              )}

              {!conversation ? (
                <SupportChatIntakeForm
                  form={form}
                  setForm={setForm}
                  onSubmit={handleStartConversation}
                  isLoading={isSubmitting || previewTestMode}
                />
              ) : (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-gray-400">
                    Conversation status: {conversation.status}. Our team reviews messages and will get back to you shortly.
                  </div>
                  <SupportChatComposer
                    value={replyBody}
                    onChange={setReplyBody}
                    onSend={handleReply}
                    isLoading={isSubmitting || previewTestMode}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-3 rounded-full border border-white/10 bg-[#0b0b13]/90 px-4 py-3 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-xl transition hover:border-cyan-500/30 hover:bg-[#11111a]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">Chat with Support</p>
          <p className="text-xs text-gray-400">Send us a message</p>
        </div>
      </button>
    </div>
  );
}