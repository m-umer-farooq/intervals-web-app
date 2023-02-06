import { Route, Routes } from "react-router-dom";
import Login from "../components/login";

function Guest() {
  return (
    <>
      <div className="">
        <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
          <div className="container-fluid">
            <div className="navbar-brand" >
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
                {/* <li className="nav-item">
                <Link className="nav-link" to="home">
                  Home
                </Link>
              </li> */}
                {/* <li className="nav-item">
                <Link className="nav-link" to="login">
                  Login
                </Link>
              </li> */}
              </ul>

            </div>

          </div>
        </nav>
        <div className="container-fluid">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Guest;
