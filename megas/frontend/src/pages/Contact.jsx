import { useState } from 'react';
import api from '../services/api';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill out all fields.' });
      return;
    }

    try {
      await api.post('/contact', { name: name.trim(), email: email.trim(), message: message.trim() });
      setStatus({ type: 'success', text: 'Message sent successfully.' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', text: error.response?.data?.message || 'Unable to send message.' });
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Contact</p>
        <h1 className="mt-5 text-4xl font-semibold text-white">Send a message or request a project estimate.</h1>
        <p className="mt-6 text-slate-400">Our team is ready to receive project requirements, service questions, and order briefs.</p>
        <div className="mt-10 space-y-5 text-slate-300">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Email</p>
            <p className="mt-2 text-lg text-white">megas@gmail.com</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Office</p>
            <p className="mt-2 text-lg text-white">Kigali, Rwanda</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Phone</p>
            <p className="mt-2 text-lg text-white">+20788888888</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-300">
            Full name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-white outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-white outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Message
            <textarea
              rows="5"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-white outline-none focus:border-brand-500"
            ></textarea>
          </label>
          {status && (
            <p className={`text-sm ${status.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {status.text}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-3xl bg-brand-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
