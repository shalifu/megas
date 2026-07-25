import ChatPanel from '../../components/ChatPanel';

function PreAdminChat() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Team chat</h2>
        <p className="mt-2 text-slate-400">Connect with admins and other pre-admins to align on priorities.</p>
      </div>
      <ChatPanel />
    </div>
  );
}

export default PreAdminChat;
