const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-8">
          Edit Pages/Index.tsx
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a placeholder page. Start building your application here.
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}

export default Index
