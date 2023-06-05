from pydantic import BaseModel, EmailStr, Field

class Users(BaseModel):
    email: EmailStr | None = None
    
    class Config:
        orm_mode = True
    
class CreateUserSchema(Users):
    password: str
        
class UserLoginSchema(BaseModel):
    id: int 
    email: EmailStr| None = None
    is_active: bool | None = None
    
class UserSchema(Users):
    id: int
    is_active: bool = Field(default=False)

    class Config:
        orm_mode = True
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    email: EmailStr = None
    
class Todo(BaseModel):
    title: str
    name: str
    duedate: str
    
    class Config:
        orm_mode = True
        
class GetTodo(BaseModel):
    name: str
    duedate: str
    todo_id: int
        
class UserTodo(Todo):
    user_id: int
    
class DeleteTodo(BaseModel):
    title: str
    
class DeleteTodoID(BaseModel):
    todo_id: int
    
class UpdateTitle(BaseModel):
    todo_id: int
    title: str
    
class Notes(BaseModel):
    title: str
    body: str
    time: str
    
    class Config:
        orm_mode = True
        
class GetNotes(BaseModel):
    title: str
    body: str
    time: str
    notes_id: int

class DeleteNotes(BaseModel):
    notes_id: int
    
class Map(BaseModel):
    data: str
    x: int
    y: int
    
    class Config:
        orm_mode = True
    
class MapSource(BaseModel):
    source: int
    target: int
        
class DeleteMap(BaseModel):
    map_id: int