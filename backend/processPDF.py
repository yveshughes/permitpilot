import os
from langchain_together import Together
from langchain_core.messages import HumanMessage
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain_huggingface import HuggingFaceEmbeddings  # Updated import

class PDFChatBot:
    def __init__(self, together_api_key, model_name="meta-llama/Llama-3.2-3B-Instruct-Turbo"):
        """
        Initialize the PDF chatbot with TogetherAI
        
        Args:
            together_api_key (str): Your TogetherAI API key
            model_name (str): The model to use from TogetherAI
        """
        self.llm = Together(
            together_api_key=together_api_key,
            model=model_name,
            temperature=0.7,
            max_tokens=512
        )
        
        # Initialize embeddings (using a free model that runs locally)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        self.vector_store = None
        self.qa_chain = None

    def load_pdf(self, pdf_path):
        """
        Load and process a PDF file
        
        Args:
            pdf_path (str): Path to the PDF file
        """
        # Load PDF
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_documents(documents)
        
        # Create vector store
        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        
        # Create QA chain
        self.qa_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vector_store.as_retriever(),
            return_source_documents=True,
            verbose=True
        )
        
        return f"Processed PDF: {pdf_path}"

    def ask_question(self, question, chat_history=[]):
        """
        Ask a question about the loaded PDF
        
        Args:
            question (str): The question to ask
            chat_history (list): List of previous Q&A pairs
            
        Returns:
            dict: Contains the answer and source documents
        """
        if not self.qa_chain:
            return "Please load a PDF first using load_pdf()"
        
        result = self.qa_chain({"question": question, "chat_history": chat_history})
        
        return {
            "answer": result["answer"],
            "sources": [doc.page_content[:200] + "..." for doc in result["source_documents"]]
        }

def main():
    # Get API key from environment variable
    api_key = "b0222468fe741dec70c263c2db264b97a79e1b8169cc23625c314d316bf09b27"

    # Initialize chatbot
    chatbot = PDFChatBot(api_key)
    
    # Example usage
    pdf_path = input("Enter the path to your PDF file: ")
    print(chatbot.load_pdf(pdf_path))
    
    chat_history = []
    while True:
        question = input("\nEnter your question (or 'quit' to exit): ")
        if question.lower() == 'quit':
            break
            
        response = chatbot.ask_question(question, chat_history)
        print("\nAnswer:", response["answer"])
        print("\nSources:")
        for i, source in enumerate(response["sources"], 1):
            print(f"\nSource {i}:", source)
            
        # Update chat history
        chat_history.append((question, response["answer"]))

if __name__ == "__main__":
    main()