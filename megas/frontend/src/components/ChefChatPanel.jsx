import { useEffect, useMemo, useState } from 'react';
import socket, { ensureSocketConnection } from '../socket/socketClient';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ChefChatPanel() {
  const { user } = useAuth();
  const [chefContacts, setChefContacts] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [viewMode, setViewMode] = useState('group'); // 'group' or 'direct'
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [status, setStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const selectedLabel = useMemo(() => 
    selected ? `${selected.username} (${selected.chief_position})` : 
    viewMode === 'group' ? 'Chef Group Chat' : 'Select a chef conversation', 
    [selected, viewMode]
  );

  const loadChefConversations = async () => {
    try {
      const response = await api.get('/chat/chef-conversations');
      setChefContacts(response.data.chefUsers || []);
      setGroupMessages(response.data.groupMessages || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async (contactId) => {
    if (!contactId) return;
    try {
      const response = await api.get(`/chat/chef-messages/${contactId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!text.trim()) {
      setStatus({ type: 'error', text: 'Cannot send an empty message.' });
      return;
    }

    if (viewMode === 'direct' && !selected) {
      setStatus({ type: 'error', text: 'Please select a chef to message directly.' });
      return;
    }

    const payload = {
      message: text.trim(),
      isGroup: viewMode === 'group',
      receiverId: viewMode === 'direct' ? selected?.id : undefined,
    };

    setIsSending(true);
    try {
      await ensureSocketConnection();
      socket.emit('sendChefMessage', payload, (serverResponse) => {
        setIsSending(false);

        if (serverResponse?.error) {
          console.error('Socket send error:', serverResponse.error);
          setStatus({ type: 'error', text: serverResponse.error });
          return;
        }

        const message = {
          id: serverResponse?.id || Date.now(),
          senderId: user.id,
          receiverId: payload.receiverId,
          message: payload.message,
          created_at: new Date().toISOString(),
          isGroup: payload.isGroup,
          username: user.username,
          chief_position: user.chief_position,
        };

        if (viewMode === 'group') {
          setGroupMessages((prev) => [message, ...prev]);
        } else {
          setMessages((prev) => [...prev, message]);
        }

        setText('');
        setStatus({ type: 'success', text: 'Message sent.' });
      });
    } catch (error) {
      console.error('Send message error:', error);
      setIsSending(false);
      setStatus({ type: 'error', text: 'Unable to send message. Please try again.' });
    }
  };

  useEffect(() => {
    loadChefConversations();
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
        setMessages(prev => [...prev, message]);
      } else {
        // Update unread count for direct messages
        if (message.senderId !== user.id && message.receiverId === user.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.senderId]: (prev[message.senderId] || 0) + 1
          }));
        }
        loadChefConversations(); // Reload conversations list
      }
    };

    const handleChefReceive = (message) => {
      if (viewMode === 'group' && message.isGroup) {
        setGroupMessages(prev => [message, ...prev]);
      } else if (viewMode === 'direct' && message.senderId === selected?.id) {
        setMessages(prev => [...prev, message]);
      } else if (message.senderId !== user.id && !message.isGroup) {
        // Update unread count for direct messages
        setUnreadCounts(prev => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1
        }));
      }
    };

    const handleTyping = (data) => {
      if (data.senderId === selected?.id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    };

    const handlePresenceUpdate = (activeUserIds) => {
      setActiveUsers(new Set(activeUserIds));
    };

    socket.on('receive_message', handleReceive);
    socket.on('receiveChefMessage', handleChefReceive);
    socket.on('typing', handleTyping);
    socket.on('presence:update', handlePresenceUpdate);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('receiveChefMessage', handleChefReceive);
      socket.off('typing', handleTyping);
      socket.off('presence:update', handlePresenceUpdate);
    };
  }, [selected, viewMode, user.id]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Chef Chat</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('group')}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                viewMode === 'group' 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Group Chat
            </button>
            <button
              onClick={() => setViewMode('direct')}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                viewMode === 'direct' 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Direct Chat
            </button>
          </div>
        </div>
        <p className="mt-2 text-slate-400">
          {viewMode === 'group' 
            ? 'Group chat with all chefs and head admin.' 
            : 'Direct messages with individual chefs.'}
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {viewMode === 'direct' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Chefs Online</h3>
                  <p className="mt-1 text-xs text-slate-400">Select a chef to start a direct conversation.</p>
                </div>
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs text-brand-200">
                  {chefContacts.length} available
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <label className="block text-sm text-slate-300">
                  Choose chef
                  <select
                    value={selected?.id || ''}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const contact = chefContacts.find((chef) => chef.id === selectedId) || null;
                      setSelected(contact);
                      if (contact && unreadCounts[contact.id]) {
                        setUnreadCounts((prev) => {
                          const newCounts = { ...prev };
                          delete newCounts[contact.id];
                          return newCounts;
                        });
                      }
                    }}
                    className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                  >
                    <option value="">Select a chef</option>
                    {chefContacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.username} {contact.chief_position ? `— ${contact.chief_position}` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="space-y-2">
                  {chefContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelected(contact);
                        if (unreadCounts[contact.id]) {
                          setUnreadCounts((prev) => {
                            const newCounts = { ...prev };
                            delete newCounts[contact.id];
                            return newCounts;
                          });
                        }
                      }}
                      className={`w-full rounded-2xl p-3 text-left text-sm transition relative ${
                        selected?.id === contact.id
                          ? 'bg-brand-500/15 text-white shadow-sm shadow-brand-500/10'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{contact.username}</div>
                            {activeUsers.has(contact.id) && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{contact.chief_position}</div>
                          {contact.last_message && (
                            <div className="mt-1 truncate text-xs text-slate-400">
                              {contact.last_message}
                            </div>
                          )}
                        </div>
                        {unreadCounts[contact.id] > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                            {unreadCounts[contact.id]}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {chefContacts.length === 0 && (
                    <p className="text-sm text-slate-400">No other chefs available yet. Add chef users or refresh the page.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{selectedLabel}</h3>
              <div className="flex items-center gap-2">
                {viewMode === 'group' && (
                  <span className="rounded-xl bg-brand-500/20 px-3 py-1 text-xs text-brand-300">
                    📢 All Chefs + Admin
                  </span>
                )}
                {selected && viewMode === 'direct' && (
                  <span className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                    💬 {selected.chief_position}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {viewMode === 'group' 
                ? 'Message will be sent to all chef team members and head admin.' 
                : selected 
                  ? `Direct message to ${selected.username} (${selected.chief_position})`
                  : 'Select a chef to send a direct message.'}
            </p>
          </div>
          
          <div className="mb-4 h-[420px] space-y-4 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            {viewMode === 'group' ? (
              <>
                {groupMessages.length === 0 && <p className="text-slate-500">No messages in chef group chat yet.</p>}
                {groupMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-3xl p-3 ${
                      message.senderId === user.id ? 'ml-auto bg-brand-500/15 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-6 flex-1">{message.message}</p>
                      <div className="text-xs text-slate-500">
                        <div className="font-medium">{message.username}</div>
                        {message.chief_position && (
                          <div className="text-emerald-400">{message.chief_position}</div>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{new Date(message.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </>
            ) : (
              <>
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
              </>
            )}
            {typing && <p className="text-sm text-slate-400">Typing…</p>}
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('group')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'group' 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                📢 Group Chat
              </button>
              <button
                onClick={() => setViewMode('direct')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'direct' 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                💬 Direct Chat
              </button>
            </div>

            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={viewMode === 'group' ? "Type a message to chef group..." : "Type a message..."}
                className="flex-1 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-brand-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className="rounded-3xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
                disabled={isSending || !text.trim() || (viewMode === 'direct' && !selected)}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>

            {status && (
              <p className={`text-sm ${status.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {status.text}
              </p>
            )}

            {viewMode === 'direct' && !selected && (
              <p className="text-sm text-slate-400">Select a chef to send a direct message.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChefChatPanel;
