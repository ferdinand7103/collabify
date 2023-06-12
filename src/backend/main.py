from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
import crud, models, schemas
from database import engine, get_db
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import EmailStr
from fastapi import Depends
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt

models.Base.metadata.create_all(bind = engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "asecretkeysisasecretkeysothisisasecret"
ALGORITHM = "HS256"

collabify = FastAPI()

origins = {
    "*"
}

collabify.add_middleware(
   CORSMiddleware,
    allow_origins = origins,
    allow_credentials =True,
    allow_methods = ["*"],
    allow_headers= ["*"],
)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms = ALGORITHM)
        email: EmailStr = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email = email)
    except JWTError:
        raise credentials_exception
    
    return token_data
        
@collabify.get("/")
def index():
    return {"Collabify" : "Productive App to Help Your Study"}

@collabify.post("/signup/", response_model = schemas.Token)
async def signup(
    payload: schemas.CreateUserSchema,
    session: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(session, email = payload.email)
    if db_user:
        raise HTTPException(status_code = 400, detail = "Email already registered")
    hashed_pass = crud.pwd_context.hash(payload.password)
    crud.create_user(session, email = payload.email, password = hashed_pass)
    access_token_expires = timedelta(minutes = 30)
    access_token = crud.create_token(
        data={"sub": payload.email}, expires_delta = access_token_expires
    )
    crud.user_active(session, email = payload.email)
    return {"access_token": access_token, "token_type": "bearer"}

@collabify.post("/token", response_model = schemas.Token)
async def login(
    payload: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(session, email = payload.username)
    if not db_user:
        raise HTTPException(status_code = 400, detail = "Email does not exists")
    check_user = crud.auth_user(session, payload.username, payload.password)
    if not check_user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Incorrect username or password",
            headers = {"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes = 240)
    access_token = crud.create_token(
        data={"sub": check_user.email}, expires_delta = access_token_expires
    )
    crud.user_active(session, email = payload.username)
    return {"access_token": access_token, "token_type": "bearer"}

@collabify.get("/logout")
def user_logout(
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    crud.user_inactive(session, token_data.email)
    return {"Message": "Successfully Logout"}

@collabify.delete("/delete-user/{user_id}", response_model = schemas.UserSchema)
def delete_user(
    id: int,
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_db)
):
    return crud.delete_user(session, id)

@collabify.get("/protected_route")
async def protected_route(
    token_data: schemas.TokenData = Depends(get_current_user)
):
    return {"Message": "Access granted"}

@collabify.post("/add-todo/", response_model = schemas.Todo)
def add_todo(
    payload: schemas.Todo,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.add_todo(session, payload.title, payload.name, payload.duedate, token_data.email)

@collabify.put("/update-todo/", response_model = schemas.Todo)
def update_todo(
    payload: schemas.GetTodo,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.update_todo(session, payload)

@collabify.put("/update-todo-id/", response_model = schemas.Todo)
def update_todo_id(
    payload: schemas.UpdateTitle,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.update_todo_title(session, payload)

@collabify.get("/get-todo/")
def get_todo(
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.get_todo(session, token_data.email)

@collabify.get("/get-todo-last")
def get_todo_last(
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.get_todo_last(session, token_data.email)

@collabify.get("/get-todo-title/")
def get_todo_title(
    title: str,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.get_todo_title(session, title, token_data.email)

@collabify.delete("/delete-todo/")
def delete_todo(
    payload: schemas.DeleteTodo,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.delete_todo(session, payload.title, token_data.email)

@collabify.delete("/delete-todo-id/")
def delete_todo_id(
    payload: schemas.DeleteTodoID,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.delete_todo_id(session, payload.todo_id)

@collabify.post("/add-notes/", response_model = schemas.Notes)
def add_notes(
    payload: schemas.Notes,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.add_notes(session, payload.title, payload.body, payload.time, token_data.email)

@collabify.get("/get-notes/")
def get_notes(
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.get_notes(session, token_data.email)

@collabify.get("/get-notes-last")
def get_notes_last(
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.get_notes_last(session, token_data.email)

@collabify.put("/update-notes/", response_model = schemas.Notes)
def update_notes(
    payload: schemas.GetNotes,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.update_notes(session, payload)

@collabify.delete("/delete-notes/")
def delete_notes(
    payload: schemas.DeleteNotes,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.delete_notes(session, payload.notes_id)

@collabify.post("/add-map/", response_model = schemas.Map)
def add_map(
    payload: schemas.Map,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.add_map(session, payload.data, payload.x, payload.y, token_data.email)

@collabify.put("/update-source/", response_model = schemas.MapSource)
def update_source(
    payload: schemas.MapSource,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.update_source(session, payload)

@collabify.put("/update-source/", response_model = schemas.MapXY)
def update_source(
    payload: schemas.MapSource,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.update_xy(session, payload)
    
@collabify.get("/get-map/")
def get_map(
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.get_map(session, token_data.email)

@collabify.get("/get-map-last")
def get_map_last(
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.get_map_last(session, token_data.email)

@collabify.delete("/delete-map/")
def delete_map(
    payload: schemas.DeleteMap,
    token_data: schemas.TokenData = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return crud.delete_map(session, payload.map_id)