package models

import akka.actor._
import scala.concurrent.duration._
import scala.language.postfixOps

import play.api._
import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.concurrent._

import akka.util.Timeout
import akka.pattern.ask

import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._

import play.api.libs.ws._
import scala.concurrent.Future

object AutoRefresh {

  def apply(ws: ActorRef) {

    // Create an Iteratee that logs all messages to the console.
    val loggerIteratee = Iteratee.foreach[JsValue](event => Logger("AutoRefresh").info(event.toString))

    implicit val timeout = Timeout(1 second)
    // Make the robot join the room
    (ws ? Join).map {
      case Connected(channel) =>
        // Apply this Enumerator on the logger.
        channel |>> loggerIteratee
    }

    // Reget every 20 seconds
    Akka.system.scheduler.schedule(
      5 seconds, // start
      20 seconds, // interval
      ws,
      Reget)
  }

}

object YukisakiWS {

  implicit val timeout = Timeout(1 second)

  private val ws = Akka.system.actorOf(Props[YukisakiWS])
  
  lazy val default = {
//    val ws = Akka.system.actorOf(Props[YukisakiWS])
    // Create AutoRefresh
    AutoRefresh(ws)
    ws
  }

  private var res = ""
  def checkUpdate(data: String) = {
    val isUpdate = (res != data)
    res = data
    isUpdate
  }

  def join(): scala.concurrent.Future[(Iteratee[JsValue, _], Enumerator[JsValue])] = {

    (default ? Join).map {
      case Connected(enumerator) =>
        // Create an Iteratee to consume the feed
        val iteratee = Iteratee.foreach[JsValue] { js =>
          //default ! Talk(js)
        }.map { _ =>
          //default ! Quit(username)
        }
        (iteratee, enumerator)
    }
  }

  def updateNotify() = {
    ws ? Reget
  }

  def getSectionListFuture: Future[Response] = {
    WS.url(play.Configuration.root.getString("yukisakiWebServicePath") + "WebService.asmx/GetSectionList").post(Json.obj())
  }
  def getYukisakiListFuture: Future[Response] = {
    WS.url(play.Configuration.root.getString("yukisakiWebServicePath") + "WebService.asmx/GetYukisakiList").post(Json.obj())
  }
  def updateYukisakiFuture(UserID: String, StatusCD: String, Jotai: String, Yukisaki: String, Nichiji: String): Future[Response] = {
    WS.url(play.Configuration.root.getString("yukisakiWebServicePath") + "WebService.asmx/UpdateYukisaki").post(Json.obj(
      "UserID" -> UserID,
      "StatusCD" -> StatusCD,
      "Jotai" -> Jotai,
      "Yukisaki" -> Yukisaki,
      "Nichiji" -> Nichiji))
  }
}

class YukisakiWS extends Actor {

  val (chatEnumerator, channel) = Concurrent.broadcast[JsValue]

  def receive = {
    case Join => {
      sender ! Connected(chatEnumerator)
    }
    case Reget => {
      YukisakiWS.getYukisakiListFuture.map { response =>
        Logger.debug("[YukisakiWS] Reget ok")
        if (YukisakiWS.checkUpdate(response.body)) {
          // 更新があった場合だけ通知
          notifyAll(Json.parse(response.body))
        }
      }
    }
  }

  private def notifyAll(js: JsValue) {
    Logger.debug("[YukisakiWS] notifyAll")
    channel.push(js)
  }

}

case class Join()
case class Reget()
case class Connected(enumerator: Enumerator[JsValue])
