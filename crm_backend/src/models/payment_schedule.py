from .client import db # Assuming db is initialized in client.py or a central models file
from sqlalchemy import Integer, String, Column, DateTime, Date, DECIMAL, Enum, ForeignKey
from sqlalchemy.orm import relationship
import datetime

class PaymentSchedule(db.Model):
    __tablename__ = 'payment_schedules'

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer, ForeignKey('deals.id'), nullable=False)
    milestone_name = Column(String(255), nullable=False)
    amount_due = Column(DECIMAL(10, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum('pending', 'paid', name='payment_status'), nullable=False, default='pending')
    paid_on = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship
    deal = relationship("Deal", back_populates="payment_schedules")

    def __repr__(self):
        return f'<PaymentSchedule {self.id} - Deal {self.deal_id} - {self.milestone_name}>'
