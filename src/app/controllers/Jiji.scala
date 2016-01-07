package controllers

import play.api._
import play.api.mvc._
import play.api.libs._
import play.api.libs.json._
import models.JijiData._

object Jiji extends Controller {

  class Result(val Status: Int, val Message: String) {
  }
  object Result {
    val StatusOK = 0
    val StatusError = -1
  }

  implicit object ResultWrites extends Writes[Result] {
    def writes(e: Result): JsValue = {
      Json.obj(
        "Status" -> e.Status,
        "Message" -> e.Message)
    }
  }

  implicit object JijiObjectWrites extends Writes[JijiObject] {
    def writes(e: JijiObject): JsValue = {
      Json.obj(
        "UserID" -> e.id,
        "IpAddress" -> e.ipAddress,
        "Action1" -> e.action1,
        "Action2" -> e.action2,
        "Log" -> e.log)
    }
  }

  /* ==================================================
   * getJiji
   * ================================================== */
  private def _getJiji(UserID: String, callback: String) = {
    Logger.debug("[getJiji] start")

    // DB Select
    val jiji = getJijiData(UserID)

    Logger.debug("[getJiji] ok")
    val js = Json.toJson(jiji)
    if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
  }
  // GET用
  def getJiji(UserID: String, callback: String) = Action {
    _getJiji(UserID, callback)
  }
  // POST用
  def getJijiByPost() = Action(parse.json) { request =>
    val UserID = request.body.\("UserID").asOpt[String].getOrElse("")
    _getJiji(UserID, "")
  }

  /* ==================================================
   * setJiji
   * ================================================== */
  private def _setJiji(UserID: String, IpAddress: String, Action1: String, Action2: String, callback: String) = {
    Logger.debug("[setJiji] start")

    val res = try {
      // DB Update
      val isUpdate = setJijiData(UserID, IpAddress, Action1, Action2)
      // Return Result
      new Result(Result.StatusOK, "Success")
    } catch {
      case e: Exception => new Result(Result.StatusError, e.getMessage())
    }

    Logger.debug("[setJiji] ok")
    val js = Json.toJson(res)
    if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
  }
  // GET用
  def setJiji(UserID: String, IpAddress: String, Action1: String, Action2: String, callback: String) = Action {
    _setJiji(UserID, IpAddress, Action1, Action2, callback)
  }
  // POST用
  def setJijiByPost() = Action(parse.json) { request =>
    val UserID = request.body.\("UserID").asOpt[String].getOrElse("")
    val IpAddress = request.body.\("IpAddress").asOpt[String].getOrElse("")
    val Action1 = request.body.\("Action1").asOpt[String].getOrElse("")
    val Action2 = request.body.\("Action2").asOpt[String].getOrElse("")
    _setJiji(UserID, IpAddress, Action1, Action2, "")
  }

  /* ==================================================
   * checkPing
   * ================================================== */
  private def _checkPing(IpAddress: String, callback: String) = {
    Logger.debug("[checkPing] start" + IpAddress)

    val proc = Runtime.getRuntime().exec("ping -n 1 -w 200 " + IpAddress)
    proc.waitFor()
    val ev = proc.exitValue()
    // val isReachable = java.net.InetAddress.getByName(IpAddress).isReachable(1000)
    val status = if (ev == 0) Result.StatusOK else Result.StatusError
    val message = if (ev == 0) "Ping成功 （Success）" else "Ping失敗 （TimedOut）"

    Logger.debug("[checkPing] ok : " + ev.toString())
    val js = Json.toJson(new Result(status, message))
    if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
  }
  // GET用
  def checkPing(IpAddress: String, callback: String) = Action {
    _checkPing(IpAddress, callback)
  }
  // POST用
  def checkPingByPost() = Action(parse.json) { request =>
    val IpAddress = request.body.\("IpAddress").asOpt[String].getOrElse("")
    _checkPing(IpAddress, "")
  }
}
