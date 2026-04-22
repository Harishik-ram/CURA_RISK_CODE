// This file path was: 'app/utils/riskScorer.js'

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Vaccine name → DB column ─────────────────────────────────────────────────
const VACCINE_MAP = {
  'BCG':                    'bcg_missing_score',
  'OPV (Birth Dose)':       'opv_0_missing_score',
  'Hepatitis B (Birth)':    'hepb_birth_missing_score',
  'DPT':                    'dpt_missing_score',
  'IPV':                    'ipv_missing_score',
  'Hib':                    'hib_missing_score',
  'Rotavirus':              'rotavirus_missing_score',
  'PCV':                    'pcv_missing_score',
  'MMR':                    'mmr_missing_score',
  'Varicella':              'varicella_missing_score',
  'Hepatitis A':            'hepa_missing_score',
  'DPT Booster':            'dpt_booster_missing_score',
  'OPV Booster':            'opv_booster_missing_score',
  'Tdap':                   'tdap_missing_score',
  'Influenza':              'influenza_missing_score',
  'HPV':                    'hpv_missing_score',
  'COVID-19':               'covid19_missing_score',
  'Td Booster':             'td_booster_missing_score',
  'Zoster':                 'zoster_missing_score',
  'Pneumococcal':           'pneumococcal_missing_score',
  'COVID-19 Booster':       'covid19_booster_missing_score',
};

// ── Age range → DB column ────────────────────────────────────────────────────
const AGE_MAP = {
  '0–28 days':                      'age_0_28_days_risk',
  '29 days to 1 year':              'age_29_days_to_1_year_risk',
  '1 year to 3 years':              'age_1_to_3_years_risk',
  '4 years to 5 years':             'age_4_to_5_years_risk',
  '6 years to 12 years':            'age_6_to_12_years_risk',
  '13 years to 17 years':           'age_13_to_17_years_risk',
  '18 years to 25 years':           'age_18_to_25_years_risk',
  '26 years to 39 years':           'age_26_to_39_years_risk',
  '40 years to 59 years':           'age_40_to_59_years_risk',
  '60 years to 74 years':           'age_60_to_74_years_risk',
  '75 years and above (Geriatric)': 'age_75_years_and_above_risk',
};

// ── Blood group → DB column ──────────────────────────────────────────────────
const BLOOD_MAP = {
  'A+': 'bg_a_pos_rf', 'A-': 'bg_a_neg_rf',
  'B+': 'bg_b_pos_rf', 'B-': 'bg_b_neg_rf',
  'AB+': 'bg_ab_pos_rf', 'AB-': 'bg_ab_neg_rf',
  'O+': 'bg_o_pos_rf', 'O-': 'bg_o_neg_rf',
};

// ── Ethnicity → DB column ────────────────────────────────────────────────────
const ETHNICITY_MAP = {
  // Exact form values
  'Asian':                            'eth_asian_rf',
  'Black/African':                    'eth_black_african_rf',
  'Caucasian/White':                  'eth_white_rf',
  'Hispanic/Latino':                  'eth_hispanic_latino_rf',
  'Middle Eastern / North African':   'eth_middleeastern_northafrican_rf',
  'Native American / Alaska Native':  'eth_nativeamerican_alaska_rf',
  'Native Hawaiian / Pacific Islander':'eth_nativehawaiian_pacific_rf',
  'Mixed':                            'eth_mixed_multiracial_rf',
  'ANI (Ancestral North Indian)':     'eth_ani_rf',
  'ASI (Ancestral South Indian)':     'eth_asi_rf',
  'AAA (Austro-Asiatic Ancestry)':    'eth_aaa_rf',
  'ATB (Ancestral Tibeto-Burman)':    'eth_atb_rf',
  // Legacy aliases (kept for existing data)
  'Black / African':                  'eth_black_african_rf',
  'Hispanic / Latino':                'eth_hispanic_latino_rf',
  'Native American / Alaska':         'eth_nativeamerican_alaska_rf',
  'Native Hawaiian / Pacific':        'eth_nativehawaiian_pacific_rf',
  'White / Caucasian':                'eth_white_rf',
  'Mixed / Multiracial':              'eth_mixed_multiracial_rf',
  'AAA (Austro-Asiatic)':             'eth_aaa_rf',
  'ATB (Tibeto-Burman)':              'eth_atb_rf',
};

