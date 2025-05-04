from .client import db # Assuming db is initialized in client.py or a central models file
from sqlalchemy import Integer, Column, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
import datetime

class ActionItem(db.Model):
    __tablename__ = 'action_items'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer, ForeignKey('deals.id'), nullable=False)
    description = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    due_date = Column(Date, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    deal = relationship("Deal", back_populates="action_items")
    owner = relationship("User", back_populates="action_items_owned")

    def __repr__(self):
        return f'<ActionItem {self.id} - Deal {self.deal_id}>'
