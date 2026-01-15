// App.js

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <YourRoutes />
    </GoogleOAuthProvider>
  );
}

export default App;





// ------------LoginPage.jsx'
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function LoginPage() {
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        credential: credentialResponse.credential,
      });
console.log('========res===========',res);

      // backend returns JWT + user info
      const { token, user } = res.data;
      localStorage.setItem("token", token);

      console.log("User Logged In:", user);
    } catch (err) {
      console.error("Google login error:", err);
      console.log('========res===========',err);

    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export { LoginPage };
