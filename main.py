import streamlit as st
import logging
from RAG import RAG_Model, urlload

# Setup logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

st.title("News Reserach Tool")
st.sidebar.title("News Article Urls")

urls=[]

for i in range(1):
    url=st.sidebar.text_input(f"URL{i+1}")
    urls.append(url)
    
logging.debug(f"user entered urls: {urls}")
process_url_chunk=st.sidebar.button("Process")
if process_url_chunk:
    #url="https://www.livemint.com/market/stock-market-news/stock-to-watch-bank-of-baroda-bob-declares-rs-8500-crore-fundraise-via-issuance-of-fresh-shares-11739462148026.html"

    logging.info(len(urls))
    logging.info("Processing chunks")
    urlload(urls)
    logging.info("URL processing completed")
    
query=st.text_input("Query")
if query:
    logging.info(f"Processing query: {query}")
    result=RAG_Model(query)
    logging.info(f"Model output: {result}")
    st.write(result)
    



    
