import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="center-screen">
      <div>
        <h1>Page not found</h1>
        <p>
          That page does not exist. <Link to="/">Go home</Link>
        </p>
      </div>
    </div>
  )
}
