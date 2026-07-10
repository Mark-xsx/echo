from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello Echo"}
@app.get("/echo/{echo_id}")
def get_echo(echo_id: int):
    return {"echo_id": echo_id, "content": f"这是第 {echo_id} 条回声"}