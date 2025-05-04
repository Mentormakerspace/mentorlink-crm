from . import db
from sqlalchemy import Integer, String, Column, Enum
from sqlalchemy.orm import relationship
import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    # Define Enum directly or import if defined elsewhere
    role = Column(Enum('Owner', 'Admin', 'SalesRep', name='user_roles'), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    deals_assigned = relationship("Deal", back_populates="sales_rep")
    action_items_owned = relationship("ActionItem", back_populates="owner")

    def __repr__(self):
        return f'<User {self.name} ({self.role})>'
