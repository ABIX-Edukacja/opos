package pl.brosbit.snippet.edu

import java.util.Date
import scala.xml.{Text,XML,Unparsed, Source}
import _root_.net.liftweb._
import http.{S,SHtml}
import common._
import util._
import mapper.{OrderBy,Descending}
import pl.brosbit.model._
import edu._
import mapper.By
import json.JsonDSL._
import json.JsonAST.JObject
import json.JsonParser
import org.bson.types.ObjectId
import Helpers._

class EditSlideSn extends BaseResourceSn  {
  
 val id = S.param("id").openOr("0")
 var slide = if (id != "0") Slide.find(id).getOrElse(Slide.create) else Slide.create
 var slideCont = SlideContent.find(slide.slides).getOrElse(SlideContent.create)
 if(slide.slides != slideCont._id) slide.slides = slideCont._id

 //for showslides - viewer 
  def slideData() = {
      "#title" #> <span>{slide.title}</span> &
      "#description" #> <span>{slide.descript}</span> &
      "#slideHTML" #>  Unparsed(slideCont.slides)  &
      "#detailHTML" #> Unparsed(slideCont.details) 
  }
  
  
  //edit slides 
  def formEdit() = {
    
    var ID = if(id == "0") "0" else slide._id.toString
    var title = slide.title
    var description = slide.descript
    var slidesString = slideCont.slides
    var detailsString = slideCont.details
  
    def saveData() {
      val userId = user.id.is
      if(slide.authorId == 0L || slide.authorId == userId) {
          val slidesContentHtml = Unparsed(slidesString)
           slide.title = title.trim
          slide.descript = description.trim
          slide.authorId = userId
          slideCont.slides = slidesString
          slideCont.details = detailsString
          slideCont.save
          slide.slides = slideCont._id      
          slide.save 
      }
           
      S.redirectTo("/resources/editslide/"+ slide._id.toString) //!important must refresh page
    }
    
    def deleteData() {
      val userId = user.id.is
     if (id != "0") Slide.find(id) match {
         case Some(slide) if slide.authorId == userId => {
           slideCont.delete
    	   slide.delete
        } 
         case _ =>
      }
      
      S.redirectTo("/resources/slides")
    }
      
    def cancelAction() {
      S.redirectTo("/resources/slides")
    }
    
    val publicList = List(("TAK","TAK"),("NIE","NIE"))
    "#id" #> SHtml.text(ID, ID = _, "type"->"hidden") &
    "#titleTheme" #> SHtml.text(title, title= _,"class"->"Name") &
    "#description" #> SHtml.text(description, description = _)&
    "#slidesData" #> SHtml.text(slidesString, slidesString = _, "type"->"hidden") &
    "#detailsData" #> SHtml.text(detailsString, detailsString = _, "type"->"hidden") &
    "#save" #> SHtml.button(<img src="/images/saveico.png"/>, saveData,"title"->"Zapisz") &
    "#delete" #> SHtml.button(<img src="/images/delico.png"/>,  deleteData,"title"->"Usuń")  &
    "#cancel" #> SHtml.button(<img src="/images/cancelico.png"/>, cancelAction,"title"->"Anuluj") 
  }
  
 
}
