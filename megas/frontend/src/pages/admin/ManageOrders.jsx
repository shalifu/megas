import { useEffect, useState } from 'react';
import api from '../../services/api';

function ManageOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-white">Website & software orders</h2>
        <p className="mt-2 text-slate-400">Review incoming project requests and update order progress.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">{order.project_type}</p>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{order.status}</span>
            </div>
            <p className="mt-3 text-slate-400">{order.description}</p>
            <p className="mt-4 text-sm text-slate-500">Client: {order.client_name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['pending', 'in_progress', 'completed', 'rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateStatus(order.id, status)}
                  className="rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageOrders;
