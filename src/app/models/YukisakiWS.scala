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

object AutoRefresh {

  def apply(ws: ActorRef) {

    // Create an Iteratee that logs all messages to the console.
    val loggerIteratee = Iteratee.foreach[JsValue](event => Logger("AutoRefresh").info(event.toString))

    implicit val timeout = Timeout(1 second)
    // Make the robot join the room
    ws ? (Join) map {
      case Connected(robotChannel) =>
        // Apply this Enumerator on the logger.
        robotChannel |>> loggerIteratee
    }

    // Make the robot talk every 30 seconds
    Akka.system.scheduler.schedule(
      20 seconds, // start
      20 seconds,  // interval
      ws,
      Talk(Json.toJson("{auto: \"I'm still alive\"}")))
  }

}

object YukisakiWS {

  implicit val timeout = Timeout(1 second)

  lazy val default = {
    val ws = Akka.system.actorOf(Props[YukisakiWS])
    // Create a bot user (just for fun)
    AutoRefresh(ws)
    ws
  }

  def join(): scala.concurrent.Future[(Iteratee[JsValue, _], Enumerator[JsValue])] = {

    (default ? Join).map {
      case Connected(enumerator) =>
        // Create an Iteratee to consume the feed
        val iteratee = Iteratee.foreach[JsValue] { js =>
          default ! Talk(js)
        }.map { _ =>
          //default ! Quit(username)
        }
        (iteratee, enumerator)
    }
  }

}

class YukisakiWS extends Actor {

  val (chatEnumerator, chatChannel) = Concurrent.broadcast[JsValue]

  def receive = {
    case Join => {
      sender ! Connected(chatEnumerator)
    }
    case Talk(js) => {
      //notifyAll(js)
      chatChannel.push(js)
    }
  }

  //  private def notifyAll(js: JsValue) {
  //    chatChannel.push(js)
  //  }

}

case class Join()
case class Talk(js: JsValue)
case class Connected(enumerator: Enumerator[JsValue])
