/** Red warning shown wherever ad copy is worked on for an Oregon dealership. */
export function OregonNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-md border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ${className}`}>
      ⚠ OREGON DEALERSHIP — AD COPY MUST BE OREGON COMPLIANT
    </div>
  );
}
