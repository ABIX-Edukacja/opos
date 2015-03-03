package pl.brosbit.snippet

import scala.xml.Unparsed
import _root_.net.liftweb.util._
import _root_.net.liftweb.common._
import net.liftweb._
import http.{ S, SHtml, SessionVar }
import mapper.By
import _root_.pl.brosbit.model._
import json.JsonDSL._
import json.JsonAST.JObject
import json.JsonParser
import org.bson.types.ObjectId
import Helpers._
import pl.brosbit.model.edu.SubjectTeach
import scala.util.matching.Regex

object SubjectChoose extends SessionVar[Long](0L)
object LevelChoose extends SessionVar[Int](1)

class LoginSn {
val redirectUrl = S.param("r").getOrElse("/login")
  val userBox = User.currentUser
  def show() = {
    userBox match {
      case Full(user) =>
        "a" #> <a href="/user_mgt/logout" class="btn btn-info" role="button" title="Wyloguj" style="padding:10px">
                 <span class="glyphicon glyphicon-log-out"></span> { user.getFullName }
               </a>
      case _ =>
        "a" #> <a href="/login" role="button" class="btn btn-default" title="Zaloguj" style="padding:10px">
                 <span class="glyphicon glyphicon-user"></span>
                  Niezalogowno
               </a>
    }
  }

  def mkLogIn() = {
    var login = ""
    var pass = ""
    var message = ""

    def mkLog() {
      val reg = "^[0-9]{11}$".r
      val pesel_? = reg.findFirstIn(login.trim) match {
        case Some(str) => true
        case _ => false
      }

      if(pesel_?) {
        User.findAll(By(User.pesel, login.trim)) match {
          case user :: other => {
            if (user.role == "u" || user.role == "r") {
              if (user.password.match_?(pass.trim)) {
                User.logUserIn(user)
                S.redirectTo(redirectUrl)
              }
              else message = " Błędny PESEL "
            } else message = " Będąc nauczycielem wpisz email jako login"
          }
          case _ => message = " Nie znaleziono PESELu. "
        }
      }
      else {
        User.findAll(By(User.email, login.trim)) match {
          case user :: other => {
            if (user.role == "n" || user.role == "a" || user.role == "d") {
              if (user.password.match_?(pass.trim)) {
                User.logUserIn(user)
                S.redirectTo(redirectUrl)
              }
              else message = " Błędne hasło "
            } else message = " Będąc uczeniem wpisz PESEL jako login"
          }
          case _ => message = " Nie znaleziono adresu email. "
        }
      }
      S.notice(message)
    }


    userBox match {
      case Full(user) => {
        "form" #> <span></span>
      }
      case _ => {
        "#login" #> SHtml.text(login, login = _) &
          "#password" #> SHtml.password(pass, pass = _) &
          "#mkLog" #> SHtml.submit("Zaloguj", mkLog)
      }
    }

  }

  def showMenu() = {
    val loged_? = !userBox.isEmpty
    var viewH = "#"
    var viewC = "btn btn-default btn-lg"
    var secretariatH = "#"
    var secretariatC = "btn btn-default btn-lg"
    var educontentH = "#"
    var educontentC = "btn btn-default btn-lg"
    var registerH = "#"
    var registerC = "btn btn-default btn-lg"
    var docH = "#"
    var docC = "btn btn-default btn-lg"
    if (loged_?) {
      val user = userBox.openOrThrowException("Niemożliwe box nie jest pusty!")
      if (user.role == "n" || user.role == "a" || user.role == "d") {
        educontentH = "/educontent/index"
        educontentC = "btn btn-info btn-lg"
        registerH = "/register/index"
        registerC = "btn btn-info btn-lg"
        docH = "/documents/index"
        docC = "btn btn-info btn-lg"
      }
      else {
        if(user.role == "u" || user.role == "r") {
          viewH = "/view"
          viewC = "btn btn-info btn-lg"
        }
      }
       if (user.role == "s" || user.role == "a" || user.role == "d") {
         secretariatH = "/secretariat/index"
         secretariatC = "btn btn-info btn-lg"
       }
    }
    "#viewA [href]" #> viewH &
      "#viewA [class]" #> viewC &
      "#secretariatA [href]" #> secretariatH &
      "#secretariatA [class]" #> secretariatC &
       "#educontentA [href]" #> educontentH &
      "#educontentA [class]" #> educontentC &
      "#registerA [href]" #> registerH &
      "#registerA [class]" #> registerC &
      "#docA [href]" #> docH &
      "#docA [class]" #> docC

  }
  
  private def intalizeSubjectAndLevelChoice(user:User) {
    val subjs = SubjectTeach.findAll(("authorId" -> user.id.is),("$orderby"->("prior"->1)))
    if(subjs.length > 0) {
      SubjectChoose.set(subjs.head.id)
      LevelChoose.set(subjs.head.lev)
    }
   
  }

}
