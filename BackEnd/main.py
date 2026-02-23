import os
from fastapi import FastAPI
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

# Load your OPENROUTER_API_KEY from .env
load_dotenv()

app = FastAPI(
    title="OpenRouter + LangChain API",
    description="Query any model via OpenRouter using LangChain and FastAPI",
    version="1.0.0"
)

# --- CONFIGURATION ---
# You can use any model available on OpenRouter (e.g., "meta-llama/llama-3-8b-instruct")
OPENROUTER_MODEL = "nvidia/nemotron-nano-9b-v2:free" 
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# --- SCHEMAS ---
class QueryRequest(BaseModel):
    topic: str = Field(..., example="Quantum Computing")
    model_override: str | None = Field(None, description="Optional model string to override default")

class QueryResponse(BaseModel):
    answer: str

# --- LANGCHAIN INITIALIZATION ---
def get_llm(model_name: str):
    return ChatOpenAI(
        model=model_name,
        openai_api_key=os.getenv("OPENROUTER_API_KEY"),
        openai_api_base=OPENROUTER_BASE_URL,
        default_headers={
            "HTTP-Referer": "http://localhost:8000", # Required by some OpenRouter models
            "X-Title": "FastAPI LangChain Tutorial",
        }
    )

# --- ROUTES ---
@app.post("/ask", response_model=QueryResponse)
async def ask_ai(request: QueryRequest):
    """
    Connects to OpenRouter to get an AI-generated explanation.
    """
    target_model = request.model_override or OPENROUTER_MODEL
    llm = get_llm(target_model)
    
    prompt = ChatPromptTemplate.from_template("Explain {topic} like I am five years old.")
    chain = prompt | llm | StrOutputParser()
    
    response = await chain.ainvoke({"topic": request.topic})
    return {"answer": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)