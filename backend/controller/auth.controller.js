const { writeFile, readFile, genId } = require("../utils/fileStore.js");
const jwt = require("jsonwebtoken");
// JWT_SECRET = "secret";
const JWT_SECRET = "secret";

// Đăng ký người dùng mới.
const register = async (req, res) => {
    try {
      const { fullName, email, password, skills } = req.body;
      const role = req.body.role || "volunteer";
  
      console.log("req.body", req.body);
      // Load file users.json. Trong tương lai có thể sử dụng database.
      const users = readFile("users.json") || [];
        
      // Kiểm tra người dùng đã tồn tại hay chưa bằng cách so sánh email.
      // Nếu tồn tại, trả về lỗi 400 và thông báo "Email đã tồn tại".
      const existed = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existed) {
        return res.status(400).json({ success: false, message: "Email đã tồn tại" });
      }
  
      // Tạo người dùng mới nếu chưa tồn tại
      const user = {
        _id: genId(),
        fullName:  fullName,
        email,
        password,
        role: role,
        skills: skills,
      };

      // Ghi người dùng mới vào file users.json.
      writeFile("users.json", [...users, user]);

      // Trả về người dùng mới nếu đăng ký thành công.
      const { password: _, ...safeUser } = user;
  
      res.json({
        success: true,
        message: "Đăng ký thành công",
        user: safeUser
      });
  
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const users = readFile("users.json") || [];
      const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password);
  
      if (!user) {
        return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
      }
  
      const token = jwt.sign(
        { id: user._id, _id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
  
      const { password: _, ...safeUser } = user;
      console.log("Login user: ", safeUser);
      
      res.json({
        success: true,
        user: { ...safeUser, token },
      });
  
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
  register,
  login
};