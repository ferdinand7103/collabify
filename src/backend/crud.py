from sqlalchemy.orm import Session
from sqlalchemy import update
import models, schemas
from pydantic import EmailStr
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = "asecretkeysisasecretkeysothisisasecret"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.Users).filter(models.Users.id == user_id).first()

def get_user_by_email(db: Session, email: EmailStr):
    return db.query(models.Users).filter(models.Users.email == email).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Users).offset(skip).limit(limit).all()

def create_user(db: Session, email: EmailStr, password: str):
    db_user = models.Users(email = email, password = password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(password, hashed_password):
    return pwd_context.verify(password, hashed_password)

def auth_user(db: Session, email, password):
    user = get_user_by_email(db, email)
    if not user:
        return False
    check_pass = verify_password(password, user.password)
    if not check_pass:
        return False
    return user

def create_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes = 15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm = ALGORITHM)
    return encoded_jwt

def delete_user(db: Session, id: int):
    db_user = db.query(models.Users).filter(models.Users.id == id).first()
    db.delete(db_user)
    db.commit()
    return db_user

def user_active(db: Session, email: EmailStr):
    db.query(models.Users).filter(models.Users.email == email).update({"is_active": True})
    db.commit()
    return db.query(models.Users).filter(models.Users.email == email).first()

def user_inactive(db: Session, email: EmailStr):
    db.query(models.Users).filter(models.Users.email == email).update({"is_active": False})
    db.commit()
    return db.query(models.Users).filter(models.Users.email == email).first()

def add_todo(db: Session, title: str, name: str, duedate: str, email: EmailStr):
    user = get_user_by_email(db, email)
    db_todo = models.Todo(title = title, name = name, duedate = duedate, user_id = user.id)
    db.add(db_todo)
    db.commit()
    return db_todo

def get_todo(db: Session, email: EmailStr):
    user = get_user_by_email(db, email)
    return db.query(models.Todo).filter(models.Todo.user_id == user.id).all()

def get_todo_last(db: Session, email: EmailStr):
    user = get_user_by_email(db, email)
    db_todo = db.query(models.Todo).filter(models.Todo.user_id == user.id).all()
    for item in db_todo:
        items = item
    return items

def get_todo_title(db: Session, title: str, email: EmailStr):
    user = get_user_by_email(db, email)
    return db.query(models.Todo).filter(models.Todo.title == title, models.Todo.user_id == user.id).all()
    
def delete_todo(db: Session, title: str, email: EmailStr):
    user = get_user_by_email(db, email)
    db_todo = db.query(models.Todo).filter(models.Todo.title == title, models.Todo.user_id == user.id).all()
    for item in db_todo:
        db.delete(item)
    db.commit()
    return db_todo

def delete_todo_id(db: Session, todo_id: int):
    db_todo = db.query(models.Todo).filter(models.Todo.todo_id == todo_id).first()
    db.delete(db_todo)
    db.commit()
    return db_todo

def update_todo(db: Session, payload: schemas.GetTodo):
    db_todo = db.query(models.Todo).filter(models.Todo.todo_id == payload.todo_id).first()
    for var, value in vars(payload).items():
        if value:
            setattr(db_todo, var, value)
        else:
            None
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo_title(db: Session, payload: schemas.UpdateTitle):
    db_todo = db.query(models.Todo).filter(models.Todo.todo_id == payload.todo_id).first()
    for var, value in vars(payload).items():
        if value:
            setattr(db_todo, var, value)
        else:
            None
    db.commit()
    db.refresh(db_todo)
    return db_todo

def add_notes(db: Session, title: str, body: str, time: str, email: EmailStr):
    user = get_user_by_email(db, email)
    db_note = models.Notes(title = title, body = body, time = time, user_id = user.id)
    db.add(db_note)
    db.commit()
    return db_note

def get_notes(db: Session, email: EmailStr):
    user = get_user_by_email(db, email)
    return db.query(models.Notes).filter(models.Notes.user_id == user.id).all()

def get_notes_last(db: Session, email: EmailStr):
    user = get_user_by_email(db, email)
    db_notes = db.query(models.Notes).filter(models.Notes.user_id == user.id).all()
    for item in db_notes:
        items = item
    return items

def delete_notes(db: Session, notes_id: int):
    db_note = db.query(models.Notes).filter(models.Notes.notes_id == notes_id).first()
    db.delete(db_note)
    db.commit()
    return db_note

def update_notes(db: Session, payload: schemas.GetNotes):
    db_notes = db.query(models.Notes).filter(models.Notes.notes_id == payload.notes_id).first()
    for var, value in vars(payload).items():
        if value:
            setattr(db_notes, var, value)
        else:
            None
    db.commit()
    db.refresh(db_notes)
    return db_notes

def add_map(db: Session, data: str, x: int, y: int, email: EmailStr):
    user = get_user_by_email(db, email)
    db_map = models.Map(data = data, x = x, y = y, user_id = user.id)
    db.add(db_map)
    db.commit()
    return db_map

def get_map(db: Session, email: EmailStr):
    user = get_user_by_email(db, email)
    return db.query(models.Map).filter(models.Map.user_id == user.id).all()

def get_map_last(db: Session, email: EmailStr):
    user = get_user_by_email(db, email)
    db_map = db.query(models.Map).filter(models.Map.user_id == user.id).all()
    for item in db_map:
        items = item
    return items

def delete_map(db: Session, map_id: int):
    db_map = db.query(models.Map).filter(models.Map.map_id == map_id).first()
    db.delete(db_map)
    db.commit()
    return db_map

def update_source(db: Session, payload: schemas.MapSource):
    db_map = db.query(models.Map).filter(models.Map.map_id == payload.map_id).first()
    for var, value in vars(payload).items():
        if value:
            setattr(db_map, var, value)
        else:
            None
    db.commit()
    db.refresh(db_map)
    return db_map

def update_xy(db: Session, payload: schemas.MapXY):
    db_map = db.query(models.Map).filter(models.Map.map_id == payload.map_id).first()
    for var, value in vars(payload).items():
        if value:
            setattr(db_map, var, value)
        else:
            None
    db.commit()
    db.refresh(db_map)
    return db_map