package controllers

import play.api._
import play.api.mvc._
import play.api.libs._
import play.api.libs.json._
import play.api.libs.concurrent.Execution.Implicits._
import models._

object Yukisaki extends Controller {

  /* ==================================================
   * getSectionList
   * ================================================== */
  private def _getSectionList(callback: String) = {
    Logger.debug("[getSectionList] start")
    YukisakiWS.getSectionListFuture.map { response =>
      Logger.debug("[getSectionList] ok")
      val js = Json.parse(response.body)
      if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
    } recover {
      case e: java.net.ConnectException =>
        Logger.debug("[getSectionList] error")
        Ok("[getSectionList] error")
    }
  }
  // GET用
  def getSectionList(callback: String) = Action.async { _getSectionList(callback) }
  // POST用
  def getSectionListByPost() = Action.async { _getSectionList("") }

  /* ==================================================
   * getYukisakiList
   * ================================================== */
  private def _getYukisakiList(callback: String) = {
    Logger.debug("[getYukisakiList] start")
    YukisakiWS.getYukisakiListFuture.map { response =>
      Logger.debug("[getYukisakiList] ok")
      val js = Json.parse(response.body)
      if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
    } recover {
      case e: java.net.ConnectException =>
        Logger.debug("[getYukisakiList] error")
        Ok("[getYukisakiList] error")
    }
  }
  // GET用
  def getYukisakiList(callback: String) = Action.async { _getYukisakiList(callback) }
  // POST用
  def getYukisakiListByPost() = Action.async { _getYukisakiList("") }

  /* ==================================================
   * updateYukisaki
   * ================================================== */
  private def _updateYukisaki(UserID: String, StatusCD: String, Jotai: String, Yukisaki: String, Nichiji: String, callback: String) = {
    Logger.debug("[updateYukisaki] start")
    YukisakiWS.updateYukisakiFuture(UserID, StatusCD, Jotai, Yukisaki, Nichiji).map { response =>
      Logger.debug("[updateYukisaki] ok")
      val js = Json.parse(response.body)
      if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
    } recover {
      case e: java.net.ConnectException =>
        Logger.debug("[updateYukisaki] error")
        Ok("[updateYukisaki] error")
    }
  }
  // GET用
  def updateYukisaki(UserID: String, StatusCD: String, Jotai: String, Yukisaki: String, Nichiji: String, callback: String) = Action.async {
    _updateYukisaki(UserID, StatusCD, Jotai, Yukisaki, Nichiji, callback)
  }
  // POST用
  def updateYukisakiByPost() = Action.async(parse.json) { request =>
    val UserID = request.body.\("UserID").asOpt[String].getOrElse("")
    val StatusCD = request.body.\("StatusCD").asOpt[String].getOrElse("")
    val Jotai = request.body.\("Jotai").asOpt[String].getOrElse("")
    val Yukisaki = request.body.\("Yukisaki").asOpt[String].getOrElse("")
    val Nichiji = request.body.\("Nichiji").asOpt[String].getOrElse("")
    _updateYukisaki(UserID, StatusCD, Jotai, Yukisaki, Nichiji, "")
  }

  def socket = WebSocket.async[JsValue] { request =>
    YukisakiWS.join
  }

}
