import { useState } from "react";
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
} from "aws-amplify/auth";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("signIn"); // 'signIn' | 'signUp' | 'confirm' | 'home'
  const [error, setError] = useState("");

  // 1. サインアップ（新規登録）
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signUp({
        username: email,
        password: password,
        options: { userAttributes: { email } },
      });
      alert("確認メールを送信しました。コードを入力してください。");
      setView("confirm"); // メール確認画面へ切り替え
    } catch (err) {
      setError(err.message);
    }
  };

  // 2. サインアップの確認（認証コード送信）
  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await confirmSignUp({ username: email, confirmationCode: authCode });
      alert("アカウントが確認されました！ログインしてください。");
      setView("signIn");
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. サインイン（ログイン）
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { isSignedIn } = await signIn({ username: email, password });
      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setView("home"); // ログイン後のホーム画面へ
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 4. サインアウト（ログアウト）
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setEmail("");
      setPassword("");
      setView("signIn");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>WildRydes Auth</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ログイン画面 */}
      {view === "signIn" && (
        <form onSubmit={handleSignIn}>
          <h2>ログイン</h2>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            ログイン
          </button>
          <p
            onClick={() => setView("signUp")}
            style={{
              color: "#0070f3",
              cursor: "pointer",
              textAlign: "center",
              marginTop: "15px",
            }}
          >
            新規登録はこちら
          </p>
        </form>
      )}

      {/* 新規登録画面 */}
      {view === "signUp" && (
        <form onSubmit={handleSignUp}>
          <h2>アカウント作成</h2>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#22c55e",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            登録する
          </button>
          <p
            onClick={() => setView("signIn")}
            style={{
              color: "#0070f3",
              cursor: "pointer",
              textAlign: "center",
              marginTop: "15px",
            }}
          >
            ログイン画面に戻る
          </p>
        </form>
      )}

      {/* メール確認コード入力画面 */}
      {view === "confirm" && (
        <form onSubmit={handleConfirmSignUp}>
          <h2>確認コードの入力</h2>
          <p>{email} 宛に届いたコードを入力してください。</p>
          <input
            type="text"
            placeholder="6桁のコード"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#ea580c",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            認証を完了する
          </button>
        </form>
      )}

      {/* ログイン後の画面 */}
      {view === "home" && (
        <div>
          <h2>ログイン成功！</h2>
          <p>
            ようこそ、あなたのユーザーIDは: <br />
            <strong>{user?.userId}</strong> です。
          </p>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
