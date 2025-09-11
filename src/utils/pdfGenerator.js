import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFReport = (reportData, reportType, month, year) => {
    const doc = new jsPDF();
    
    // Configuration
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;
    
    // Titre principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const title = `Rapport ${reportType} - ${month} ${year}`;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
    
    yPosition += 20;
    
    // Date de génération
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateGeneration = `Généré le: ${new Date().toLocaleDateString('fr-FR')}`;
    doc.text(dateGeneration, pageWidth - margin - doc.getTextWidth(dateGeneration), yPosition);
    
    yPosition += 30;
    
    // Contenu spécifique selon le type de rapport
    switch (reportType) {
        case 'CPN':
            generateCPNPDFContent(doc, reportData, yPosition, margin);
            break;
        case 'Accouchement':
            generateAccouchementPDFContent(doc, reportData, yPosition, margin);
            break;
        case 'Planification':
            generatePlanificationPDFContent(doc, reportData, yPosition, margin);
            break;
        default:
            doc.text('Type de rapport non reconnu', margin, yPosition);
    }
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} sur ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
        doc.text('Centre de Santé Maternelle - Bénin', margin, doc.internal.pageSize.height - 10);
    }
    
    return doc;
};

const generateCPNPDFContent = (doc, data, startY, margin) => {
    let yPos = startY;
    
    // Statistiques générales
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques Générales', margin, yPos);
    yPos += 15;
    
    const generalStats = [
        ['Total des consultations CPN', data.totalConsultations || 0],
        ['Consultations terminées', data.cpnCompleted || 0],
        ['Consultations en attente', data.cpnPending || 0],
        ['Consultations planifiées', data.cpnPlanned || 0],
        ['Taux de completion (%)', `${data.tauxCompletion || 0}%`]
    ];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Indicateur', 'Valeur']],
        body: generalStats,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Répartition par statut
    if (yPos > 250) {
        doc.addPage();
        yPos = 30;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Répartition par Statut', margin, yPos);
    yPos += 15;
    
    const statusData = [
        ['Terminé', data.cpnCompleted || 0, `${((data.cpnCompleted || 0) / (data.totalConsultations || 1) * 100).toFixed(1)}%`],
        ['En attente', data.cpnPending || 0, `${((data.cpnPending || 0) / (data.totalConsultations || 1) * 100).toFixed(1)}%`],
        ['Planifié', data.cpnPlanned || 0, `${((data.cpnPlanned || 0) / (data.totalConsultations || 1) * 100).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Statut', 'Nombre', 'Pourcentage']],
        body: statusData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [52, 152, 219] }
    });
};

const generateAccouchementPDFContent = (doc, data, startY, margin) => {
    let yPos = startY;
    
    // Statistiques générales
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques Générales', margin, yPos);
    yPos += 15;
    
    const generalStats = [
        ['Total des accouchements', data.totalAccouchements || 0],
        ['Accouchements par voie basse', data.voieBasse || 0],
        ['Accouchements par césarienne', data.cesarienne || 0],
        ['Taux de césarienne (%)', `${data.tauxCesarienne || 0}%`],
        ['Total des enfants', data.totalEnfants || 0],
        ['Moyenne enfants/accouchement', (data.moyenneEnfantsParAccouchement || 0).toFixed(2)]
    ];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Indicateur', 'Valeur']],
        body: generalStats,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [231, 76, 60] }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Répartition par mode d'accouchement
    if (yPos > 200) {
        doc.addPage();
        yPos = 30;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Mode d\'Accouchement', margin, yPos);
    yPos += 15;
    
    const modeData = [
        ['Voie basse', data.voieBasse || 0, `${((data.voieBasse || 0) / (data.totalAccouchements || 1) * 100).toFixed(1)}%`],
        ['Césarienne', data.cesarienne || 0, `${((data.cesarienne || 0) / (data.totalAccouchements || 1) * 100).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Mode', 'Nombre', 'Pourcentage']],
        body: modeData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [192, 57, 43] }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Répartition par genre des enfants
    if (yPos > 200) {
        doc.addPage();
        yPos = 30;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Répartition par Genre des Enfants', margin, yPos);
    yPos += 15;
    
    const genderData = [
        ['Masculin', data.enfantsMasculins || 0, `${((data.enfantsMasculins || 0) / (data.totalEnfants || 1) * 100).toFixed(1)}%`],
        ['Féminin', data.enfantsFeminins || 0, `${((data.enfantsFeminins || 0) / (data.totalEnfants || 1) * 100).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Genre', 'Nombre', 'Pourcentage']],
        body: genderData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [155, 89, 182] }
    });
};

const generatePlanificationPDFContent = (doc, data, startY, margin) => {
    let yPos = startY;
    
    // Statistiques générales
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques Générales', margin, yPos);
    yPos += 15;
    
    const generalStats = [
        ['Total des planifications', data.totalPlanifications || 0],
        ['Méthode la plus populaire', data.methodePopulaire || 'N/A']
    ];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Indicateur', 'Valeur']],
        body: generalStats,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [46, 204, 113] }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Répartition par méthode contraceptive
    if (yPos > 180) {
        doc.addPage();
        yPos = 30;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Répartition par Méthode Contraceptive', margin, yPos);
    yPos += 15;
    
    const methodesData = Object.entries(data.methodesCount || {}).map(([methode, count]) => [
        methode.charAt(0).toUpperCase() + methode.slice(1),
        count,
        `${((count / (data.totalPlanifications || 1)) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
        startY: yPos,
        head: [['Méthode', 'Nombre', 'Pourcentage']],
        body: methodesData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [39, 174, 96] }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Répartition par genre
    if (yPos > 200) {
        doc.addPage();
        yPos = 30;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Répartition par Genre', margin, yPos);
    yPos += 15;
    
    const genderData = [
        ['Féminin', data.repartitionGenre?.feminin || 0, `${((data.repartitionGenre?.feminin || 0) / (data.totalPlanifications || 1) * 100).toFixed(1)}%`],
        ['Masculin', data.repartitionGenre?.masculin || 0, `${((data.repartitionGenre?.masculin || 0) / (data.totalPlanifications || 1) * 100).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Genre', 'Nombre', 'Pourcentage']],
        body: genderData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [26, 188, 156] }
    });
};
