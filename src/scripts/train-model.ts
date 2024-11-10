// src/scripts/train-model.ts
const { readdir, readFile } = require('fs/promises');
const path = require('path');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const dotenv = require('dotenv');

// Load environment variables first, before any checks
dotenv.config({ path: '.env.local', override: true });

interface MindsDBResponse {
  status: 'success' | 'error';
  error_message?: string;
}

interface PDFData {
  text: string;
  info: Record<string, any>;
  metadata: Record<string, any>;
  version: string;
  numpages: number;
}

const parseOptions = {
  pagerender: undefined,
  max: 0,
  version: 'v2.0.550'
};

async function trainModel(): Promise<void> {
  // Debug: Print environment status
  const envPath = path.join(process.cwd(), '.env.local');
  console.log('Reading .env.local from:', envPath);
  const envContent = await fs.readFile(envPath, 'utf8');
  console.log('Raw .env.local content:', envContent);

  const MINDSDB_API_ENDPOINT = 'https://cloud.mindsdb.com/api/sql/query';
  const MINDSDB_KEY = process.env.MINDSDB_RC_KEY;
  const TOGETHER_KEY = process.env.TOGETHER_API_KEY;

  console.log('\nEnvironment variables loaded:');
  console.log('MINDSDB_RC_KEY:', MINDSDB_KEY ? '✓ Present' : '✗ Missing');
  console.log('TOGETHER_API_KEY:', TOGETHER_KEY ? '✓ Present' : '✗ Missing');

  if (!MINDSDB_KEY) {
    throw new Error('MINDSDB_RC_KEY is not defined in environment variables');
  }

  if (!TOGETHER_KEY) {
    throw new Error('TOGETHER_API_KEY is not defined in environment variables');
  }

  try {
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
    console.log('Looking for PDFs in:', pdfDir);
    
    let files: string[];
    try {
      files = await readdir(pdfDir);
    } catch (error) {
      console.error('Error accessing pdfs directory:', error);
      throw new Error('public/pdfs directory not found. Please ensure the directory structure is correct.');
    }
    
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    console.log(`Found ${pdfFiles.length} PDF files to process:`, pdfFiles);
    
    if (pdfFiles.length === 0) {
      throw new Error('No PDF files found in public/pdfs directory');
    }

    // Set up database
    console.log('Setting up database...');
    const setupQuery = `
      CREATE DATABASE IF NOT EXISTS files_database
      WITH ENGINE = 'mysql';
    `;

    const setupResponse = await fetch(MINDSDB_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINDSDB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: setupQuery }),
    });

    if (!setupResponse.ok) {
      throw new Error(`Failed to setup database: ${setupResponse.statusText}`);
    }

    // Process PDFs
    for (const file of pdfFiles) {
      try {
        console.log(`Processing ${file}...`);
        const filePath = path.join(pdfDir, file);
        const dataBuffer = await readFile(filePath);

        // Parse PDF
        const pdfData = await pdfParse(dataBuffer, parseOptions) as PDFData;
        
        const cleanText = pdfData.text
          .replace(/'/g, "''")
          .replace(/[\r\n]+/g, ' ')
          .trim();

        const insertQuery = `
          INSERT INTO files_database.pdf_files (
            filename,
            text_content,
            file_path,
            created_at
          ) VALUES (
            '${file}',
            '${cleanText}',
            '${filePath.replace(/'/g, "''")}',
            CURRENT_TIMESTAMP
          );
        `;

        const response = await fetch(MINDSDB_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MINDSDB_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: insertQuery }),
        });

        if (!response.ok) {
          throw new Error(`MindsDB API error for file ${file}: ${response.statusText}`);
        }

        console.log(`Successfully processed ${file}`);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        continue;
      }
    }

    // Create model
    console.log('Creating Llama 3.2 Vision model...');
    const createModelQuery = `
      CREATE MODEL IF NOT EXISTS forms_project.forms_due_dates
      PREDICT due_date
      USING ENGINE = 'together',
      MODEL_NAME = 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      API_KEY = '${TOGETHER_KEY}',
      PROMPT_TEMPLATE = '
        [INST]
        You are an expert at analyzing forms and documents. Please identify any due dates, deadlines, or filing periods mentioned here:
        {text_content}
        
        For each deadline found, provide:
        1. Type of deadline (filing, payment, submission, etc.)
        2. The exact date or time period
        3. Any specific conditions
        [/INST]
      ';
    `;

    const createModelResponse = await fetch(MINDSDB_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINDSDB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createModelQuery }),
    });

    if (!createModelResponse.ok) {
      throw new Error(`Failed to create model: ${createModelResponse.statusText}`);
    }

    // Train model
    console.log('Training model...');
    const trainQuery = `
      RETRAIN forms_project.forms_due_dates
      FROM files_database.pdf_files
      USING text_content;
    `;

    const trainResponse = await fetch(MINDSDB_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINDSDB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: trainQuery }),
    });

    if (!trainResponse.ok) {
      throw new Error(`Failed to start model training: ${trainResponse.statusText}`);
    }

    console.log('Model training started successfully!');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Execute the training
trainModel().catch(console.error);