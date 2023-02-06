import { Route, Routes, Link } from "react-router-dom";
import Reports from "../components/reports";
import AuthUser from "../components/AuthUser";
import ImportCSV from "../components/importcsv";

function Auth() {

  const { token, logout } = AuthUser();

  const logoutUser = () => {
    if (token !== undefined) {
      logout();
    }
  }

  return (
    <>
      <div className="">
        <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
          <div className="container-fluid">
            <div className="navbar-brand">
              SYNERGY IT
            </div>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapsibleNavbar"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="collapsibleNavbar">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="reports">
                    Report
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="import-time">
                    Import Time
                  </Link>
                </li>
                <li className="nav-item">
                  <span role="button" className="nav-link" onClick={logoutUser}>Logout</span>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="container-fluid">
          <Routes>
            <Route path="/reports" element={<Reports />} />
            <Route path="/import-time" element={<ImportCSV />} />
          </Routes>
        </div>
        <div className="container">
          <footer className="py-3 my-4">
            <p className="text-center text-muted">© 2022 SYNERGY-IT</p>
          </footer>
        </div>
      </div>
    </>
  );
}
export default Auth;