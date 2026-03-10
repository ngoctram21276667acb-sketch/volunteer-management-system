import { useNavigate } from "react-router-dom";
function ChonVaiTro() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h2>Bạn là ai?</h2>

      <button 
  style={styles.button} 
  onClick={() => navigate("/register", { state: { role: 'volunteer' } })}
>
  Tôi là Tình nguyện viên
</button>

<button 
  style={styles.button} 
  onClick={() => navigate("/register", { state: { role: 'organization' } })}
>
  Tôi là Tổ chức xã hội
</button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",      
    backgroundColor: "#f1f5f9", 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",     
    justifyContent: "center", 
    padding: "20px",         
  },

  title: {
    fontSize: "36px",        
    fontWeight: "800",
    marginBottom: "60px",    
    color: "#1e293b",
    letterSpacing: "-0.5px",
  },

  container: {
    display: "flex",
    gap: "40px",              
    flexWrap: "wrap",         
    justifyContent: "center",
  },

  button: {
    width: "300px",           
    height: "200px",
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffffff",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", 
    border: "none",
    borderRadius: "28px",     
    cursor: "pointer",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    textAlign: "center",
  },
};

export default ChonVaiTro;