// ── Residence / Travel → DB column ──────────────────────────────────────────
const COUNTRY_TO_RESIDENCE = {
  'India':                'residence_india_rf',
  'United States':        'residence_united_states_rf',
  'United Kingdom':       'residence_united_kingdom_rf',
  'Canada':               'residence_canada_rf',
  'Australia':            'residence_australia_rf',
  'United Arab Emirates': 'residence_united_arab_emirates_rf',
  'Saudi Arabia':         'residence_saudi_arabia_rf',
  'Singapore':            'residence_singapore_rf',
  'Malaysia':             'residence_malaysia_rf',
  'Germany':              'residence_germany_rf',
  'France':               'residence_france_rf',
  'South Africa':         'residence_south_africa_rf',
  'Nepal':                'residence_nepal_rf',
  'Sri Lanka':            'residence_sri_lanka_rf',
  'Bangladesh':           'residence_bangladesh_rf',
  'Other':                'residence_others_rf',
};

const COUNTRY_TO_TRAVEL = {
  'India':                'travel_india_rf',
  'United States':        'travel_united_states_rf',
  'United Kingdom':       'travel_united_kingdom_rf',
  'Canada':               'travel_canada_rf',
  'Australia':            'travel_australia_rf',
  'United Arab Emirates': 'travel_united_arab_emirates_rf',
  'Saudi Arabia':         'travel_saudi_arabia_rf',
  'Singapore':            'travel_singapore_rf',
  'Malaysia':             'travel_malaysia_rf',
  'Germany':              'travel_germany_rf',
  'France':               'travel_france_rf',
  'South Africa':         'travel_south_africa_rf',
  'Nepal':                'travel_nepal_rf',
  'Sri Lanka':            'travel_sri_lanka_rf',
  'Bangladesh':           'travel_bangladesh_rf',
  'Other':                'travel_others_rf',
};

// ── Occupation → DB column ───────────────────────────────────────────────────
const OCCUPATION_MAP = {
  'None known':             'occexp_not_known_rf',
  'Dust / Silica':          'occexp_dust_silica_rf',
  'Chemical Solvents':      'occexp_chemical_solvents_rf',
  'Pesticides':             'occexp_pesticides_rf',
  'Radiation':              'occexp_radiation_rf',
  'Asbestos':               'occexp_asbestos_rf',
  'Heavy Metals':           'occexp_heavy_metals_rf',
  'Biological Hazards':     'occexp_biological_fluids_infectious_rf',
  'Smoke / Fumes':          'occexp_smoke_fumes_rf',
  'Heat / Cold Extremes':   'occexp_extreme_heat_rf',
  'Noise':                  'occexp_noise_vibration_rf',
  'Shift Work / Night Duty':'occexp_shiftwork_nightduty_rf',
  '> 40 hours/week':        'occexp_work_over_40hrs_rf',
};

// ── Comorbidity → DB column ──────────────────────────────────────────────────
const COMORBIDITY_MAP = {
  'None known':                 'comorb_none_known_rf',
  'None':                       'comorb_none_known_rf',
  'Hypertension':               'comorb_hypertension_rf',
  'Diabetes Mellitus':          'comorb_diabetes_mellitus_rf',
  'Diabetes':                   'comorb_diabetes_mellitus_rf',
  'Asthma':                     'comorb_asthma_rf',
  'Asthma / Respiratory Disease':'comorb_asthma_rf',
  'Thyroid Disorder':           'comorb_thyroid_disorder_rf',
  'Heart Disease':              'comorb_heart_disease_rf',
  'Kidney Disease':             'comorb_kidney_disease_rf',
  'Liver Disease':              'comorb_liver_disease_rf',
  'Epilepsy':                   'comorb_epilepsy_rf',
  'Depression/Anxiety':         'comorb_depression_anxiety_rf',
  'Depression / Anxiety':       'comorb_depression_anxiety_rf',
  'Other':                      'comorb_other_rf',
};

