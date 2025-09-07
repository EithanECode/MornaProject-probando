import React, { createContext, useContext, useState } from "react";

export type AdminContextType = {
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  userImage?: string;
  setAdmin: (data: { adminId?: string; adminName?: string; adminEmail?: string; userImage?: string }) => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminContext must be used within an AdminProvider");
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminId, setAdminId] = useState<string | undefined>(undefined);
  const [adminName, setAdminName] = useState<string | undefined>(undefined);
  const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);

  const setAdmin = (data: { adminId?: string; adminName?: string; adminEmail?: string; userImage?: string }) => {
    if (data.adminId !== undefined) setAdminId(data.adminId);
    if (data.adminName !== undefined) setAdminName(data.adminName);
    if (data.adminEmail !== undefined) setAdminEmail(data.adminEmail);
    if (data.userImage !== undefined) setUserImage(data.userImage);
  };

  return (
    <AdminContext.Provider value={{ adminId, adminName, adminEmail, userImage, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};
