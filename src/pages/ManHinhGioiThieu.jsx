import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManHinhGioiThieu.css'; // Kết nối file CSS ở cùng thư mục

function ManHinhGioiThieu() {
  const navigate = useNavigate();
  const handleStart = () => {
    navigate('/chon-vai-tro'); 
  };
  return (
    <div className="intro-container">
      <h1 className="intro-title">Volunteer <span>Matching</span></h1>
      <p className="intro-subtitle">Kết nối sức trẻ và chuyên môn đến cộng đồng</p>

      <div className="intro-features">
        <div className="feature-card">
          <h3>Tìm kiếm dễ dàng</h3>
          <p>Hàng ngàn chiến dịch tình nguyện từ các tổ chức uy tín đang chờ bạn.</p>
        </div>

        <div className="feature-card" style={{borderTopColor: '#3b82f6'}}>
          <h3>Làm đúng việc</h3>
          <p>Hệ thống matching theo kỹ năng giúp bạn trao đúng giá trị.</p>
        </div>

        <div className="feature-card" style={{borderTopColor: '#8b5cf6'}}>
          <h3>Ghi nhận đóng góp</h3>
          <p>Nhận chứng nhận điện tử sau khi hoàn thành hoạt động.</p>
        </div>
      </div>

      <button className="start-button" onClick={handleStart}>
  Bắt đầu ngay
</button>
    </div>
  );
}

export default ManHinhGioiThieu;