// ── Surgery → DB column ──────────────────────────────────────────────────────
const SURGERY_MAP = {
  'None':                          'surg_none_rf',
  'Appendectomy':                  'surg_appendectomy_rf',
  'Caesarean Section':             'surg_cesarean_section_rf',
  'Hysterectomy':                  'surg_hysterectomy_rf',
  'Cholecystectomy':               'surg_gallbladder_surgery_rf',
  'Hernia Repair':                 'surg_hernia_repair_rf',
  'Orthopedic Surgery':            'surg_orthopedic_surgery_rf',
  'Cardiac Surgery':               'surg_cardiac_surgery_rf',
  'ENT Surgery':                   'surg_ent_surgery_rf',
  'Cataract Surgery':              'surg_cataract_surgery_rf',
  'Hemorrhoidectomy':              'surg_hemorrhoidectomy_rf',
  'Knee Replacement':              'surg_knee_replacement_rf',
  'Hip Replacement':               'surg_hip_replacement_rf',
  'Tonsillectomy / Adenoidectomy': 'surg_tonsillectomy_adenoidectomy_rf',
};

// ── Medication → DB column ───────────────────────────────────────────────────
const MEDICATION_MAP = {
  'None currently':         'med_none_rf',
  'Antihypertensives':      'med_antihypertensives_rf',
  'Antidiabetics':          'med_antidiabetics_rf',
  'Anticoagulants':         'med_anticoagulants_rf',
  'Antiplatelets':          'med_antiplatelets_rf',
  'Steroids':               'med_steroids_rf',
  'Immunosuppressants':     'med_immunosuppressants_rf',
  'Chemotherapy':           'med_chemotherapy_rf',
  'Hormonal Therapy':       'med_hormonal_therapy_rf',
  'Antidepressants':        'med_antidepressants_rf',
  'Antipsychotics':         'med_antipsychotics_rf',
  'Antiepileptics':         'med_antiepileptics_rf',
  'NSAIDs':                 'med_nsaids_rf',
  'Opioids':                'med_opioids_rf',
  'Long-term Antibiotics':  'med_antibiotics_longterm_rf',
  'Thyroid Medications':    'med_thyroid_medications_rf',
  'Asthma Medications':     'med_asthma_medications_rf',
  'Cardiac Medications':    'med_cardiac_medications_rf',
  'Supplements / Herbal':   'med_supplements_herbal_rf',
};

// ── Allergy → DB column ──────────────────────────────────────────────────────
const ALLERGY_MAP = {
  'No known allergies': 'allergy_no_known_allergies_rf',
  'Penicillin':         'allergy_penicillin_rf',
  'Sulfa Drugs':        'allergy_sulfa_drugs_rf',
  'NSAIDs':             'allergy_nsaids_rf',
  'Food Allergy':       'allergy_food_allergy_rf',
  'Dust Allergy':       'allergy_dust_allergy_rf',
  'Pollen Allergy':     'allergy_pollen_allergy_rf',
  'Latex Allergy':      'allergy_latex_allergy_rf',
  'Insect Sting':       'allergy_insect_sting_allergy_rf',
  'Contrast Dye':       'allergy_contrast_dye_allergy_rf',
  'Other':              'allergy_other_rf',
};

