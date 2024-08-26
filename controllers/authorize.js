export const authorize = (req, res, next) => {

    const accessToken = req.cookies.accessToken

try {
    if (!accessToken) return res.status(403).json({message: "Access Denied"})
    
    const verified = jwt.verify(accessToken, process.env.JWTKEY)
    req.user = verified
    next()

} catch (error) {
    res.clearCookie('accessToken')
}
    
} 