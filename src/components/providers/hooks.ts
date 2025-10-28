import { useContext } from "react";
import { ClientProviderContext } from "./ClientProvider";

export const useClient = () => {
  const context = useContext(ClientProviderContext);
  if (!context) {
    throw new Error("useClientDispatch must be used within a ClientProvider");
  }
  return context;
};
