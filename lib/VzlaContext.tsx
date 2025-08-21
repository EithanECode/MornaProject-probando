import React, { createContext, useContext, useState } from "react";

export type VzlaContextType = {
  vzlaId?: string;
  vzlaName?: string;
  vzlaEmail?: string;
  vzlaRole?: string;
  setVzla: (data: { vzlaId?: string; vzlaName?: string; vzlaEmail?: string; vzlaRole?: string }) => void;
};

const VzlaContext = createContext<VzlaContextType | undefined>(undefined);

export const useVzlaContext = () => {
  const context = useContext(VzlaContext);
  if (!context) throw new Error("useVzlaContext must be used within a VzlaProvider");
  return context;
};

export const VzlaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vzlaId, setVzlaId] = useState<string | undefined>(undefined);
  const [vzlaName, setVzlaName] = useState<string | undefined>(undefined);
  const [vzlaEmail, setVzlaEmail] = useState<string | undefined>(undefined);
  const [vzlaRole, setVzlaRole] = useState<string | undefined>(undefined);

  const setVzla = (data: { vzlaId?: string; vzlaName?: string; vzlaEmail?: string; vzlaRole?: string }) => {
    if (data.vzlaId !== undefined) setVzlaId(data.vzlaId);
    if (data.vzlaName !== undefined) setVzlaName(data.vzlaName);
    if (data.vzlaEmail !== undefined) setVzlaEmail(data.vzlaEmail);
    if (data.vzlaRole !== undefined) setVzlaRole(data.vzlaRole);
  };

  return (
    <VzlaContext.Provider value={{ vzlaId, vzlaName, vzlaEmail, vzlaRole, setVzla }}>
      {children}
    </VzlaContext.Provider>
  );
};
