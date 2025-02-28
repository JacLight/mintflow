declare module 'pdf-parse' {
    interface PDFData {
        text: string;
        numpages: number;
        numrender: number;
        info: {
            PDFFormatVersion: string;
            IsAcroFormPresent: boolean;
            IsXFAPresent: boolean;
            [key: string]: any;
        };
        metadata: any;
        version: string;
    }

    function parse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
    
    export = parse;
}
