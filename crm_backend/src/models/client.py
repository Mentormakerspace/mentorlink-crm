from . import db
from sqlalchemy import Integer, String, Column, DateTime, Enum, ForeignKey, Text, Date, DECIMAL, Float
from sqlalchemy.orm import relationship
import datetime

class Client(db.Model):
    __tablename__ = 'clients'

    id = Column(Integer, primary_key=True)
    company = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50))
    monday_board_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    deals = relationship("Deal", back_populates="client")

    def __repr__(self):
        return f'<Client {self.company}>'
