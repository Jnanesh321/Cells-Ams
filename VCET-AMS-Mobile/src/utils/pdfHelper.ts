import * as Print from 'expo-print';
import { Alert, Share, Platform } from 'react-native';
import {
  generateStudentReportHTML,
  generateClassReportHTML,
  generateDefaultersHTML,
  generateParentLetterHTML,
} from './pdfTemplates';

export type ReportType = 'individual' | 'class' | 'defaulters' | 'parent-letter';

export async function generatePDF(
  reportType: ReportType,
  data: any,
  title: string
): Promise<void> {
  let html = '';

  switch (reportType) {
    case 'individual':
      html = generateStudentReportHTML(data);
      break;
    case 'class':
      html = generateClassReportHTML(data);
      break;
    case 'defaulters':
      html = generateDefaultersHTML(data);
      break;
    case 'parent-letter':
      html = generateParentLetterHTML(data);
      break;
  }

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const filename = title.replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
    await Share.share({
      url: Platform.OS === 'ios' ? uri : uri,
      title: filename,
    });
  } catch (err: any) {
    Alert.alert('Error', `Failed to generate PDF: ${err.message}`);
  }
}
