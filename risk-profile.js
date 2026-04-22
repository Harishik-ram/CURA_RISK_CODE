This file path was: 'app/api/risk-profile/route.js';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireOwnership } from '@/lib/auth';
import { computeAndSavePatientRisk } from '../../utils/riskScorer';

export const dynamic = 'force-dynamic';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 });

    const ownerErr = requireOwnership(req, patientId, { allowProfessional: true });
    if (ownerErr) return ownerErr;

    const { rows } = await pool.query(`
      SELECT rp.*, p.gender, p.age_range
      FROM patient_risk_profile rp
      JOIN patients p ON p.id = rp.patient_id
      WHERE rp.patient_id = $1
    `, [patientId]);

    const existing = rows[0];
    const isStale = !existing ||
      existing.domain_scores === null ||
      (Array.isArray(existing.domain_scores) && existing.domain_scores.length > 0 && existing.domain_scores[0].excess_score === undefined);

    if (rows.length === 0 || isStale) {
      const result = await computeAndSavePatientRisk(patientId);
      if (!result) return NextResponse.json({ profile: null }, { status: 200 });
      const fresh = await pool.query(`
        SELECT rp.*, p.gender, p.age_range
        FROM patient_risk_profile rp
        JOIN patients p ON p.id = rp.patient_id
        WHERE rp.patient_id = $1
      `, [patientId]);
      return NextResponse.json({ profile: fresh.rows[0] || null });
    }

    return NextResponse.json({ profile: rows[0] });
  } catch (err) {
    console.error('GET risk-profile:', err);
    return NextResponse.json({ error: 'Failed to load risk profile' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { patientId } = await req.json();
    if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 });

    const ownerErr = requireOwnership(req, patientId);
    if (ownerErr) return ownerErr;

    await computeAndSavePatientRisk(patientId);
    const { rows } = await pool.query(`
      SELECT rp.*, p.gender, p.age_range
      FROM patient_risk_profile rp
      JOIN patients p ON p.id = rp.patient_id
      WHERE rp.patient_id = $1
    `, [patientId]);
    return NextResponse.json({ profile: rows[0] || null });
  } catch (err) {
    console.error('POST risk-profile:', err);
    return NextResponse.json({ error: 'Failed to compute risk profile' }, { status: 500 });
  }
}
