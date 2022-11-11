export const ExplainSection: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-24">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Backed by world-renowned investors
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-7 text-gray-500">
              Sagittis scelerisque nulla cursus in enim consectetur quam. Dictum urna sed consectetur neque tristique
              pellentesque. Blandit amet, sed aenean erat arcu morbi. Cursus faucibus nunc nisl netus morbi vel
              porttitor vitae ut. Amet vitae fames senectus vitae.
            </p>
            <div className="mt-6">
              <a href="#" className="text-base font-medium text-rose-500">
                Meet our investors and advisors&nbsp&rarr;
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
            {Array(6)
              .fill(undefined)
              .map((logo, index) => (
                <div key={index} className="col-span-1 flex justify-center bg-gray-50 py-8 px-8">
                  <div className="h-12" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
