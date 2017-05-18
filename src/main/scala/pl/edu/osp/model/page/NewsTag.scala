/* Copyright (C) 2011   Mikołaj Sochacki mikolajsochacki AT gmail.com
 *   This file is part of VRegister (Virtual Register - Wirtualny Dziennik)
 *   LICENCE: GNU AFFERO GENERAL PUBLIC LICENS Version 3 (AGPLv3)
 *   See: <http://www.gnu.org/licenses/>.
 */

///nie korzystam do usuniecia!!!!
package pl.edu.osp.model.page

import _root_.net.liftweb.mongodb._
import java.util.Date
import org.bson.types.ObjectId


object NewsTag extends MongoDocumentMeta[NewsTag] {
  override def collectionName = "newstag"
  override def connectionIdentifier = pl.edu.osp.config.MyMongoIdentifier
  override def mongoIdentifier = pl.edu.osp.config.MyMongoIdentifier

  override def formats = super.formats + new ObjectIdSerializer + new DateSerializer

  def create = new NewsTag(ObjectId.get, "", 0)
}

case class NewsTag(var _id: ObjectId, var tag: String, var count: Int)
  extends MongoDocument[NewsTag] {
  def meta = NewsTag
}
