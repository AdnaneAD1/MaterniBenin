import { NextResponse } from 'next/server';
import smsService from '@/services/smsService';

/**
 * POST /api/test-sms-format
 * Tester le formatage des numéros de téléphone
 * 
 * Body: { "phone": "0160807271" }
 * ou
 * Body: { "phones": ["0160807271", "60807271", "+22960807271"] }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Test d'un seul numéro
    if (body.phone) {
      const formatted = smsService.formatPhoneNumber(body.phone);
      
      return NextResponse.json({
        input: body.phone,
        output: formatted,
        valid: formatted !== null,
        format: formatted ? 'E.164 (+229XXXXXXXX)' : 'Invalid'
      });
    }
    
    // Test de plusieurs numéros
    if (body.phones && Array.isArray(body.phones)) {
      const results = body.phones.map(phone => {
        const formatted = smsService.formatPhoneNumber(phone);
        return {
          input: phone,
          output: formatted,
          valid: formatted !== null
        };
      });
      
      const validCount = results.filter(r => r.valid).length;
      
      return NextResponse.json({
        total: results.length,
        valid: validCount,
        invalid: results.length - validCount,
        results
      });
    }
    
    return NextResponse.json(
      { error: 'Paramètre "phone" ou "phones" requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur test formatage:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test-sms-format
 * Exemples de formats acceptés
 */
export async function GET() {
  return NextResponse.json({
    service: 'Test de formatage SMS',
    description: 'Teste le formatage des numéros béninois pour Twilio',
    formats_acceptes: [
      {
        format: '0160807271',
        description: 'Format local avec 0 (le plus courant)',
        exemple: '0160807271 → +22960807271'
      },
      {
        format: '60807271',
        description: 'Format local sans 0 (cas rare)',
        exemple: '60807271 → +22960807271'
      },
      {
        format: '+22960807271',
        description: 'Déjà au format international',
        exemple: '+22960807271 → +22960807271'
      },
      {
        format: '01 60 80 72 71',
        description: 'Avec espaces (nettoyés automatiquement)',
        exemple: '01 60 80 72 71 → +22960807271'
      }
    ],
    exemples_utilisation: {
      test_un_numero: {
        method: 'POST',
        url: '/api/test-sms-format',
        body: {
          phone: '0160807271'
        }
      },
      test_plusieurs_numeros: {
        method: 'POST',
        url: '/api/test-sms-format',
        body: {
          phones: ['0160807271', '60807271', '+22960807271']
        }
      }
    },
    curl_exemples: {
      test_simple: 'curl -X POST http://localhost:3000/api/test-sms-format -H "Content-Type: application/json" -d \'{"phone": "0160807271"}\'',
      test_multiple: 'curl -X POST http://localhost:3000/api/test-sms-format -H "Content-Type: application/json" -d \'{"phones": ["0160807271", "60807271", "123456"]}\''
    }
  });
}
