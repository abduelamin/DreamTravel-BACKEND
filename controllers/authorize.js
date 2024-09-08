import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const authorize = (req, res, next) => {

    const accessToken = req.cookies.accessToken

try {
    if (!accessToken) return res.status(403).json({message: "Access Denied"})
    
    const verified = jwt.verify(accessToken, process.env.JWTKEY)
    req.user = verified
    next()

} catch (error) {
    console.error('Authorization failed:', error);
    res.clearCookie('accessToken')
    return res.status(401).json({ message: "Unauthorized as token is missing" });
}
    
} 