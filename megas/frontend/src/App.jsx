import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageJobs from './pages/admin/ManageJobs';
import AdminChat from './pages/admin/AdminChat';
import AdminTasks from './pages/admin/AdminTasks';
import ManageChefApplications from './pages/admin/ManageChefApplications';
import ChefChatPanel from './components/ChefChatPanel';
import ClientDashboard from './pages/client/ClientDashboard';
import MyOrders from './pages/client/MyOrders';
import NewOrder from './pages/client/NewOrder';
import AppliedJobs from './pages/client/AppliedJobs';
import NewApplication from './pages/client/NewApplication';
import ClientChat from './pages/client/ClientChat';
import Profile from './pages/client/Profile';
import PreAdminDashboard from './pages/preadmin/PreAdminDashboard';
import ChefApplication from './pages/preadmin/ChefApplication';
import PreAdminTasks from './pages/preadmin/PreAdminTasks';
import PreAdminChat from './pages/preadmin/PreAdminChat';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="careers" element={<Careers />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
            <Route path="admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><ManageOrders /></ProtectedRoute>} />
            <Route path="admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><ManageJobs /></ProtectedRoute>} />
            <Route path="admin/chef-applications" element={<ProtectedRoute allowedRoles={['admin']}><ManageChefApplications /></ProtectedRoute>} />
            <Route path="admin/create-chef-application" element={<ProtectedRoute allowedRoles={['admin']}><ChefApplication /></ProtectedRoute>} />
            <Route path="admin/chef-chat" element={<ProtectedRoute allowedRoles={['admin']}><ChefChatPanel /></ProtectedRoute>} />
            <Route path="admin/tasks" element={<ProtectedRoute allowedRoles={['admin']}><AdminTasks /></ProtectedRoute>} />
            <Route path="admin/chat" element={<ProtectedRoute allowedRoles={['admin']}><AdminChat /></ProtectedRoute>} />
            <Route path="client" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
            <Route path="client/orders" element={<ProtectedRoute allowedRoles={['client']}><MyOrders /></ProtectedRoute>} />
            <Route path="client/new-order" element={<ProtectedRoute allowedRoles={['client']}><NewOrder /></ProtectedRoute>} />
            <Route path="client/applications" element={<ProtectedRoute allowedRoles={['client']}><AppliedJobs /></ProtectedRoute>} />
            <Route path="client/new-application" element={<ProtectedRoute allowedRoles={['client']}><NewApplication /></ProtectedRoute>} />
            <Route path="client/chat" element={<ProtectedRoute allowedRoles={['client']}><ClientChat /></ProtectedRoute>} />
            <Route path="client/profile" element={<ProtectedRoute allowedRoles={['client']}><Profile /></ProtectedRoute>} />
            <Route path="preadmin" element={<ProtectedRoute allowedRoles={['preadmin']}><PreAdminDashboard /></ProtectedRoute>} />
            <Route path="preadmin/tasks" element={<ProtectedRoute allowedRoles={['preadmin']}><PreAdminTasks /></ProtectedRoute>} />
            <Route path="preadmin/chat" element={<ProtectedRoute allowedRoles={['preadmin']}><PreAdminChat /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
