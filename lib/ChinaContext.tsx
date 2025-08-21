import React, { createContext, useContext, useState } from "react";

export type ChinaContextType = {
  chinaId?: string;
  chinaName?: string;
  chinaEmail?: string;
  chinaRole?: string;
  setChina: (data: { chinaId?: string; chinaName?: string; chinaEmail?: string; chinaRole?: string }) => void;
};

const ChinaContext = createContext<ChinaContextType | undefined>(undefined);

export const useChinaContext = () => {
  const context = useContext(ChinaContext);
  if (!context) throw new Error("useChinaContext must be used within a ChinaProvider");
  return context;
};

export const ChinaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chinaId, setChinaId] = useState<string | undefined>(undefined);
  const [chinaName, setChinaName] = useState<string | undefined>(undefined);
  const [chinaEmail, setChinaEmail] = useState<string | undefined>(undefined);
  const [chinaRole, setChinaRole] = useState<string | undefined>(undefined);

  const setChina = (data: { chinaId?: string; chinaName?: string; chinaEmail?: string; chinaRole?: string }) => {
    if (data.chinaId !== undefined) setChinaId(data.chinaId);
    if (data.chinaName !== undefined) setChinaName(data.chinaName);
    if (data.chinaEmail !== undefined) setChinaEmail(data.chinaEmail);
    if (data.chinaRole !== undefined) setChinaRole(data.chinaRole);
  };

  return (
    <ChinaContext.Provider value={{ chinaId, chinaName, chinaEmail, chinaRole, setChina }}>
      {children}
    </ChinaContext.Provider>
  );
};