// ── Addiction → DB column ────────────────────────────────────────────────────
const ADDICTION_MAP = {
  'None':                    'addiction_none_rf',
  'Tobacco / Smoking':       'addiction_tobacco_smoking_rf',
  'Smokeless Tobacco':       'addiction_smokeless_tobacco_rf',
  'Alcohol':                 'addiction_alcohol_use_rf',
  'Cannabis':                'addiction_cannabis_use_rf',
  'Opioid Dependence':       'addiction_opioid_dependence_rf',
  'Sedatives / Sleeping Pills':'addiction_sedative_sleepingpill_dependence_rf',
  'Stimulants':              'addiction_stimulant_use_rf',
  'Betel Nut / Areca Nut':   'addiction_betelnut_arecanut_rf',
  'Excess Caffeine':         'addiction_excess_caffeine_rf',
  'Other':                   'addiction_other_rf',
};

// ── Injury → DB column ───────────────────────────────────────────────────────
const INJURY_MAP = {
  'None significant':        'injury_none_significant_rf',
  'Road Traffic Accident':   'injury_road_traffic_accident_rf',
  'Fall Injury':             'injury_fall_injury_rf',
  'Fracture History':        'injury_fracture_history_rf',
  'Head Injury / Concussion':'injury_head_injury_concussion_rf',
  'Burn Injury':             'injury_burn_injury_rf',
  'Workplace Injury':        'injury_workplace_injury_rf',
  'Sports Injury':           'injury_sports_injury_rf',
  'Poisoning / Toxic Exposure':'injury_poisoning_toxic_exposure_rf',
  'Animal / Insect Bite':    'injury_animal_insect_bite_rf',
};

// ── Coliving → DB column ─────────────────────────────────────────────────────
const COLIVING_MAP = {
  'Lives in hostel':                  'coliving_hostel_rf',
  'Prison / correctional facility':   'coliving_prison_rf',
  'Nursing home / assisted care':     'coliving_nursinghome_rf',
  'Military barracks':                'coliving_barracks_rf',
  'Dormitories / college housing':    'coliving_dormitories_rf',
  'Refugee / displacement camp':      'coliving_refugee_camps_rf',
  'Overcrowded apartment':            'coliving_overcrowded_apartments_rf',
  'Living with infectious patient':   'coliving_living_with_patient_rf',
  'Living with immunocompromised person': 'coliving_living_with_immunocompromised_rf',
  'Living with newborn':              'coliving_living_with_newborn_rf',
  'Living with substance user':       'coliving_living_with_substanceuser_rf',
  'Multigenerational household':      'coliving_multigenerational_rf',
  'Near industrial zone':             'coliving_near_industrial_zone_rf',
  'Near high-traffic road':           'coliving_near_hightraffic_rf',
};

// ── Diet → DB column ─────────────────────────────────────────────────────────
const DIET_MAP = {
  'High grains / carbohydrates':  'diet_grains_carbohydrates_rf',
  'Pulses / legumes (frequent)':  'diet_pulses_legumes_rf',
  'Red meat (frequent)':          'diet_red_meat_rf',
  'Processed / fried foods':      'diet_processed_fried_foods_rf',
  'Sugary foods & beverages':     'diet_sugary_foods_beverages_rf',
  'High salt / sodium diet':      'diet_salt_processed_sodium_rf',
  'Dairy / high fat':             'diet_dairy_highfat_rf',
  'Seafood / fish (frequent)':    'diet_seafood_fish_rf',
  'Street food / contaminated food': 'diet_street_food_contaminated_rf',
  'Ultra-processed foods':        'diet_ultraprocessed_foods_rf',
};

