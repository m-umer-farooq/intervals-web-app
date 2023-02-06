import { useState } from "react"
import AuthUser from "./AuthUser"

export default function Login() {

  const { http, setToken } = AuthUser();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrors] = useState('');

  const submitForm = async () => {
    setLoading(true)

    if (apiKey !== '') {

      await http.post('/login', { intervals_api_key: apiKey }).then((res) => {
        setToken(res.data.user, res.data.token);
      }).catch(error => {
        if (error?.message) { setErrors(error?.message) }
        if (error?.response?.data?.message) { setErrors(error?.response?.data?.message) }
        console.clear();
      });

    } else {
      setErrors('Please enter API Key.')
    }

    setLoading(false)
  }
  return (
    <div className="conainter d-flex justify-content-center pt-5 w-100 m-auto">
      <div className="col-sm-6">
        <div className="card p-4">
          <div className="d-flex justify-content-center">
            <img src="https://www.synergy-it.com/Media/skvnj15m/synergy-it-logo.svg" alt="logo" width="240px" />{loading ? (
              <>
                <div className="spinner-grow text-info" role="status"><span className="sr-only"></span></div>
              </>
            ) : (
              <div></div>
            )}

          </div>
          <div className="form-group mb-3 mt-3">
            {errorMessage ? (
              <>
                <div className="alert alert-danger">{errorMessage}</div>
              </>
            ) : (
              <div></div>
            )}
            <label className="form-label">API Key:</label>
            <input
              type="password"
              className="form-control"
              id="apiKey"
              placeholder="Enter API Key"
              name="apiKey"
              onChange={e => setApiKey(e.target.value)}
            />
          </div>
          <button type="button" onClick={submitForm} className="btn btn-primary">Submit</button>
        </div>
      </div>
    </div>
  );
}