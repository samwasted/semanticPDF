import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getPineconeClient } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new Error('Unauthorized');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete started for file:', file.name);
      
      let createdFile;
      try {
        // Create file record in database
        createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url, // Changed from file.ufsUrl to file.url
            uploadStatus: 'PROCESSING'
          }
        });
        console.log('File record created:', createdFile.id);

        // Validate environment variables
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is not set in environment variables');
        }

        // Fetch the PDF file
        console.log('Fetching file from URL:', file.url);
        const response = await fetch(file.url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('File fetched, size:', blob.size);

        // Load PDF
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        const pagesAmt = pageLevelDocs.length;
        
        console.log(`PDF loaded with ${pagesAmt} pages`);

        if (pagesAmt === 0) {
          throw new Error('PDF contains no readable pages');
        }

        // Initialize Pinecone
        console.log('Initializing Pinecone...');
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("chatsemantic");

        // Check if index exists and is ready
        const indexStats = await pineconeIndex.describeIndexStats();
        console.log('Pinecone index stats:', indexStats);

        // Initialize OpenAI embeddings
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY, // Fixed: use openAIApiKey instead of apiKey
          modelName: "text-embedding-3-small", // Specify model explicitly
        });

        console.log('Creating embeddings and storing in Pinecone...');
        
        // Store documents in Pinecone with better error handling
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
          textKey: "text", // Specify text key explicitly
        });

        console.log('Documents stored in Pinecone successfully');

        // Update file status to SUCCESS
        await db.file.update({
          data: {
            uploadStatus: "SUCCESS"
          },
          where: {
            id: createdFile.id
          }
        });

        console.log('File processing completed successfully');
        return { 
          success: true, 
          fileId: createdFile.id,
          pages: pagesAmt 
        };

      } catch (err) {
        console.error('Error processing file:', err);
        
        // More specific error logging
        if (err instanceof Error) {
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }

        // Update file status to FAILED if file record was created
        if (createdFile) {
          try {
            await db.file.update({
              data: {
                uploadStatus: "FAILED",
                // Optionally store error message
                // errorMessage: err instanceof Error ? err.message : 'Unknown error'
              },
              where: {
                id: createdFile.id
              }
            });
          } catch (updateError) {
            console.error('Failed to update file status:', updateError);
          }
        }

        // Re-throw the error so UploadThing can handle it properly
        throw err;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;