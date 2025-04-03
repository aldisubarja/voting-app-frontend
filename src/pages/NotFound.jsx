/* eslint-disable react/no-unescaped-entities */
function NotFound() {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <p className="mt-4 text-3xl font-semibold text-gray-900">Page not found</p>
          <p className="mt-4 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
          <a
            href="/"
            className="mt-8 inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go back home
          </a>
        </div>
      </div>
    );
  }
  
  export default NotFound;