// ── Pet → DB column ──────────────────────────────────────────────────────────
const PET_MAP = {
  'No pets':          'pet_no_pets_diseasespecific_prob_0_1',
  'No pets at home':  'pet_no_pets_diseasespecific_prob_0_1',
  'Dog':           'pet_dog_diseasespecific_prob_0_1',
  'Cat':           'pet_cat_diseasespecific_prob_0_1',
  'Bird':          'pet_bird_diseasespecific_prob_0_1',
  'Rabbit':        'pet_rabbit_diseasespecific_prob_0_1',
  'Cow / Buffalo': 'pet_cow_buffalo_diseasespecific_prob_0_1',
  'Goat / Sheep':  'pet_goat_sheep_diseasespecific_prob_0_1',
  'Multiple pets': 'pet_multiple_pets_diseasespecific_prob_0_1',
  'Other':         'pet_other_diseasespecific_prob_0_1',
};

// ── Category subtotal columns ────────────────────────────────────────────────
const CATEGORY_COLS = {
  'Age':          'sub_age_risk',
  'Vaccine':      'sub_vaccine_missing',
  'Gender':       'sub_gender',
  'Blood Group':  'sub_blood_group_risk',
  'Ethnicity':    'sub_ethinicity_risk',
  'Residence':    'sub_residence_risk',
  'Travel':       'sub_travel_risk',
  'BMI':          'sub_bmi_risk',
  'Occupation':   'sub_occupation_risk',
  'Comorbidity':  'sub_comorbidity_risk',
  'Surgery':      'sub_surgery_risk',
  'Medication':   'sub_medication_risk',
  'Allergy':      'sub_allergy_risk',
  'Addiction':    'sub_addiction_risk',
  'Injury':       'sub_injury_risk',
  'Coliving':     'sub_coliving_risk',
  'Diet':         'sub_diet_risk',
  'Pet':          'sub_pet_risk',
  'Family':       'sub_family_risk',
};

// ── BMI calculation ──────────────────────────────────────────────────────────
function getBmiColumn(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const bmi = weightKg / ((heightCm / 100) ** 2);
  if (bmi < 18.5)  return 'bmi_underweight_rf';
  if (bmi < 25)    return 'bmi_normal_weight_rf';
  if (bmi < 30)    return 'bmi_overweight_rf';
  if (bmi < 35)    return 'bmi_obesity_class_i_rf';
  if (bmi < 40)    return 'bmi_obesity_class_ii_rf';
  return 'bmi_obesity_class_iii_rf';
}

