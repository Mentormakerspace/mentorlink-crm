from .client import db # Assuming db is initialized in client.py or a central models file
from sqlalchemy import Integer, String, Column, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

class StageHistory(db.Model):
    __tablename__ = 'stage_histories'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer, ForeignKey('deals.id'), nullable=False)
    stage = Column(String(100), nullable=False) # Captures the stage name at the time
    entered_at = Column(DateTime, default=datetime.datetime.utcnow)
    exited_at = Column(DateTime, nullable=True)

    # Relationship
    deal = relationship("Deal", back_populates="stage_histories")

    def __repr__(self):
        return f'<StageHistory {self.id} - Deal {self.deal_id} - Stage {self.stage}>'
