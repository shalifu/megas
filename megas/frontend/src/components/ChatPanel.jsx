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
      loadConversations();
    };

    const handleTyping = (payload) => {
      if (payload.senderId === selected?.id) {
        setTyping(true);
        window.setTimeout(() => setTyping(false), 900);
      }
    };

    socket.on('receive_message', handleReceive);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('typing', handleTyping);
    };
  }, [selected]);

  const handleSend = async () => {
    if (!selected || !text.trim()) return;

    const message = text.trim();
    setText('');

    try {
      const response = await api.post('/chat/messages', {
        receiverId: selected.id,
        message,
      });
      setMessages((prev) => [...prev, response.data.message]);
      socket.emit('send_message', { receiverId: selected.id, message });
    } catch (error) {
      console.error(error);
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
              <p className="mt-2 text-xs text-slate-500">{new Date(message.created_at).toLocaleString()}</p>
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
      </div>
    </div>
  );
}

export default ChatPanel;
