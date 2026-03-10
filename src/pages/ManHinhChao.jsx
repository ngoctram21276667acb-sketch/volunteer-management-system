import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManHinhChao.css";

function ManHinhChao() {
  const navigate = useNavigate();

  // Tự chuyển sang màn hình giới thiệu sau 2.5 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/gioi-thieu");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="logo-circle">🤝</div>

      <h1 className="app-name">Volunteer Matching</h1>

      <p className="slogan">
        Kết nối đam mê <br /> Lan tỏa giá trị
      </p>
    </div>
  );
}

export default ManHinhChao;
