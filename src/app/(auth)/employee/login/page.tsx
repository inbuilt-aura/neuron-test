"use client";

import type React from "react";
import EmployeeLoginForm from "../../../../components/employee-login-form";
import PublicRoute from "../../../../components/PublicRoute";

const EmployeeLoginPage: React.FC = () => {
  return (
    <PublicRoute>
      <EmployeeLoginForm />
    </PublicRoute>
  );
};

export default EmployeeLoginPage;
