import clsx from 'clsx'

const ProofBox: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div className="flex items-center justify-center col-span-1 rounded md:col-span-2 lg:col-span-1 bg-lightUltra">
      <div className={clsx(className, 'bg-slate-200')} />
    </div>
  )
}

export const SocialProofSection: React.FC = () => {
  return (
    <div className="pt-12 bg-light pattern-bg sm:pt-16">
      <div className="max-w-screen-xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold leading-9 text-heading sm:text-4xl sm:leading-10">
            Trusted by leading people that do people things
          </h2>
          <p className="mt-3 text-xl leading-7 text-gray-500 sm:mt-4">
            Top people choose our awesome stuff because its better and cheaper.
          </p>
        </div>
      </div>

      <div className="pb-2 sm:pb-4">
        <div className="max-w-screen-xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-8 text-P-primary/85 md:grid-cols-6 lg:grid-cols-5 border-3">
            <ProofBox className="p-4 h-14" />
            <ProofBox className="p-4 h-14" />
            <ProofBox className="p-4 h-14" />
            <ProofBox className="p-4 h-14" />
            <ProofBox className="p-4 h-14" />
          </div>
        </div>
      </div>
    </div>
  )
}
