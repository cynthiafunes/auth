function checkRole(roleRequired) {
    return (req, res, next) => {
      if (req.headers.authorization) {
        if (req.user.role !== roleRequired) {
          return res.status(403).json({ 
            message: 'No tenes permiso para acceder a esta ruta' 
          });
        }
      }
      else if (req.session.userRole) {
        if (req.session.userRole !== roleRequired) {
          return res.status(403).json({ 
            message: 'No tenes permiso para acceder a esta ruta' 
          });
        }
      } else {
        return res.status(401).json({ 
          message: 'No iniciaste sesión' 
        });
      }
      
      next();
    };
  }
  
  module.exports = checkRole;