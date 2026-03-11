export function requireRole(session, role){

 if(!session || session.user.role !== role){
  throw new Error("Unauthorized")
 }

}