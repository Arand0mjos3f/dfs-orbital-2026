from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "Orbital 26! 这里是队友甲的 API!"}