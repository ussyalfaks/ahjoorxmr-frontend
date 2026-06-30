interface CircleCardProps {
  id: string;
  name: string;
  memberCount: number;
  maxMembers: number;
  contributionAmount: string;
  durationLabel: string;
  onJoin: (id: string) => void;
  joining?: boolean;
}

export function CircleCard({
  id,
  name,
  memberCount,
  maxMembers,
  contributionAmount,
  durationLabel,
  onJoin,
  joining,
}: CircleCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>

        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Members</dt>
            <dd className="font-medium text-gray-800">
              {memberCount}/{maxMembers}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Contribution</dt>
            <dd className="font-medium text-gray-800">{contributionAmount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Duration</dt>
            <dd className="font-medium text-gray-800">{durationLabel}</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={() => onJoin(id)}
        disabled={joining}
        className="mt-4 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {joining ? "Joining..." : "Join Circle"}
      </button>
    </div>
  );
}