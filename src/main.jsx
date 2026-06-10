import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// AWS Amplifyのインポート
import { Amplify } from "aws-amplify";

// Cognitoの接続設定
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-northeast-1_ygX2wGh7E",
      userPoolClientId: "6713ek5lthg80lv09dlu7bs5l8",
      region: "ap-northeast-1", // 東京リージョン
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
