// Upload and form constraints for the careers application form, used by
// app/api/careers/route.ts.
//
// The job adverts themselves are NOT here. The rendered /join-our-team pages
// build their copy and their JobPosting schema from
// app/join-our-team/recruitmentContent.ts via _components/RecruitmentRolePage,
// and that is the only place a role, a pay rate or a posting date should be
// edited. This file previously carried a second, unrendered copy of both roles
// and its own buildJobPostingSchema, kept alive by nothing but its own tests.
// It was deleted on 16 August 2026 after its validThrough had silently expired.

export const CAREERS_CV_MAX_BYTES = 20 * 1024 * 1024
export const CAREERS_CV_ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
export const CAREERS_CV_ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
export const CAREERS_FORM_ROLES = ['bar-staff', 'kitchen-team', 'either'] as const
