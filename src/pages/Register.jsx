import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'volunteer';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    skills: ''
  });

  // ===== FORMAT FUNCTIONS =====

  const formatEmail = (email) => {
    return email.trim().toLowerCase();
  };

  const formatPassword = (password) => {
    return password.trim();
  };

  // ===== VALIDATE FUNCTIONS =====

  const validateEmail = (email) => {
    const regex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=]).{8,}$/;
    return regex.test(password);
  };

  // ===== HANDLE INPUT =====

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ===== REGISTER =====

  const handleRegister = async () => {

    if (!formData.email || !formData.password || !formData.fullName) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const formattedData = {
      ...formData,
      email: formatEmail(formData.email),
      password: formatPassword(formData.password),
      role
    };

    if (!validateEmail(formattedData.email)) {
      alert("Email không đúng định dạng!");
      return;
    }

    if (!validatePassword(formattedData.password)) {
      alert(
        "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
      );
      return;
    }

    try {

      const response = await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      alert("Đăng ký thành công!");
      console.log("Response:", data);

      navigate('/login');

    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: '#10b981'}}>Tạo tài khoản mới</h2>

      <p>
        Bạn đang đăng ký với tư cách là <b>
          {role === 'volunteer' ? 'Tình nguyện viên' : 'Tổ chức xã hội'}
        </b>
      </p>

      <div style={styles.form}>

        <input
          name="fullName"
          placeholder="Họ và tên / Tên tổ chức"
          style={styles.input}
          value={formData.fullName}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          style={styles.input}
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          style={styles.input}
          value={formData.password}
          onChange={handleChange}
        />

        <input
          name="skills"
          placeholder={
            role === 'volunteer'
              ? "Kỹ năng (ví dụ: IT, Dạy học...)"
              : "Lĩnh vực hoạt động"
          }
          style={styles.input}
          value={formData.skills}
          onChange={handleChange}
        />

        <button style={styles.button} onClick={handleRegister}>
          Đăng ký ngay
        </button>

      </div>

      <p
        onClick={() => navigate('/login')}
        style={{
          cursor: 'pointer',
          color: '#3b82f6',
          marginTop: '15px'
        }}
      >
        Đã có tài khoản? Đăng nhập
      </p>

    </div>
  );
}

const styles = {
  container: {
    padding: '50px',
    textAlign: 'center',
    maxWidth: '400px',
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },

  form: {
    marginTop: '20px'
  },

  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    boxSizing: 'border-box'
  },

  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Register;