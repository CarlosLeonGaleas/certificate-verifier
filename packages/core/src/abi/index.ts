import fs from 'fs/promises';
import path from 'path';

let academicCertificateI_abi = null;

// Función para cargar la ABI desde abi.json usando fetch
async function loadAcademicCertificateI_ABI() {
  try {
    const filePath = path.resolve(__dirname, './abi.json'); // ajusta el path si necesario
    const fileData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileData);
    academicCertificateI_abi = data.abi;
    return academicCertificateI_abi;
  } catch (error) {
    console.error('Error al cargar academicCertificateI_abi:', error);
    throw error;
  }
}

// Exporta la función en lugar de la ABI directamente
export { loadAcademicCertificateI_ABI };