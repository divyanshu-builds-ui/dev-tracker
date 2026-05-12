import { motion } from 'framer-motion';

// Base shimmer block
function Shimmer({ className }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <Shimmer className="w-24 h-3 mb-2" />
        <Shimmer className="w-64 h-10 mb-2" />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 md:gap-4">
        {/* XP bar */}
        <div className="col-span-4 md:col-span-8 lg:col-span-8 glass rounded-3xl p-6">
          <Shimmer className="w-32 h-3 mb-4" />
          <Shimmer className="w-full h-4 rounded-full" />
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[...Array(4)].map((_, i) => <Shimmer key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>

        {/* Streak */}
        <div className="col-span-4 md:col-span-8 lg:col-span-4 glass rounded-3xl p-6 flex flex-col items-center justify-center">
          <Shimmer className="w-12 h-12 rounded-full mb-3" />
          <Shimmer className="w-16 h-8 mb-2" />
          <Shimmer className="w-20 h-3" />
        </div>

        {/* Stat cards */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="col-span-2 md:col-span-4 lg:col-span-3 glass rounded-2xl p-5">
            <Shimmer className="w-11 h-11 rounded-xl mb-3" />
            <Shimmer className="w-16 h-8 mb-2" />
            <Shimmer className="w-20 h-3" />
          </div>
        ))}

        {/* Progress circle */}
        <div className="col-span-4 md:col-span-4 lg:col-span-3 glass rounded-3xl p-5 flex items-center justify-center">
          <Shimmer className="w-28 h-28 rounded-full" />
        </div>

        {/* Heatmap */}
        <div className="col-span-4 md:col-span-8 lg:col-span-5 glass rounded-3xl p-6">
          <Shimmer className="w-24 h-3 mb-5" />
          <div className="grid grid-cols-7 gap-[5px]">
            {[...Array(35)].map((_, i) => <Shimmer key={i} className="aspect-square rounded-[5px]" />)}
          </div>
        </div>

        {/* Status */}
        <div className="col-span-4 md:col-span-4 lg:col-span-4 glass rounded-3xl p-6">
          <Shimmer className="w-20 h-3 mb-4" />
          {[...Array(3)].map((_, i) => <Shimmer key={i} className="w-full h-12 rounded-xl mb-2.5" />)}
        </div>
      </div>
    </div>
  );
}

// Projects skeleton
export function ProjectsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <Shimmer className="w-20 h-3 mb-3" />
          <Shimmer className="w-48 h-10 mb-2" />
          <Shimmer className="w-32 h-3" />
        </div>
        <Shimmer className="w-36 h-12 rounded-2xl" />
      </div>
      <div className="flex gap-2 mb-8">
        {[...Array(5)].map((_, i) => <Shimmer key={i} className="w-20 h-9 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <Shimmer className="w-32 h-5" />
              <Shimmer className="w-16 h-5 rounded-full" />
            </div>
            <Shimmer className="w-full h-4 mb-4" />
            <div className="flex gap-1.5 mb-4">
              {[...Array(3)].map((_, j) => <Shimmer key={j} className="w-14 h-5 rounded-md" />)}
            </div>
            <Shimmer className="w-full h-2.5 rounded-full mb-4" />
            <div className="flex justify-between pt-4 border-t border-white/[0.03]">
              <div className="flex gap-2">
                <Shimmer className="w-8 h-8 rounded-lg" />
                <Shimmer className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skills skeleton
export function SkillsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <Shimmer className="w-20 h-3 mb-3" />
          <Shimmer className="w-40 h-10 mb-2" />
          <Shimmer className="w-28 h-3" />
        </div>
        <Shimmer className="w-32 h-12 rounded-2xl" />
      </div>
      {[...Array(2)].map((_, cat) => (
        <div key={cat} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Shimmer className="w-9 h-9 rounded-xl" />
            <Shimmer className="w-24 h-5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4">
                <Shimmer className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Shimmer className="w-24 h-4 mb-2" />
                  <Shimmer className="w-full h-2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Daily Logs skeleton
export function LogsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <Shimmer className="w-20 h-3 mb-3" />
          <Shimmer className="w-40 h-10 mb-2" />
          <Shimmer className="w-36 h-3" />
        </div>
        <Shimmer className="w-32 h-12 rounded-2xl" />
      </div>
      <div className="space-y-4 pl-14 relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-[2px] skeleton" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Shimmer className="w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  <Shimmer className="w-16 h-4 rounded-md" />
                  <Shimmer className="w-10 h-4 rounded-full" />
                  <Shimmer className="w-14 h-4 rounded-full" />
                </div>
                <Shimmer className="w-full h-4 mb-1.5" />
                <Shimmer className="w-3/4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Goals skeleton
export function GoalsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <Shimmer className="w-20 h-3 mb-3" />
          <Shimmer className="w-36 h-10 mb-2" />
          <Shimmer className="w-32 h-3" />
        </div>
        <Shimmer className="w-28 h-12 rounded-2xl" />
      </div>
      {/* Progress bar */}
      <div className="glass rounded-2xl p-5 mb-8">
        <Shimmer className="w-28 h-3 mb-3" />
        <Shimmer className="w-full h-3 rounded-full" />
      </div>
      {/* Goals */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4">
            <Shimmer className="w-11 h-11 rounded-xl" />
            <div className="flex-1">
              <Shimmer className="w-40 h-4 mb-2" />
              <div className="flex gap-2">
                <Shimmer className="w-14 h-4 rounded-full" />
                <Shimmer className="w-20 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
