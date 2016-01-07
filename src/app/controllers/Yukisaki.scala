package controllers

import play.api._
import play.api.mvc._
import play.api.libs._
import play.api.libs.json._
import play.api.libs.ws._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext._
import play.api.libs.concurrent.Execution.Implicits._
// import play.api.data.Form
// import play.api.data.Forms._
// import play.api.libs.functional.syntax._

object Yukisaki extends Controller {

  /* ==================================================
   * getSectionList
   * ================================================== */
  private def _getSectionList(callback: String) = {
    Logger.debug("[getSectionList] start")
    val result: Future[Response] = WS.url("http://yukisaki/WebService.asmx/GetSectionList").post(Json.obj())
    result.map { response =>
      Logger.debug("[getSectionList] ok")
      val js = Json.parse(response.body)
      if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
    } recover {
      case e: java.net.ConnectException => Ok("[getSectionList] error")
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
    val result: Future[Response] = WS.url("http://yukisaki/WebService.asmx/GetYukisakiList").post(Json.obj())
    result.map { response =>
      Logger.debug("[getYukisakiList] ok")
      val js = Json.parse(response.body)
      if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
    } recover {
      case e: java.net.ConnectException => Ok("[getYukisakiList] error")
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
    val result: Future[Response] = WS.url("http://yukisaki/WebService.asmx/UpdateYukisaki").post(Json.obj(
      "UserID" -> UserID,
      "StatusCD" -> StatusCD,
      "Jotai" -> Jotai,
      "Yukisaki" -> Yukisaki,
      "Nichiji" -> Nichiji))

    result.map { response =>
      Logger.debug("[updateYukisaki] ok")
      val js = Json.parse(response.body)
      if (callback == "") Ok(js) else Ok(Jsonp(callback, js))
    } recover {
      case e: java.net.ConnectException => Ok("[updateYukisaki] error")
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

}
