import { useRef, useEffect } from 'react';
import { ArrowRight, Mail, GraduationCap, FileText, Check, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { STAFF, type Teacher } from '../data/schoolData';

interface Props {
  pendingTeacher?: Teacher;
  autoAddedTeacher?: Teacher;   // already published — shows "Auto-Published" badge
  onApprove?: (type: 'teacher') => void;
  onReject?: (type: 'teacher') => void;
}

const ADMIN = [
  { name: 'Dr. Patricia Wells', role: 'Principal' },
  { name: 'Mr. James Hartley', role: 'Vice Principal' },
  { name: 'Ms. Anita Choi', role: 'Counselor — Grades 9–10' },
  { name: 'Mr. Derek Santos', role: 'Counselor — Grades 11–12' },
];

export function TeamPage({ pendingTeacher, autoAddedTeacher, onApprove, onReject }: Props) {
  const autoTeacherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoAddedTeacher && autoTeacherRef.current) {
      const timer = setTimeout(() => {
        autoTeacherRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoAddedTeacher]);

  return (
    <div className="relative pb-32">

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 mt-8">
        <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200/60 shadow-2xl shadow-indigo-900/5 relative overflow-hidden">
          <div className="relative h-[400px] rounded-[2rem] overflow-hidden flex items-center justify-center text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-slate-800/10 z-10" />
            <img
              src={`${import.meta.env.BASE_URL}school_hero.png`}
              alt="Oakwood Team"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-20 max-w-3xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg text-white text-sm font-bold"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>48 Dedicated Educators — Best-in-State Faculty 2026</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-5 drop-shadow-xl"
              >
                Meet Our Team.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/90 max-w-xl mx-auto leading-relaxed font-medium drop-shadow-md"
              >
                Passionate educators, coaches, and mentors who make Oakwood the place it is.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Faculty</h2>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
            Full Directory <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* Auto-published teacher card — shown first with "Auto-Published" emerald badge */}
          {autoAddedTeacher && (
            <motion.div
              ref={autoTeacherRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Auto-published banner */}
              <div className="absolute -top-3 left-4 right-4 z-20 flex items-center gap-2 bg-emerald-500 text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-lg">
                <Zap className="w-3 h-3" />
                <span>Auto-Published · Just Now</span>
              </div>
              <BentoCard className="bg-white p-7 h-full flex flex-col ring-2 ring-emerald-400 ring-offset-2 pt-10">
                <StaffCard member={autoAddedTeacher} />
              </BentoCard>
            </motion.div>
          )}

          {/* Pending teacher card — shown first with review overlay */}
          {pendingTeacher && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Review banner */}
              <div className="absolute -top-3 left-4 right-4 z-20 flex items-center justify-between bg-amber-400 text-amber-900 text-xs font-extrabold px-4 py-2 rounded-full shadow-lg">
                <span>⏳ Pending Review</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApprove?.('teacher')}
                    className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-full hover:bg-emerald-500 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => onReject?.('teacher')}
                    className="flex items-center gap-1 bg-white/60 text-amber-900 px-3 py-1 rounded-full hover:bg-white transition-colors"
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              </div>
              <BentoCard className="bg-white p-7 h-full flex flex-col ring-2 ring-amber-400 ring-offset-2 pt-10">
                <StaffCard member={pendingTeacher} />
              </BentoCard>
            </motion.div>
          )}

          {/* Regular staff cards */}
          {STAFF.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <BentoCard className="bg-white p-7 group cursor-pointer h-full flex flex-col">
                <StaffCard member={member} />
              </BentoCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Admin + Resources */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-24 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Admin Team */}
        <BentoCard className="bg-white p-8 group">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Administration</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-7">
            The leadership team keeping Oakwood running at its best.
          </p>
          <div className="space-y-3">
            {ADMIN.map(person => (
              <div key={person.name} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 hover:shadow-md transition-shadow cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{person.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{person.role}</div>
                </div>
                <Mail className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Staff Resources — dark card */}
        <BentoCard className="bg-slate-900 text-white p-10 flex flex-col justify-center group overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(79,70,229,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-extrabold text-white mb-3">Staff Resources</h3>
            <p className="text-slate-400 text-base max-w-sm mb-8">
              Contracts, handbooks, and HR documents synced automatically from Google Workspace.
            </p>
          </div>
          <div className="relative z-10 space-y-4">
            {[
              { title: 'Staff Handbook 2025–26', sub: 'Updated April 2026 via Drive Sync', isNew: true },
              { title: 'Faculty Meeting Schedule', sub: 'Synced from Google Calendar', isNew: false },
              { title: 'Professional Development Docs', sub: 'Released by Administration', isNew: false },
            ].map(resource => (
              <div
                key={resource.title}
                className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer flex justify-between items-center group/item shadow-xl"
              >
                <div>
                  <div className="font-bold text-base text-white flex items-center gap-2">
                    {resource.title}
                    {resource.isNew && (
                      <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">New</span>
                    )}
                  </div>
                  <div className="text-sm text-indigo-300 mt-1">{resource.sub}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover/item:text-white group-hover/item:translate-x-1 transition-all duration-300" />
              </div>
            ))}
          </div>
        </BentoCard>
      </section>

    </div>
  );
}

// ── Shared staff card inner content ──────────────────────────────────────────

function StaffCard({ member }: { member: Teacher }) {
  return (
    <>
      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm mb-5 bg-slate-100 flex items-center justify-center flex-shrink-0">
        <img
          src={member.photo}
          alt={member.name}
          className="w-full h-full object-cover"
          onError={e => {
            e.currentTarget.style.display = 'none';
            (e.currentTarget.nextElementSibling as HTMLElement | null)?.style?.removeProperty('display');
          }}
        />
        <span className="text-2xl font-black text-slate-300 hidden">{member.name.split(' ').pop()?.charAt(0)}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-extrabold text-lg text-slate-900 leading-tight">{member.name}</div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 bg-slate-100 text-slate-500">{member.tag}</span>
        </div>
        <div className="text-sm font-semibold text-indigo-600 mb-1">{member.role}</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">{member.department}</div>
        <p className="text-sm text-slate-500 leading-relaxed">{member.bio}</p>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
        <Mail className="w-4 h-4" /> Contact
      </div>
    </>
  );
}

function BentoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all overflow-hidden relative', className)}>
      {children}
    </div>
  );
}
