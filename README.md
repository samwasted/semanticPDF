# SemanticPDF

> RAG-powered PDF chat application with semantic query capabilities

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat-square&logo=trpc&logoColor=white)](https://trpc.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

**🌐 Live Demo:** [https://semanticpdf.vercel.app](https://semanticpdf.vercel.app)

A modern web application that enables semantic querying of PDF documents through natural language conversations. Built with RAG (Retrieval-Augmented Generation) architecture for contextually accurate responses.

![SemanticPDF Interface](https://via.placeholder.com/800x450/1a1a1a/ffffff?text=SemanticPDF+Interface)

## 🔧 Core Features

- **🧠 Semantic Query Engine**: Advanced RAG implementation for contextual document understanding
- **💬 Real-time PDF Chat**: Live conversations with uploaded documents using OpenAI models
- **🔍 Vector Embeddings**: Document chunking and embedding storage in Pinecone
- **💳 Subscription Management**: Tiered access with Razorpay payment integration
- **🛡️ Type-safe APIs**: Full-stack TypeScript with tRPC for end-to-end type safety

## ⚙️ Tech Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React-PDF for document rendering
- Tanstack Query for data fetching
- Lucide React icons
- Sonner notifications

**Backend & Infrastructure**
- tRPC for type-safe API layer
- Supabase (PostgreSQL)
- Kinde Auth for authentication
- OpenAI API (GPT + Embeddings)
- Pinecone vector database
- Razorpay payment processing

## 📋 Prerequisites

- Node.js 18+
- OpenAI API key
- Pinecone API key  
- Supabase project
- Kinde Auth application
- Razorpay account

## 📋 Application Flow

### 1. 📄 PDF Upload & Processing

Users upload PDFs through the dashboard interface. Documents are processed, chunked, and embedded using OpenAI's text-embedding model, then stored in Pinecone for semantic retrieval.

### 2. 🔍 Semantic Query Processing

```typescript
// Simplified query flow
1. User input → Embedding generation
2. Vector similarity search in Pinecone
3. Context retrieval + RAG prompt construction
4. OpenAI completion with streaming response
5. Real-time UI updates
```

### 3. 💬 Get Answers from PDF

Users can now interact with their uploaded documents through natural language queries. The system provides contextually accurate responses by leveraging the processed embeddings and semantic understanding of the document content.

## 💰 Subscription Architecture

### 💎 Pricing Tiers
![Pricing Structure](https://via.placeholder.com/600x200/059669/ffffff?text=Free+vs+Pro+Comparison)

Two-tier subscription model with flexible limits and self-managed billing through the dashboard interface.

### 🧾 Billing Management
![Billing Dashboard](https://via.placeholder.com/600x200/7c3aed/ffffff?text=Subscription+Management+Panel)

- Razorpay integration (test mode)
- Subscription lifecycle management
- Usage tracking and limits enforcement
- One-click cancellation with immediate effect

## 🏗️ Key Implementation Details

### 🔄 RAG Pipeline
```
PDF Upload → Text Extraction → Chunking → Embedding → Vector Storage
                                                              ↓
User Query → Query Embedding → Similarity Search → Context Retrieval → LLM Response
```

### 🗄️ Database Schema
- User profiles and authentication state
- Document metadata and processing status
- Chat conversations and message history
- Subscription and billing records
- Usage analytics and rate limiting

### 🔐 Authentication Flow
Kinde Auth provides secure OAuth implementation with session management and protected route handling.

### 💳 Payment Processing
Razorpay handles subscription creation and management with self-service cancellation through the dashboard. Payment verification links are provided for transaction transparency, with all payments cryptographically verified for enhanced security.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
├── components/             # Reusable UI components
│   ├── chat/              # Chat interface components
│   └── ui/                # shadcn/ui base components
├── client/                # Client-side utilities
├── config/                # Configuration files
├── db/                    # Database utilities
├── generated/             # Auto-generated files
├── lib/                   # Core utilities and helpers
├── polyfill/              # Browser polyfills
├── trpc/                  # tRPC client configuration
├── types/                 # TypeScript definitions
└── middleware.ts          # Next.js middleware

prisma/                    # Database schema and migrations
public/                    # Static assets
```

## 🚀 Development Highlights

- **🔒 Full-stack TypeScript**: End-to-end type safety from database to UI
- **⚡ Modern React Patterns**: Server components, streaming, and optimistic updates
- **📈 Performance Optimized**: Edge functions and efficient vector searches
- **🎨 Sleek UI**: Modern interface built with shadcn/ui and React-PDF integration
- **🔐 Crypto-verified Payments**: Razorpay transactions secured with cryptographic verification

---

<div align="center">

### 🌟 SemanticPDF in Action

**Made by samwasted for CSOC 25**

![SemanticPDF Demo](https://via.placeholder.com/800x400/gradient?text=Interactive+Demo+Showcase)

</div>
