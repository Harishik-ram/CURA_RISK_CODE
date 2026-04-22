This file path was: ' app/api/caretaker/risk-profile/route.js'

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { computeAndSavePatientRisk } from '../../../utils/riskScorer';

export const dynamic = 'force-dynamic';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const caretakerId = searchParams.get('caretakerId');
    if (!caretakerId) return NextResponse.json({ error: 'caretakerId required' }, { status: 400 });

    // Get patient linked to this caretaker
    const pdRes = await pool.query(
      'SELECT patient_id FROM personal_details WHERE caretaker_id = $1 LIMIT 1', [caretakerId]
    );
    if (pdRes.rows.length === 0) return NextResponse.json({ profile: null }, { status: 200 });
    const patientId = pdRes.rows[0].patient_id;

    const genderQuery = `
      SELECT rp.*,
        COALESCE(p.gender, pd.gender) AS gender,
        COALESCE(p.age_range, pd.age_range) AS age_range
      FROM patient_risk_profile rp
      LEFT JOIN patients p ON p.id = rp.patient_id
      LEFT JOIN personal_details pd ON pd.patient_id = rp.patient_id
      WHERE rp.patient_id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(genderQuery, [patientId]);

    const existing = rows[0];
    const isStale = !existing ||
      existing.domain_scores === null ||
      (Array.isArray(existing.domain_scores) && existing.domain_scores.length > 0 && existing.domain_scores[0].excess_score === undefined);

    if (rows.length === 0 || isStale) {
      const result = await computeAndSavePatientRisk(patientId);
      if (!result) return NextResponse.json({ profile: null }, { status: 200 });
      const fresh = await pool.query(genderQuery, [patientId]);
      return NextResponse.json({ profile: fresh.rows[0] || null });
    }

    return NextResponse.json({ profile: rows[0] });
  } catch (err) {
    console.error('GET caretaker risk-profile:', err);
    return NextResponse.json({ error: 'Failed to load risk profile' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { caretakerId } = await req.json();
    if (!caretakerId) return NextResponse.json({ error: 'caretakerId required' }, { status: 400 });

    const pdRes = await pool.query(
      'SELECT patient_id FROM personal_details WHERE caretaker_id = $1 LIMIT 1', [caretakerId]
    );
    if (pdRes.rows.length === 0) return NextResponse.json({ profile: null }, { status: 200 });
    const patientId = pdRes.rows[0].patient_id;

    await computeAndSavePatientRisk(patientId);
    const { rows } = await pool.query(`
      SELECT rp.*,
        COALESCE(p.gender, pd.gender) AS gender,
        COALESCE(p.age_range, pd.age_range) AS age_range
      FROM patient_risk_profile rp
      LEFT JOIN patients p ON p.id = rp.patient_id
      LEFT JOIN personal_details pd ON pd.patient_id = rp.patient_id
      WHERE rp.patient_id = $1 LIMIT 1
    `, [patientId]);
    return NextResponse.json({ profile: rows[0] || null });
  } catch (err) {
    console.error('POST caretaker risk-profile:', err);
    return NextResponse.json({ error: 'Failed to compute risk profile' }, { status: 500 });
  }
}
