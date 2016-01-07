package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {

  def index(develop: Boolean, mobile: Boolean) = Action { implicit request =>
    if (mobile) {
      Ok(views.html.mobile(develop))
    } else {
      Ok(views.html.index(develop))
    }
  }

  def map(id: String, mini: Boolean) = Action {
    if (mini) {
      Ok(views.html.mapmini(id))
    } else {
      Ok(views.html.map(id))
    }
  }

  def notFound(hoge: String) = Action {
    Redirect("/")
  }

}
