import DasboardComponent from "@/components/dashboard/Dahsboard";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DasboardComponent />
    </ProtectedRoute>
  );
};

export default Dashboard;
