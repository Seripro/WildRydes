import { useEffect, useState } from "react";
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("signIn"); // 'signIn' | 'signUp' | 'confirm' | 'home'
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setView("home");
        }
      } catch (err) {
        // サインイン済みユーザーがいない場合は何もしない
        console.log(err);
      }
    })();
  }, []);

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

  const handleRideRequest = async () => {
    try {
      // Cognitoから現在の認証セッション（JWTトークン）を取得
      const session = await fetchAuthSession();
      const token = session.tokens.idToken.toString();

      // 先ほどメモしたAPI Gatewayの「呼び出しURL」に /ride を足したもの
      const apiUrl =
        "https://cutg0lmo7b.execute-api.ap-northeast-1.amazonaws.com/prod/ride";

      // バックエンドへPOSTリクエストを送信
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: token, // ここでJWTトークンを提示（関所を通過）
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PickupLocation: {
            Latitude: 47.6174755835663,
            Longitude: -122.28837066650185,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`APIリクエスト失敗: ${response.status}`);
      }

      const data = await response.json();
      alert(`${data.UnicornName} (${data.Unicorn.Color}) が配車されました！`);
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました。コンソールを確認してください。");
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

          {/* 【追加】配車ボタン */}
          <button
            onClick={handleRideRequest}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              cursor: "pointer",
              marginTop: "20px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            ユニコーンを呼ぶ！
          </button>

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
