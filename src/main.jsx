import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './posthog.js'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>,
)
