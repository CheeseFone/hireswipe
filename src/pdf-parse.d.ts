declare module 'pdf-parse' {
    interface PDFParseOptions {
      version?: string;
    }
  
    interface PDFParseData {
      numpages: number;
      numrender: number;
      info: any;
      metadata: any;
      text: string;
      version: string;
    }
  
    function pdf(dataBuffer: Buffer, options?: PDFParseOptions): Promise<PDFParseData>;
  
    export = pdf;
  }