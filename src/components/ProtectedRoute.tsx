import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token'); // Check if the user is logged in
  const role = localStorage.getItem('role'); // Check the user's role

  if (!token || role !== 'admin') {
    // Redirect to login if not logged in or not an admin
    return <Navigate to="/Login" />;
  }

  return children; // Render the protected component
};

export default ProtectedRoute;