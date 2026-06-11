// Utility to extract text from PDF, DOCX, and TXT files completely in the browser.

/**
 * Extract text from a File object.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractText(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (extension === 'txt') {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Failed to read TXT file."));
      reader.readAsText(file);
    } else if (extension === 'pdf') {
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const text = await extractTextFromPDF(arrayBuffer);
          resolve(text);
        } catch (error) {
          reject(new Error(`Failed to parse PDF: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read PDF file."));
      reader.readAsArrayBuffer(file);
    } else if (extension === 'docx') {
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const text = await extractTextFromDOCX(arrayBuffer);
          resolve(text);
        } catch (error) {
          reject(new Error(`Failed to parse DOCX: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read DOCX file."));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error(`Unsupported file type: .${extension}`));
    }
  });
}

/**
 * Extracts text from PDF ArrayBuffer using PDF.js
 * @param {ArrayBuffer} arrayBuffer 
 */
async function extractTextFromPDF(arrayBuffer) {
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  if (!pdfjsLib) {
    throw new Error("PDF.js library failed to load from CDN. Please check your connection.");
  }
  
  // Configure worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let text = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(' ') + '\n';
  }
  
  return text;
}

/**
 * Extracts text from DOCX ArrayBuffer using Mammoth.js
 * @param {ArrayBuffer} arrayBuffer 
 */
async function extractTextFromDOCX(arrayBuffer) {
  const mammoth = window.mammoth;
  if (!mammoth) {
    throw new Error("Mammoth.js library failed to load from CDN. Please check your connection.");
  }
  
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return result.value;
}
