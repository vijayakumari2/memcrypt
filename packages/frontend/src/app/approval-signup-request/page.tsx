import { PendingApproval } from "@/components/pending-approval/PendingApproval";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";

const ApprovalSignupRequest = () => {
  return (
    <ProtectedRoute>
      <PendingApproval></PendingApproval>
    </ProtectedRoute>
  );
};

export default ApprovalSignupRequest;
