import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Not Authorized Login Again" });
    }

    // 1. Decode the token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Check if the decoded payload matches the admin credentials 
    // This assumes your login controller stores the email/password combo as the 'id' or 'sub'
    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
       return res.json({ success: false, message: "Not Authorized Login Again" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Session Expired. Please Login Again" });
  }
};

export default adminAuth;