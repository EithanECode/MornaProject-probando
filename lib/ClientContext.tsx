
"use client";
import React, { createContext, useContext, useState } from "react";

export type ClientContextType = {
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientRole?: string;
  setClient: (data: {
    clientId?: string;
    clientName?: string;
    clientEmail?: string;
    clientRole?: string;
  }) => void;
};


const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) throw new Error("useClientContext must be used within a ClientProvider");
  return context;
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState<string | undefined>(undefined);
  const [clientEmail, setClientEmail] = useState<string | undefined>(undefined);
  const [clientRole, setClientRole] = useState<string | undefined>(undefined);

  const setClient = (data: {
    clientId?: string;
    clientName?: string;
    clientEmail?: string;
    clientRole?: string;
  }) => {
    if (data.clientId !== undefined) setClientId(data.clientId);
    if (data.clientName !== undefined) setClientName(data.clientName);
    if (data.clientEmail !== undefined) setClientEmail(data.clientEmail);
    if (data.clientRole !== undefined) setClientRole(data.clientRole);
  };

  return (
    <ClientContext.Provider value={{
      clientId,
      clientName,
      clientEmail,
      clientRole,
      setClient
    }}>
      {children}
    </ClientContext.Provider>
  );
};
