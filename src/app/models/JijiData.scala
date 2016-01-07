package models

import play.api.db._
import play.api.Play.current
import scala.collection.mutable.ListBuffer
import java.text.SimpleDateFormat
import anorm._
import anorm.SqlParser._

object JijiData {

  case class JijiObject(var id: String = "", var ipAddress: String = "", var action1: String = "0", var action2: String = "0") {
    var log = ListBuffer[String]()
  }

  object JijiObject {
    val data = {
      get[String]("USERID") ~
        get[String]("IPADDRESS") ~
        get[String]("ACTION1") ~
        get[String]("ACTION2") map {
          case id ~ ipaddress ~ action1 ~ action2 => JijiObject(id, ipaddress, action1, action2)
        }
    }

    val log = {
      get[String]("USERID") ~
        get[String]("UPDATESTATUSCD") ~
        get[String]("UPDATEYMD") map {
          case id ~ "1" ~ t => formatDbTime(t) + "　【社内】に変更しました"
          case id ~ "2" ~ t => formatDbTime(t) + "　【社外】に変更しました"
          case id ~ "3" ~ t => formatDbTime(t) + "　【休暇】に変更しました"
          case id ~ _ ~ t => formatDbTime(t) + "　【帰宅】に変更しました"
        }
    }

    private def formatDbTime(s: String): String = {
      val date = new SimpleDateFormat("yyyyMMddHHmmssSSS").parse(s)
      new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(date)
    }
  }

  def getJijiData(UserID: String): JijiObject = {
    DB.withConnection { implicit conn =>
      val rs = SQL(
        """
          SELECT A.USERID, A.IPADDRESS, A.ACTION1, A.ACTION2 
          FROM JJ_USERMASTER AS A 
          WHERE A.USERID = {userid}
          """).on('userid -> UserID).as(JijiObject.data.singleOpt)

      val jj = rs.getOrElse(new JijiObject())

      val rs2 = SQL(
        """
          SELECT TOP 3 C.USERID, C.UPDATESTATUSCD, C.UPDATEYMD 
          FROM JJ_UPDATEDATA AS C 
          WHERE C.USERID = {userid} ORDER BY C.UPDATEYMD DESC
          """).on('userid -> UserID).as(JijiObject.log.*).foreach(log =>
          jj.log += log)

      jj
    }
  }

  def setJijiData(UserID: String, IpAddress: String, Action1: String, Action2: String): Boolean = {
    DB.withConnection { implicit conn =>
      val sleepFlg = if (Action1 == "0" && Action2 == "0") "1" else "0"
      SQL("""
          DELETE FROM JJ_USERMASTER WHERE USERID = {userid};
          INSERT INTO JJ_USERMASTER
           ([USERID], [IPADDRESS], [ACTION1], [ACTION2], [SLEEPFLG], [UPDATEYMD])
           VALUES ({userid}, {ipaddress}, {action1}, {action2}, {sleepflg}, {updateymd});
      """).on('userid -> UserID,
        'ipaddress -> IpAddress,
        'action1 -> Action1,
        'action2 -> Action2,
        'sleepflg -> sleepFlg,
        'updateymd -> new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new java.util.Date())).execute()
    }
  }

}
