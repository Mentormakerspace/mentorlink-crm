from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models here to make them easily accessible 
# and ensure they are registered with SQLAlchemy
from .client import Client
from .user import User
from .deal import Deal
from .payment_schedule import PaymentSchedule
from .stage_history import StageHistory
from .action_item import ActionItem
