import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import socket from '../socket/socketClient';
import { useAuth } from '../context/AuthContext';

function ChatPanel() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [sendError, setSendError] = useState('');

  const selectedLabel = useMemo(() => selected?.username || 'Select a conversation', [selected]);

  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setContacts(response.data.conversations || []);
      if (!selected && response.data.conversations.length) {
        setSelected(response.data.conversations[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async (contactId) => {
    if (!contactId) return;
    try {
      const response = await api.get(`/chat/messages/${contactId}`);
      setMessages(response.data.messages || []);
      socket.emit('mark_messages_read', { otherUserId: contactId });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selected) {
      loadMessages(selected.id);
    }
  }, [selected]);

  useEffect(() => {
    const handleReceive = (message) => {
      const isCurrent = message.senderId === selected?.id || message.receiverId === selected?.id;
      if (isCurrent) {
        setMessages((prev) => [...prev, message]);
      }

      api.get('/chat/conversations')
        .then((response) => {
          const conversations = response.data.conversations || [];
          setContacts(conversations);

          if (message.receiverId === user.id && message.senderId !== selected?.id) {
            const sender = conversations.find((contact) => contact.id === message.senderId);
            if (sender) setSelected(sender);
          }
        })
        .catch((error) => console.error(error));
    };

    const handleTyping = (payload) => {
      if (payload.senderId === selected?.id) {
        setTyping(true);
        window.setTimeout(() => setTyping(false), 900);
      }
    };

    const handleMessagesRead = ({ readerId, conversationUserId }) => {
      if (conversationUserId !== user.id) return;

      setMessages((prev) => prev.map((message) => (
        message.senderId === user.id && message.receiverId === readerId
          ? { ...message, read_at: new Date().toISOString() }
          : message
      )));
    };

    socket.on('receive_message', handleReceive);
    socket.on('typing', handleTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('typing', handleTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [selected, user.id]);

  const handleSend = async () => {
    if (!selected || !text.trim()) return;

    const message = text.trim();
    setText('');
    setSendError('');

    try {
      await api.post('/chat/messages', { receiverId: selected.id, message });
      await Promise.all([loadMessages(selected.id), loadConversations()]);
    } catch (error) {
      console.error('Message send error:', error);
      setSendError(error.response?.data?.message || 'Unable to send message. Please try again.');
      setText(message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/20">
        <h2 className="text-lg font-semibold text-white">Conversations</h2>
        <div className="mt-5 space-y-2">
          {contacts.length === 0 && <p className="text-slate-400">No conversations yet.</p>}
          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setSelected(contact)}
              className={`w-full rounded-3xl px-4 py-3 text-left transition ${
                selected?.id === contact.id ? 'bg-brand-500/15 text-white' : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{contact.username}</span>
                <span className="text-xs text-slate-500">{contact.role}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400 truncate">{contact.last_message || 'No messages yet'}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Chat with</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{selectedLabel}</h3>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">Live</span>
        </div>

        <div className="mb-4 h-[420px] space-y-4 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
          {messages.length === 0 && <p className="text-slate-500">Select a conversation to view messages.</p>}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-3xl p-3 ${
                message.senderId === user.id ? 'ml-auto bg-brand-500/15 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <p className="text-sm leading-6">{message.message}</p>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(message.created_at).toLocaleString()}
                {message.senderId === user.id && message.read_at && (
                  <span
                    className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle"
                    title="Read"
                    aria-label="Message read"
                  />
                )}
              </p>
            </div>
          ))}
          {typing && <p className="text-sm text-slate-400">Typing…</p>}
        </div>

        <div className="flex gap-3">
          <input
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              socket.emit('typing', { receiverId: selected?.id });
            }}
            disabled={!selected}
            placeholder={selected ? 'Write a message…' : 'Pick a conversation first'}
            className="flex-1 rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-brand-500"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!selected || !text.trim()}
            className="rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
        {sendError && <p className="mt-3 text-sm text-red-400">{sendError}</p>}
      </div>
    </div>
  );
}

export default ChatPanel;
