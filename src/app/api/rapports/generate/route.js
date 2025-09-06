import { NextResponse } from 'next/server';
import { db } from '@/firebase/firebase';
import { collection, addDoc, Timestamp, where, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { uploadPDFToCloudinary } from '@/utils/cloudinaryUpload';

// Utilities replicated from hook
const getMonthIndex = (monthName) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months.indexOf(monthName);
};

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

async function generateCpnReport(startDate, endDate) {
  const cpnQuery = query(
    collection(db, 'consultations'),
    where('type', '==', 'CPN'),
    where('dateConsultation', '>=', Timestamp.fromDate(startDate)),
    where('dateConsultation', '<=', Timestamp.fromDate(endDate))
  );
  const cpnSnapshot = await getDocs(cpnQuery);

  let totalConsultations = cpnSnapshot.size;
  let cpnCompleted = 0;
  let cpnPending = 0;
  let cpnPlanned = 0;

  for (const consultationDoc of cpnSnapshot.docs) {
    const cQuery = query(
      collection(db, 'cpns'),
      where('consultationId', '==', consultationDoc.id)
    );
    const cpnDocs = await getDocs(cQuery);

    if (!cpnDocs.empty) {
      cpnCompleted++;
    } else {
      const consultationData = consultationDoc.data();
      const rdvDate = consultationData.rdv;
      const today = new Date().toISOString().split('T')[0];

      if (rdvDate === today) {
        cpnPending++;
      } else if (rdvDate > today) {
        cpnPlanned++;
      }
    }
  }

  return {
    totalConsultations,
    cpnCompleted,
    cpnPending,
    cpnPlanned,
    tauxCompletion: totalConsultations > 0 ? Math.round((cpnCompleted / totalConsultations) * 100) : 0,
  };
}

async function generateAccouchementReport(startDate, endDate) {
  const accouchementQuery = query(
    collection(db, 'accouchements'),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate))
  );
  const accouchementSnapshot = await getDocs(accouchementQuery);

  let totalAccouchements = accouchementSnapshot.size;
  let voieBasse = 0;
  let cesarienne = 0;
  let totalEnfants = 0;
  let enfantsMasculins = 0;
  let enfantsFeminins = 0;

  for (const accouchementDoc of accouchementSnapshot.docs) {
    const accouchementData = accouchementDoc.data();
    const mode = accouchementData.modeAccouchement?.toLowerCase() || '';

    if (mode.includes('voie basse') || mode.includes('naturel')) {
      voieBasse++;
    } else if (mode.includes('césarienne') || mode.includes('cesarienne')) {
      cesarienne++;
    }

    const enfantsQuery = query(
      collection(db, 'enfants'),
      where('accouchementId', '==', accouchementDoc.id)
    );
    const enfantsSnapshot = await getDocs(enfantsQuery);

    totalEnfants += enfantsSnapshot.size;

    enfantsSnapshot.docs.forEach((enfantDoc) => {
      const enfantData = enfantDoc.data();
      const sexe = enfantData.sexeEnfant?.toLowerCase() || '';

      if (sexe.includes('masculin')) {
        enfantsMasculins++;
      } else if (sexe.includes('féminin')) {
        enfantsFeminins++;
      }
    });
  }

  return {
    totalAccouchements,
    voieBasse,
    cesarienne,
    tauxCesarienne: totalAccouchements > 0 ? Math.round((cesarienne / totalAccouchements) * 100) : 0,
    totalEnfants,
    enfantsMasculins,
    enfantsFeminins,
    moyenneEnfantsParAccouchement: totalAccouchements > 0 ? Math.round((totalEnfants / totalAccouchements) * 100) / 100 : 0,
  };
}

async function generatePlanificationReport(startDate, endDate) {
  const planificationQuery = query(
    collection(db, 'planifications'),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate))
  );
  const planificationSnapshot = await getDocs(planificationQuery);

  let totalPlanifications = planificationSnapshot.size;
  let methodesCount = {
    implant: 0,
    pilule: 0,
    injectable: 0,
    diu: 0,
    preservatif: 0,
    autre: 0,
  };
  let feminin = 0;
  let masculin = 0;

  planificationSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const methode = data.methodeChoisis?.toLowerCase() || '';
    const sexe = data.sexe?.toLowerCase() || '';

    if (methode.includes('implant')) {
      methodesCount.implant++;
    } else if (methode.includes('pilule')) {
      methodesCount.pilule++;
    } else if (methode.includes('injectable')) {
      methodesCount.injectable++;
    } else if (methode.includes('diu')) {
      methodesCount.diu++;
    } else if (methode.includes('préservatif') || methode.includes('preservatif')) {
      methodesCount.preservatif++;
    } else {
      methodesCount.autre++;
    }

    if (sexe.includes('féminin') || sexe.includes('feminin')) {
      feminin++;
    } else if (sexe.includes('masculin')) {
      masculin++;
    }
  });

  const methodePopulaire = Object.entries(methodesCount).reduce((a, b) =>
    methodesCount[a[0]] > methodesCount[b[0]] ? a : b
  )[0];

  return {
    totalPlanifications,
    methodesCount,
    methodePopulaire: capitalizeFirstLetter(methodePopulaire),
    repartitionGenre: { feminin, masculin },
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, mois, annee } = body || {};
    if (!type || !mois || !annee) {
      return NextResponse.json({ success: false, error: 'Champs manquants' }, { status: 400 });
    }

    const monthIndex = getMonthIndex(mois);
    if (monthIndex < 0) {
      return NextResponse.json({ success: false, error: 'Mois invalide' }, { status: 400 });
    }

    const startDate = new Date(annee, monthIndex, 1);
    const endDate = new Date(annee, monthIndex + 1, 0, 23, 59, 59);

    let reportData = {};
    switch (type) {
      case 'CPN':
        reportData = await generateCpnReport(startDate, endDate);
        break;
      case 'Accouchement':
        reportData = await generateAccouchementReport(startDate, endDate);
        break;
      case 'Planification':
        reportData = await generatePlanificationReport(startDate, endDate);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Type de rapport non supporté' }, { status: 400 });
    }

    // Generate PDF
    const pdf = generatePDFReport(reportData, type, mois, annee);
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Upload to Cloudinary
    const fileName = `${type}_${mois}_${annee}.pdf`;
    const cloudinaryResult = await uploadPDFToCloudinary(pdfBuffer, fileName, 'rapports-medicaux');

    // Save in Firestore
    const reportDocument = {
      type,
      mois,
      annee,
      data: reportData,
      pdfUrl: cloudinaryResult.url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      fileSize: cloudinaryResult.bytes,
      createdAt: Timestamp.now(),
      generatedBy: 'system',
    };

    const docRef = await addDoc(collection(db, 'rapports'), reportDocument);

    return NextResponse.json({
      success: true,
      reportId: docRef.id,
      data: reportData,
      pdfUrl: cloudinaryResult.url,
      cloudinaryPublicId: cloudinaryResult.public_id,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}
