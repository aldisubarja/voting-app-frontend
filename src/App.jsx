import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Login from './pages/Login';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Vote from './pages/Vote';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user.role === 'admin' 
    ? children 
    : <Navigate to="/" />;
}

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function UserRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user.role === 'user' 
    ? children 
    : <Navigate to="/" />;
}

UserRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Layout>
                <Users />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/vote"
          element={
            <UserRoute>
              <Layout>
                <Vote />
              </Layout>
            </UserRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;