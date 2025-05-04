from . import db
from sqlalchemy import Integer, String, Column, DateTime, Date, DECIMAL, Float, ForeignKey
from sqlalchemy.orm import relationship
import datetime

class Deal(db.Model):
    __tablename__ = 'deals'

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    sales_rep_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    stage = Column(String(100), nullable=False) # Consider making this an Enum or FK to a Stages table if stages are predefined
    estimated_value = Column(DECIMAL(10, 2), nullable=False)
    probability = Column(Float, nullable=False) # Store as 0.0 to 1.0
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    expected_close = Column(Date)
    won_on = Column(Date, nullable=True)
    lost_on = Column(Date, nullable=True)

    # Relationships
    client = relationship("Client", back_populates="deals")
    sales_rep = relationship("User", back_populates="deals_assigned")
    payment_schedules = relationship("PaymentSchedule", back_populates="deal", cascade="all, delete-orphan")
    stage_histories = relationship("StageHistory", back_populates="deal", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="deal", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Deal {self.id} - Client {self.client_id}>'
