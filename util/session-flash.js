function getSessionData(req){
    const sessionData = req.session.getItem('sessionData');
    req.session.flashedData = null;
    return sessionData;
}
function flashDataToSession(req,data,action) {
   req.session.flashedData = data;
   req.session.save(action);
}
module.exports = {
  flashDataToSession: flashDataToSession,
  getSessionData: getSessionData
}