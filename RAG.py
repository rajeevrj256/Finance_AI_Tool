from langchain_community.document_loaders import UnstructuredURLLoader
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

@app.route("/url_fetch",methods=['POST'])
def urlload():
    """Loads data from URLs and creates a vector store."""
    data = request.json
    urls = data['urls']
    loader = UnstructuredURLLoader(urls=urls)
    data = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        separators=['\n\n', '\n', ' '],
        chunk_size=1000,
        chunk_overlap=100  # Fixed typo
    )
    
    doc = text_splitter.split_documents(data)
    
    embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    vectorstore = Chroma.from_documents(doc, embedding, persist_directory='db')
    
    return jsonify({"response": "Data loaded and vector store created."})


def get_query_chain():
    """Creates a QA chain with a prompt template."""
    prompt_template = """
    You are financial adivisor with 25 year of stock and investement experience. You have to learn whole news provide, and then ans that question.

    Answer the question as thoroughly as possible using the provided context. If the answer is 
    not available in the context, respond with: "Answer is not available in the context."

    Context:\n {context}?\n
    Question:\n {question}\n

    Answer:
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    return chain


@app.route("/query",methods=['POST'])
def RAG_Model():
    """Main function to process the query."""
    data = request.get_json()
    
    query = data.get('query')
    
    
    # Load URL data into vector store
    #vectorstore = urlload([url])  # Passed as a list
    
    # Load QA chain
    chain = get_query_chain()
    
    # Initialize Chroma DB for querying
    embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    new_db = Chroma(persist_directory="db", embedding_function=embedding)
    
    # Define query
    #query = "Give me deatils about Kontor Space Ltd stock ipo subscribed status and price range"
    
    # Perform similarity search
    query_vector = new_db.similarity_search(query, k=3)
    
    # Get response
    response = chain.run(input_documents=query_vector, question=query)
    
    print(response)
    return jsonify({"response": response})
    
if __name__ == "__main__":
    app.run(debug=True)



