import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome, FiArrowLeft } from 'react-icons/fi';
import './NotFound.css';

const NotFoundPage = () => {
    return (
        <div className="notfound-page">
            <div className="notfound-glow" />
            <div className="notfound-card">
                <div className="notfound-code">404</div>
                <div className="notfound-icon-wrap">
                    <FiAlertTriangle size={32} />
                </div>
                <h1 className="notfound-title">Page Not Found</h1>
                <p className="notfound-desc">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="notfound-actions">
                    <Link to="/" className="notfound-btn notfound-btn--primary">
                        <FiHome size={16} />
                        Go Home
                    </Link>
                    <button className="notfound-btn notfound-btn--ghost" onClick={() => window.history.back()}>
                        <FiArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
