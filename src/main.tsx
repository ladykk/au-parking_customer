import React from "react";
import ReactDOM from "react-dom";
import MyApp from "./app";
import { AuthProvider } from "./contexts/auth";
import { LiffProvider } from "./contexts/liff";

ReactDOM.render(
  <React.StrictMode>
    <LiffProvider>
      <AuthProvider>
        <MyApp />
      </AuthProvider>
    </LiffProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