// ── Build patient risk-factor vector (set of active DB columns) ───────────────
function buildPatientVector(details) {
  const active = new Set();

  // Age
  if (details.age_range && AGE_MAP[details.age_range]) {
    active.add(AGE_MAP[details.age_range]);
  }

  // Vaccines — only 'Missing' status contributes to risk; Completed = no impact
  const vaccinations = details.vaccinations || [];
  for (const v of vaccinations) {
    const name   = typeof v === 'string' ? v : v.name;
    const status = typeof v === 'object' ? v.status : null;
    if (status !== 'Missing') continue;
    const col = VACCINE_MAP[name];
    if (col) active.add(col);
  }

  // Gender
  if (details.gender === 'Male')   active.add('male');
  else if (details.gender === 'Female') active.add('female');
  else if (details.gender)         active.add('other');

  // Blood group
  const bgCol = BLOOD_MAP[details.blood_group];
  if (bgCol) active.add(bgCol);
  else if (details.blood_group)    active.add('bg_unknown_rf');

  // Ethnicity
  const ethCol = ETHNICITY_MAP[details.ethnicity];
  if (ethCol) active.add(ethCol);

  // Residence
  for (const country of (details.residence_history || [])) {
    const col = COUNTRY_TO_RESIDENCE[country];
    if (col) active.add(col);
  }

  // Travel
  for (const country of (details.travel_history || [])) {
    const col = COUNTRY_TO_TRAVEL[country];
    if (col) active.add(col);
  }

  // BMI
  const bmiCol = getBmiColumn(details.height_cm, details.weight_kg);
  if (bmiCol) active.add(bmiCol);

  // Pregnancy — activated only when stage_of_life is Pregnancy or fertility treatment active
  const sol = (details.stage_of_life || '').toLowerCase();
  const fertility = (details.assisted_fertility || '').toLowerCase();
  if (
    sol.includes('pregnan') ||
    fertility === 'ivf' || fertility === 'iui' || fertility === 'ovulation induction'
  ) {
    active.add('pregnancy_risk');
  }

  // Occupational
  for (const o of (details.occupational_exposures || [])) {
    const col = OCCUPATION_MAP[o];
    if (col) active.add(col);
  }

  // Comorbidities
  for (const c of (details.existing_conditions || [])) {
    const col = COMORBIDITY_MAP[c];
    if (col) active.add(col);
  }

  // Surgeries
  for (const s of (details.past_surgeries || [])) {
    const col = SURGERY_MAP[s];
    if (col) active.add(col);
  }

  // Medications
  for (const m of (details.current_medications || [])) {
    const col = MEDICATION_MAP[m];
    if (col) active.add(col);
  }

  // Allergies
  for (const a of (details.known_allergies || [])) {
    const col = ALLERGY_MAP[a];
    if (col) active.add(col);
  }

  // Addictions
  for (const a of (details.addictions || [])) {
    const col = ADDICTION_MAP[a];
    if (col) active.add(col);
  }

  // Injuries
  for (const i of (details.injuries || [])) {
    const col = INJURY_MAP[i];
    if (col) active.add(col);
  }

  // Coliving
  for (const c of (details.coliving_situations || [])) {
    const col = COLIVING_MAP[c];
    if (col) active.add(col);
  }

  // Diet
  for (const d of (details.diet_patterns || [])) {
    const col = DIET_MAP[d];
    if (col) active.add(col);
  }

  // Pet
  const petCol = PET_MAP[details.pets_at_home];
  if (petCol) active.add(petCol);

  // Family history — which relations have any recorded condition
  const famRelMap = {
    'father':               ['famhist_father_rf'],
    'mother':               ['famhist_mother_rf'],
    'siblings':             ['famhist_siblings_rf'],
    'paternal_grandparents':['famhist_paternal_grandfather_rf', 'famhist_paternal_grandmother_rf'],
    'maternal_grandparents':['famhist_maternal_grandfather_rf', 'famhist_maternal_grandmother_rf'],
    'paternal_uncles_aunts':['famhist_paternal_uncles_rf', 'famhist_paternal_aunts_rf'],
    'maternal_uncles_aunts':['famhist_maternal_uncles_rf', 'famhist_maternal_aunts_rf'],
  };

  for (const entry of (details.family_health_history || [])) {
    for (const rel of (entry.relations || [])) {
      for (const col of (famRelMap[rel] || [])) {
        active.add(col);
      }
    }
  }

  return active;
}

// ── Family history: condition → clinical domain(s) ───────────────────────────
// The famhist_* DB columns encode generic heritability (cardiovascular always
// dominates), so we strip them from domain scoring and apply a condition-specific
// boost instead — family members with bone disorders should boost MSK, not cardio.
const FAMHIST_COLS = new Set([
  'famhist_father_rf','famhist_mother_rf','famhist_siblings_rf',
  'famhist_paternal_grandfather_rf','famhist_paternal_grandmother_rf',
  'famhist_maternal_grandfather_rf','famhist_maternal_grandmother_rf',
  'famhist_paternal_aunts_rf','famhist_paternal_uncles_rf',
  'famhist_maternal_aunts_rf','famhist_maternal_uncles_rf',
]);

