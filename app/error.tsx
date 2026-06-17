'use client'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-red-500">Noget gik galt</h1>
      <p className="text-gray-400 mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 bg-orange-500 px-4 py-2 rounded text-white"
      >
        Prøv igen
      </button>
    </div>
  )
}
