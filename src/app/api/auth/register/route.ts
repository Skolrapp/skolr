import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import type { EducationLevel } from '@/types';

function normalizeTzPhone(rawPhone: string) {
  const compact = rawPhone.replace(/\s/g, '');
  if (compact.startsWith('+255')) return compact;
  if (compact.startsWith('255')) return `+${compact}`;
  if (compact.startsWith('0')) return `+255${compact.slice(1)}`;
  return `+255${compact}`;
}

function isMinorEducationLevel(level: EducationLevel) {
  return level === 'primary' || level === 'secondary' || level === 'highschool';
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      phone,
      password,
      role = 'student',
      learner_name,
      learner_level = 'primary',
      learner_sub_category = null,
      guardian_consent = false,
    } = await request.json() as {
      name: string;
      phone: string;
      password: string;
      role?: string;
      learner_name?: string;
      learner_level?: EducationLevel;
      learner_sub_category?: string | null;
      guardian_consent?: boolean;
    };

    if (!name?.trim() || !phone?.trim() || !password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'All fields required. Password min 6 characters.' }, { status: 400 });
    }

    const isStudentFlow = role === 'student';
    const isMinorFlow = isStudentFlow && isMinorEducationLevel(learner_level);

    if (isStudentFlow && !learner_name?.trim()) {
      return NextResponse.json({ success: false, error: 'Learner name is required.' }, { status: 400 });
    }

    if (isMinorFlow && !guardian_consent) {
      return NextResponse.json({ success: false, error: 'Parent or guardian consent is required for minors.' }, { status: 400 });
    }

    const normalized = normalizeTzPhone(phone);
    const supabase   = createSupabaseAdmin();
    const { data: existing } = await supabase.from('users').select('id').eq('phone', normalized).single();
    if (existing) return NextResponse.json({ success: false, error: 'Phone number already registered.' }, { status: 409 });
    const hash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const { error } = await supabase.from('users').insert({
      id: userId,
      name: name.trim(),
      phone: normalized,
      password_hash: hash,
      role,
      account_type: isMinorFlow ? 'parent_guardian' : 'individual',
      subscription_tier: 'free',
    });
    if (error) return NextResponse.json({ success: false, error: 'Registration failed.' }, { status: 500 });

    if (isStudentFlow) {
      const { error: learnerError } = await supabase.from('learner_profiles').insert({
        account_user_id: userId,
        full_name: learner_name?.trim() || name.trim(),
        education_level: learner_level,
        sub_category: learner_sub_category,
        is_minor: isMinorFlow,
        guardian_name: isMinorFlow ? name.trim() : null,
        guardian_whatsapp_number: isMinorFlow ? normalized : null,
        consent_confirmed_at: isMinorFlow ? new Date().toISOString() : null,
      });

      if (learnerError) {
        await supabase.from('users').delete().eq('id', userId);
        return NextResponse.json({ success: false, error: 'Run the parent signup SQL, then try again.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ success: false, error: 'Registration failed.' }, { status: 500 });
  }
}
