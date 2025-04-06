import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next) {
const token = req.cookies.token;
if (!token) {
return res.status(401).json({ message: 'No token provided' });
}

jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt', (err, user) => {
    if (err) {
        return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
});

}

export { authenticateToken };