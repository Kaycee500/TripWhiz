// Simple in-browser vector store for embeddings
export interface VectorDocument {
  id: string;
  embedding: number[];
  metadata: {
    url?: string;
    title?: string;
    content: string;
    timestamp?: string;
    type?: 'page' | 'conversation' | 'faq';
  };
}

export interface SimilarityResult {
  document: VectorDocument;
  similarity: number;
}

export class VectorStore {
  private documents: VectorDocument[] = [];
  private storageKey = 'tripwhiz_vector_store';

  constructor() {
    this.loadFromStorage();
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Add a document to the vector store
  add(document: VectorDocument): void {
    // Remove existing document with same ID
    this.documents = this.documents.filter(doc => doc.id !== document.id);
    
    // Add new document
    this.documents.push({
      ...document,
      metadata: {
        ...document.metadata,
        timestamp: new Date().toISOString()
      }
    });
    
    this.saveToStorage();
  }

  // Search for similar documents
  similaritySearch(queryEmbedding: number[], topK: number = 3): SimilarityResult[] {
    const results: SimilarityResult[] = [];
    
    for (const doc of this.documents) {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({ document: doc, similarity });
    }
    
    // Sort by similarity (highest first) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // Get all documents
  getAllDocuments(): VectorDocument[] {
    return [...this.documents];
  }

  // Clear all documents
  clear(): void {
    this.documents = [];
    this.saveToStorage();
  }

  // Save to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.documents));
    } catch (error) {
      console.error('Failed to save vector store to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.documents = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load vector store from localStorage:', error);
      this.documents = [];
    }
  }

  // Get statistics
  getStats(): { totalDocuments: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    
    for (const doc of this.documents) {
      const type = doc.metadata.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    }
    
    return {
      totalDocuments: this.documents.length,
      byType
    };
  }
}