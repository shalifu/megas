import { useEffect, useState } from 'react';
import api from '../../services/api';

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/client/orders').then((response) => setOrders(response.data.orders)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">My orders</h2>
        <p className="mt-2 text-slate-400">Review active projects, budgets, and delivery status.</p>
      </div>
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">{order.project_type}</p>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{order.status}</span>
            </div>
            <p className="mt-3 text-slate-400">{order.description}</p>
            <p className="mt-4 text-sm text-slate-500">Budget: ${order.budget}</p>
          </div>
        ))}
        {orders.length === 0 && <p className="text-slate-400">You have no orders yet.</p>}
      </div>
    </div>
  );
}

export default MyOrders;
