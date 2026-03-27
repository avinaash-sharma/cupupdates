import React, { createContext, useCallback, useContext, useState } from 'react';

interface WebViewContextValue {
  openUrl: (url: string) => void;
}

const WebViewContext = createContext<WebViewContextValue>({ openUrl: () => {} });

export const useWebView = () => useContext(WebViewContext);

interface WebViewState {
  url: string;
  visible: boolean;
}

interface WebViewProviderProps {
  children: React.ReactNode;
  /** Render the modal — injected from App.tsx to avoid circular deps */
  renderModal: (state: WebViewState, onClose: () => void) => React.ReactNode;
}

export const WebViewProvider: React.FC<WebViewProviderProps> = ({ children, renderModal }) => {
  const [state, setState] = useState<WebViewState>({ url: '', visible: false });

  const openUrl = useCallback((url: string) => {
    setState({ url, visible: true });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  return (
    <WebViewContext.Provider value={{ openUrl }}>
      {children}
      {renderModal(state, handleClose)}
    </WebViewContext.Provider>
  );
};
