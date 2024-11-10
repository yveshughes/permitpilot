// src/app/api/forms/due-soon/route.ts
import { NextResponse } from 'next/server';

interface MindsDBRow {
  form_name: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  document_url: string;
}

interface DueForm {
  name: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  documentUrl: string;
}

export async function GET(): Promise<NextResponse<{ dueForms: DueForm[] } | { error: string }>> {
  try {
    const MINDSDB_API_ENDPOINT = 'https://cloud.mindsdb.com/api/sql/query';
    const API_KEY = process.env.MINDSDB_RC_KEY;

    if (!API_KEY) {
      throw new Error('MINDSDB_RC_KEY is not defined in environment variables');
    }

    // Query to get form due dates
    const query = `
      SELECT 
        f.name as form_name,
        p.due_date,
        CASE 
          WHEN DATEDIFF(p.due_date, NOW()) <= 7 THEN 'high'
          WHEN DATEDIFF(p.due_date, NOW()) <= 14 THEN 'medium'
          ELSE 'low'
        END as priority,
        f.resourceUrl as document_url
      FROM files_database.pdf_files as f
      JOIN forms_project.forms_due_dates as p
      WHERE p.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
      ORDER BY p.due_date ASC
      LIMIT 10;
    `;

    const response = await fetch(MINDSDB_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`MindsDB API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the results into the expected format
    const dueForms = (data.rows as MindsDBRow[]).map((row) => ({
      name: row.form_name,
      dueDate: new Date(row.due_date),
      priority: row.priority,
      documentUrl: row.document_url
    }));

    return NextResponse.json({ dueForms });
  } catch (error) {
    console.error('Error fetching due dates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch due forms' },
      { status: 500 }
    );
  }
}