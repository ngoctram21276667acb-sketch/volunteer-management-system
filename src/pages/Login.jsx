import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; //lấy dữ liệu đăng nhập dùng chung cho cả app


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {user, login} = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "volunteer") {
        navigate("/home-volunteer");
      } else if (user.role === "organization") {
        navigate("/dashboard-org");
      }
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      alert("Đăng nhập thành công!");
      login(data.user);
      // lưu token nếu cần
      // localStorage.setItem("token", data.user.token);

      // chuyển trang theo role
      // if (data.user.role === "volunteer") {
      //   navigate("/home-volunteer");
      // } else {
      //   navigate("/dashboard-org");
      // }

    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Đăng nhập</h2>

      <input placeholder="Email hoặc SĐT" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />

      {/* Thêm lựa chọn đăng nhập bằng Google/Facebook. Optional */}

      <button style={styles.button} onClick={handleLogin}>
        Đăng nhập
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    maxWidth: "400px",
    margin: "auto",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  },
  button: {
    width: "100%",
    padding: "10px",
  },
};

export default Login;