const FAMILY_CONDITION_DOMAIN_MAP = {
  'Heart Disease / Cardiovascular': ['Cardiovascular'],
  'Hypertension':                   ['Cardiovascular'],
  'Stroke':                         ['Cardiovascular', 'Neurology'],
  'Diabetes':                       ['Endocrine/Metabolic'],
  'Thyroid Disorder':               ['Endocrine/Metabolic'],
  'Cancer / Neoplasms':             ['Oncology'],
  'Mental Health Disorders':        ['Mental Health'],
  'Kidney Disease':                 ['Genitourinary'],
  'Liver Disease':                  ['Gastroenterology'],
  'Digestive Disorders':            ['Gastroenterology'],
  'Asthma / Respiratory Disease':   ['Respiratory'],
  'Neurological Disorders':         ['Neurology'],
  'Bone / Joint Disorders':         ['MSK/Rheumatology'],
  'Eye Disorders':                  ['Ophthalmology'],
  'Blood Disorders':                ['Hematology'],
  'Skin Disorders':                 ['Dermatology'],
  'Infectious Diseases':            ['Infectious'],
};
// Max boost when all 7 relations have the condition — calibrated so it
// clearly overcomes the base demographic spread (which peaks at ~2.2).
const MAX_FAMILY_BOOST = 8;
const MAX_RELATIONS    = 7;

