import os
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
# Use Chroma from langchain_community (installed)
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from django.conf import settings

# Lightweight replacements to avoid depending on specific `langchain` package layout
def _simple_split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    if not text:
        return []
    chunks = []
    start = 0
    length = len(text)
    while start < length:
        end = min(start + chunk_size, length)
        chunk = text[start:end]
        chunks.append(chunk)
        start = max(end - chunk_overlap, end)
    return chunks

class SimpleMemory:
    """Tiny in-process chat memory replacement"""
    def __init__(self):
        self.messages: List[Dict[str, str]] = []

    def add_user_message(self, text: str):
        self.messages.append({"role": "user", "content": text})

    def add_ai_message(self, text: str):
        self.messages.append({"role": "assistant", "content": text})

    def get_messages(self) -> List[Dict[str, str]]:
        return list(self.messages)


class LegalAdvisorAgent:
    """LangChain agent for legal document Q&A using Gemini"""
    
    def __init__(self, document_id: int, document_text: str):
        self.document_id = document_id
        self.document_text = document_text
        self.vector_store = None
        self.chain = None
        self.memory = SimpleMemory()
        self._initialize_agent()
    
    def _get_legal_prompt(self):
        """Custom prompt for legal advice"""
        template = (
            "You are Legal Saathi, an AI legal advisor assistant.\n"
            "Your role is to help users understand their legal documents.\n\n"
            "Use the following pieces of context from the legal document to answer the question.\n"
            "If the answer is not found in the document, say \"I cannot find this information in your document.\"\n"
            "Do not make up legal information or provide advice outside the document's content.\n\n"
            "Context from document:\n{context}\n\n"
            "Chat History:\n{chat_history}\n\n"
            "User Question: {question}\n\n"
            "Answer (be clear, professional, and cite specific clauses when possible):"
        )
        return template
    
    def _initialize_agent(self):
        """Set up vector store and conversation chain"""
        # Split document into overlapping chunks
        chunks = _simple_split_text(self.document_text, chunk_size=1000, chunk_overlap=200)
        
        # Create embeddings using Gemini
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=settings.GEMINI_API_KEY
        )
        
        # Store in ChromaDB with document-specific collection
        collection_name = f"document_{self.document_id}"
        # Chroma.from_texts accepts texts and embeddings (embedding function); use from_texts helper
        self.vector_store = Chroma.from_texts(
            texts=chunks,
            embedding=embeddings,
            collection_name=collection_name,
            persist_directory=settings.CHROMA_DB_PATH,
        )

        # Initialize Gemini LLM via langchain_google_genai
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
            convert_system_message_to_human=True,
        )

        # No ConversationalRetrievalChain available consistently across installs;
        # we'll perform retrieval + LLM prompts in `ask()` instead.
        self.chain = None
    
    def ask(self, question: str) -> Dict[str, Any]:
        try:
            # add to memory
            self.memory.add_user_message(question)

            # retrieve top chunks
            docs = []
            try:
                docs = self.vector_store.similarity_search(question, k=4)
            except Exception:
                # fallback to retriever API
                try:
                    retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})
                    docs = retriever.get_relevant_documents(question)
                except Exception:
                    docs = []

            context = "\n\n".join([d.page_content for d in docs]) if docs else ""

            # build prompt
            chat_history = "\n".join([f"{m['role']}: {m['content']}" for m in self.memory.get_messages()])
            prompt_template = self._get_legal_prompt()
            if isinstance(prompt_template, str):
                prompt_text = prompt_template.format(context=context, chat_history=chat_history, question=question)
            else:
                prompt_text = prompt_template.format(context=context, chat_history=chat_history, question=question)

            # Call LLM (use `generate` with a simple input)
            try:
                generation = self.llm.generate([prompt_text])
                # result parsing depends on library; try common shapes
                answer = None
                if hasattr(generation, 'generations'):
                    gens = generation.generations
                    if gens and len(gens[0]) > 0:
                        answer = gens[0][0].text
                elif isinstance(generation, list) and generation:
                    answer = str(generation[0])
                answer = answer or "I could not generate an answer."
            except Exception as e:
                return {"answer": "I encountered an error processing your question. Please try again.", "error": str(e), "success": False}

            # store AI response
            self.memory.add_ai_message(answer)

            return {"answer": answer, "success": True}
        except Exception as e:
            return {"answer": "I encountered an error processing your question. Please try again.", "error": str(e), "success": False}
    
    def get_chat_history(self) -> List[Dict[str, str]]:
        """Return conversation history"""
        return self.memory.get_messages()


# Global cache to reuse agents for same document
_agent_cache = {}

def get_agent(document_id: int, document_text: str) -> LegalAdvisorAgent:
    """Get or create an agent for a document"""
    if document_id not in _agent_cache:
        _agent_cache[document_id] = LegalAdvisorAgent(document_id, document_text)
    return _agent_cache[document_id]

def clear_agent(document_id: int):
    """Remove agent from cache"""
    if document_id in _agent_cache:
        del _agent_cache[document_id]