// ── Main scorer ───────────────────────────────────────────────────────────────
export async function computeAndSavePatientRisk(patientId, topN = 20) {
  const client = await pool.connect();
  try {
    // Load patient details — join patients table to get authoritative age_range and gender
    // (age_range is never written to personal_details by the POST route)
    const detRes = await client.query(`
      SELECT pd.*,
        COALESCE(p.age_range, pd.age_range) AS age_range,
        COALESCE(p.gender,    pd.gender)    AS gender
      FROM personal_details pd
      LEFT JOIN patients p ON p.id = pd.patient_id
      WHERE pd.patient_id = $1
    `, [patientId]);
    if (detRes.rows.length === 0) return null;
    const details = detRes.rows[0];

    const activeFactors = buildPatientVector(details);
    if (activeFactors.size === 0) return null;

    const activeCols = [...activeFactors];

    // score = sum of active factor columns for each disease row
    const scoreExpr = activeCols.map(c => `COALESCE("${c}", 0)`).join(' + ');

    // ── Baseline cols: only age + gender (what any person of this age/gender scores)
    // Used to compute excess risk = how much THIS patient scores above their own baseline.
    const baselineCols = activeCols.filter(c => {
      const ageVals = new Set(Object.values(AGE_MAP));
      return ageVals.has(c) || c === 'male' || c === 'female' || c === 'other';
    });
    const baselineScoreExpr = baselineCols.length > 0
      ? baselineCols.map(c => `COALESCE("${c}", 0)`).join(' + ')
      : '0';

    // ── Domain-level average scores ──────────────────────────────────────────
    // Strip famhist_* columns — apply condition-specific boosts instead.
    const domainActiveCols = activeCols.filter(c => !FAMHIST_COLS.has(c));
    const domainScoreExpr  = domainActiveCols.length > 0
      ? domainActiveCols.map(c => `COALESCE("${c}", 0)`).join(' + ')
      : '0';

    const categoryAvgExprs = Object.entries(CATEGORY_COLS)
      .filter(([label]) => label !== 'Family')
      .map(([label, col]) => `ROUND(AVG(COALESCE("${col}", 0))::numeric, 4) AS "${label}"`)
      .join(', ');

    const domainSql = `
      SELECT
        clinical_domain,
        ROUND(AVG(${domainScoreExpr})::numeric, 4)     AS avg_score,
        ROUND(AVG(${baselineScoreExpr})::numeric, 4)   AS avg_baseline
        ${categoryAvgExprs ? ', ' + categoryAvgExprs : ''}
      FROM disease_risk_scores
      WHERE clinical_domain IS NOT NULL AND clinical_domain != ''
      GROUP BY clinical_domain
      ORDER BY avg_score DESC
    `;

    const domainRes = await client.query(domainSql);

    // Condition-specific family history boosts
    const familyBoosts = {};
    for (const entry of (details.family_health_history || [])) {
      const domains = FAMILY_CONDITION_DOMAIN_MAP[entry.condition] || [];
      const relCount = (entry.relations || []).length;
      if (relCount === 0 || domains.length === 0) continue;
      const boost = (relCount / MAX_RELATIONS) * MAX_FAMILY_BOOST;
      for (const domain of domains) {
        familyBoosts[domain] = (familyBoosts[domain] || 0) + boost;
      }
    }

    const domainScores = domainRes.rows.map(row => {
      const rawCategoryVals = {};
      let categoryTotal = 0;
      for (const label of Object.keys(CATEGORY_COLS)) {
        if (label === 'Family') continue;
        const v = Number(row[label]) || 0;
        rawCategoryVals[label] = v;
        categoryTotal += v;
      }
      const familyBoost = familyBoosts[row.clinical_domain] || 0;
      rawCategoryVals['Family'] = familyBoost;
      categoryTotal += familyBoost;

      const normalizedBreakdown = {};
      for (const [label, v] of Object.entries(rawCategoryVals)) {
        normalizedBreakdown[label] = categoryTotal > 0
          ? Math.round((v / categoryTotal) * 100)
          : 0;
      }

      const patientScore   = Number(row.avg_score);
      const baselineScore  = Number(row.avg_baseline);
      const finalScore     = patientScore + familyBoost;
      // excess = how much this patient scores above their own age/gender baseline
      // Family boost is always excess by nature (patient-specific)
      const excessScore    = (patientScore - baselineScore) + familyBoost;

      return {
        domain:             row.clinical_domain,
        avg_score:          finalScore,
        excess_score:       excessScore,
        category_breakdown: normalizedBreakdown,
      };
    });

    // Re-sort by excess_score — this is the fair ranking
    domainScores.sort((a, b) => b.excess_score - a.excess_score);
    const nonZeroDomains = domainScores.filter(d => d.avg_score > 0);

    // ── Top diseases (kept for symptom checker compatibility) ────────────────
    const categoryExprs = Object.entries(CATEGORY_COLS)
      .map(([label, col]) => `"${col}" AS "${label}"`)
      .join(', ');

    const sql = `
      SELECT
        code, title_text, clinical_domain, chapter,
        (${scoreExpr}) AS patient_score,
        ${categoryExprs}
      FROM disease_risk_scores
      ORDER BY patient_score DESC
      LIMIT $1
    `;

    const { rows } = await client.query(sql, [topN]);

    const topDiseases = rows.map(row => {
      const categoryBreakdown = {};
      for (const label of Object.keys(CATEGORY_COLS)) {
        categoryBreakdown[label] = Number(row[label]) || 0;
      }
      return {
        icd11:             row.code,
        title:             row.title_text,
        clinical_domain:   row.clinical_domain,
        chapter:           row.chapter,
        score:             Number(row.patient_score),
        category_breakdown: categoryBreakdown,
      };
    });

    // Count total diseases scored (with any non-zero patient score)
    const countRes = await client.query(
      `SELECT COUNT(*) FROM disease_risk_scores WHERE (${scoreExpr}) > 0`
    );
    const totalScored = Number(countRes.rows[0].count);

    // Ensure domain_scores column exists
    await client.query(`
      ALTER TABLE patient_risk_profile
      ADD COLUMN IF NOT EXISTS domain_scores JSONB
    `);

    // Upsert into patient_risk_profile
    await client.query(`
      INSERT INTO patient_risk_profile (patient_id, top_diseases, domain_scores, total_diseases_scored, computed_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (patient_id)
      DO UPDATE SET
        top_diseases = $2,
        domain_scores = $3,
        total_diseases_scored = $4,
        computed_at = CURRENT_TIMESTAMP
    `, [patientId, JSON.stringify(topDiseases), JSON.stringify(nonZeroDomains), totalScored]);

    return { topDiseases, domainScores: nonZeroDomains };
  } finally {
    client.release();
  }
}
