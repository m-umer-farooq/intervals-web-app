import React, { useState, useEffect } from "react";
import AuthUser from "./AuthUser";
import Papa from "papaparse";
import parse from 'html-react-parser';
//import { useNavigate } from 'react-router-dom';


// Allowed extensions for input file
const allowedExtensions = ["csv"];

const ImportCSV = () => {

	//const navigate = useNavigate();


	const { http } = AuthUser();
	const [clients, setClients] = useState([]);
	const [projects, setProjects] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [persons, setPerson] = useState([]);
	const [modules, setModules] = useState([]);
	const [workTypes, setWorkTypes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrors] = useState('');
	const [successMessage, setSuccess] = useState('');

	// Search filters state
	const [clientSelected, setSelectedClient] = useState('');
	const [projectSelected, setSelectedProject] = useState('');
	const [taskSelected, setSelectedTask] = useState('');
	const [personSelected, setSelectedPerson] = useState('');
	const [moduleSelected, setSelectedModule] = useState('');
	const [workTypeSelected, setSelectedWorkType] = useState('');
	//const [billableSelected, setSelectedBillable] = useState('');

	//********CSV Handling*********/
	// This state will store the parsed data
	//const [data, setData] = useState([]);
	// It state will contain the error when
	// correct file extension is not used
	const [error, setError] = useState("");
	// It will store the file uploaded by the user
	const [file, setFile] = useState("");
	const [parsedCsvData, setParsedCsvData] = useState([]);

	// This function will be called when
	// the file input changes
	const handleFileChange = (e) => {
		setError("");

		// Check if user has entered the file
		if (e.target.files.length) {
			const inputFile = e.target.files[0];
			// Check the file extensions, if it not
			// included in the allowed extensions
			// we show the error
			const fileExtension = inputFile?.type.split("/")[1];
			if (!allowedExtensions.includes(fileExtension)) {
				setError("Please input a csv file");
				return;
			}
			// If input type is correct set the state
			setFile(inputFile);
		}
	};

	const handleParse = () => {

		// If user clicks the parse button without
		// a file we show a error
		if (!file) return setError("Enter a valid file");
		// Initialize a reader which allows user
		// to read any file or blob.
		const reader = new FileReader();
		// Event listener on reader when the file
		// loads, we parse it and set the data.
		reader.onload = async ({ target }) => {

			Papa.parse(target.result, {
				header: false,
				complete: results => {
					setParsedCsvData(results.data)
					postParsedData(results.data)
				},
			});
		};
		reader.readAsText(file);
	};

	const RefreshState = async (message) => {
		setSuccessBox(message)
		await getClients()
		setProjects([])
		setModules([])
		setWorkTypes([])
		setPerson([])
		setTasks([])
		setParsedCsvData([])
		setFile('')

	}

	const postParsedData = async (csvdata) => {
		setLoading(true)
		await http.post('/importcsv', {
			importdata: JSON.stringify(csvdata),
			client_id: clientSelected,
			project_id: projectSelected,
			module_id: moduleSelected,
			work_type_id: workTypeSelected,
			person_id: personSelected,
			task_id: taskSelected
		}).then((res) => {
			(res?.data?.error_message) ? (setErrorBox(res?.data?.error_message)) : (setErrors(''));
			(res?.data?.success_message) ? (
				RefreshState(res?.data?.success_message)
			) : (setSuccess(''));
		}).catch(error => {
			setErrorBox(error.message);
		});
		setLoading(false)
	}
	//********CSV Handling*********/

	const handleModules = (moduleID) => {
		if (moduleID !== '') {
			setSelectedModule(moduleID)
			getTasks()
		} else {
			getTasks([])
		}
	}

	const handleWorkType = (workTypeID) => {
		if (workTypeID !== '') {
			setSelectedWorkType(workTypeID);
		}
	}

	/* const handleBillable = (billable) => {
		//console.log('handleBillable : ' + billable)
		if (billable !== '') {
			setSelectedBillable(billable)
		}
		
	} */
	const handlePerson = (personID) => {
		if (personID !== '') {
			setSelectedPerson(personID)
			getTasks()
		}
	}

	const handleTasks = (taskID) => {
		if (taskID !== '') {
			setSelectedTask(taskID)
		}
	}

	const handleClients = async (clientID) => {
		setLoading(true)

		if (clientID !== '') {
			setSelectedClient(clientID);
			await http.get('/project?clientid=' + clientID + '&limit=2000').then((res) => {
				setProjects(res.data.project);
			}).catch(error => {
				setErrorBox(error.message);
			});

		} else {
			setProjects([]);
			setModules([]);
			setWorkTypes([]);
			setPerson([]);
			setTasks([]);

		}
		setLoading(false)
	}

	const getClients = async () => {
		setLoading(true)
		await http.get('/client?limit=2000').then((res) => {
			setClients(res.data.client);
		}).catch(error => {
			setErrorBox(error.message);
		});
		setLoading(false)
	};

	const handleProjects = async (projectID) => {
		setLoading(true)

		if (projectID !== '') {
			setSelectedProject(projectID)
			await getPerson(projectID)
			await getModules(projectID)
			await getWorkTypes(projectID)
			//getTasks();
		}
		else {
			setModules([]);
			setWorkTypes([]);
			setPerson([]);
			setTasks([]);
		}

		setLoading(false)
	}

	const getModules = async (projectID) => {
		setLoading(true)
		await http.get('/projectmodule?projectid=' + projectID + '&limit=2000').then((res) => {
			setModules(res.data.projectmodule);
		}).catch(error => {
			setErrorBox(error.message);
		});
		setLoading(false)
	};

	const getWorkTypes = async (projectID) => {
		setLoading(true)
		await http.get('/projectworktype?projectid=' + projectID + '&limit=2000').then((res) => {
			setWorkTypes(res.data.projectworktype);
		}).catch(error => {
			setErrorBox(error.message);
		});
		setLoading(false)
	};

	const getPerson = async (projectID) => {
		setLoading(true)
		//Person
		await http.get('/person?projectid=' + projectID + '&limit=2000').then((res) => {
			setPerson(res.data.person);
		}).catch(error => {
			setErrorBox(error.message);
		});
		setLoading(false)
	}

	const getTasks = async () => {
		setLoading(true)

		let queryString = '';

		if (clientSelected !== '') { queryString += 'clientid=' + clientSelected + '&'; }
		if (projectSelected !== '') { queryString += 'projectid=' + projectSelected + '&'; }
		if (moduleSelected !== '') { queryString += 'moduleid=' + moduleSelected + '&'; }
		if (personSelected !== '') { queryString += 'personid=' + personSelected + '&'; }

		await http.get('/task?' + queryString + 'limit=2000').then((res) => {
			setTasks(res.data.task);
		}).catch(error => {
			setErrorBox(error.message);
		});
		setLoading(false)
	}

	const setSuccessBox = (message) => {
		setSuccess(message)
		setTimeout(function () {
			setSuccess('')
		}, 2000)
	}

	const setErrorBox = (message) => {
		setErrors(message)
		setTimeout(function () {
			setErrors('')
		}, 2000)
	}

	useEffect(() => {
		getClients()
		// eslint-disable-next-line
	}, []);

	return (
		<div className='container-fluid'>
			<div className='row'>
				<div className='col-md-2'>

					<div className="my-3">
						<h6 className="mb-3 mt-3">Filter Options:</h6>
						<div className="form-group mb-3">
							<label className="form-label">Clients</label>
							<select className="form-select" id="client" onChange={(e) => handleClients(e.target.value)}>
								<option value="">Select</option>
								{clients ? (
									<>
										{clients.map((client, index) => (
											<option key={client.id} value={client.id}>{parse(client.name)}</option>
										))}
									</>
								) : (<option value="">No Clients</option>)}
							</select>
						</div>

						<div className="form-group mb-3">
							<label className="form-label">Projects</label>
							<select className="form-select" id="projects" onChange={(e) => handleProjects(e.target.value)}>
								<option value="">All Projects</option>
								{projects ? (
									<>
										{projects.map((project, index) => (
											<option key={project.id} value={project.id}>{parse(project.name)}</option>
										))}
									</>
								) : (<option value="">No Projects</option>)}
							</select>
						</div>
						<div className="form-group mb-3">
							<label className="form-label">Modules</label>
							<select className="form-select" id="modules" onChange={(e) => handleModules(e.target.value)}>
								<option value="">All Modules</option>
								{modules ? (
									<>
										{modules.map((module, index) => (
											module.moduleid ? (
												<option key={module.moduleid} value={module.moduleid}>{parse(module.modulename)}</option>
											) : (
												<option key={module.id} value={module.id}>{parse(module.name)}</option>
											)
										))}
									</>
								) : (<option value="">No Modules</option>)}
							</select>
						</div>

						<div className="form-group mb-3">
							<label className="form-label">Work Type</label>
							<select className="form-select" id="work_types" onChange={(e) => handleWorkType(e.target.value)}>
								<option value="">All Work Types</option>
								{workTypes ? (
									<>
										{workTypes.map((workType, index) => (
											workType.worktypeid ? (
												<option key={workType.worktypeid} value={workType.worktypeid}>{parse(workType.worktype)}</option>
											) : (
												<option key={workType.id} value={workType.id}>{parse(workType.name)}</option>
											)
										))}
									</>
								) : (<option value="">No Work Types</option>)}
							</select>
						</div>

						<div className="form-group mb-3">
							<label className="form-label">Person</label>
							<select className="form-select" id="projects" onChange={(e) => handlePerson(e.target.value)}>
								<option value="">All Person</option>
								{persons ? (
									<>
										{persons.map((person, index) => (
											<option key={person.id} value={person.id}>{person.firstname} {person.lastname}</option>
										))}
									</>
								) : (<option value="">No Person</option>)}
							</select>
						</div>

						<div className="form-group mb-3">
							<label className="form-label">Tasks</label>
							<select className="form-select" id="tasks" onChange={(e) => handleTasks(e.target.value)}>
								<option value="">All Tasks</option>
								{tasks ? (
									<>
										{tasks.map((task, index) => (
											<option key={task.id} value={task.id}>{parse(task.title)}</option>
										))}
									</>
								) : (<option value="">NoTasks</option>)}
							</select>
						</div>

						{/* <div className="form-group mb-3">
							<label className="form-label">Billable</label>
							<select className="form-select" id="billable" onChange={(e) => handleBillable(e.target.value)}>
								<option value="">Both</option>
								<option value="t">Yes</option>
								<option value="f">No</option>

							</select>
						</div> */}
					</div>
				</div>

				<div className='col-md-10'>
					<div className="my-3">
						{errorMessage ? (
							<>
								<div className="alert alert-danger">{errorMessage}</div>
							</>
						) : (
							<div></div>
						)}


						{successMessage ? (
							<>
								<div className="alert alert-success">{successMessage}</div>
							</>
						) : (
							<div></div>
						)}
						<div className="d-flex">
							<h4>Import Hours &nbsp;</h4>
							{loading ? (
								<>
									<div className="spinner-grow text-info" role="status"><span className="sr-only"></span></div>
								</>
							) : (
								<div></div>
							)}

						</div>
						<div className="row">
							<div className="col-md-4">
								<input
									className="form-control"
									onChange={handleFileChange}
									id="csvInput"
									name="file"
									type="File"
								/>
							</div>
							<div className="col-md-2">

								<button className="btn btn-primary" onClick={(e) => handleParse()}>Parse</button>
							</div>
						</div>
						<div className="row">
						</div>

						<div style={{ marginTop: "3rem" }}>

							{error ? <div className="text text-danger">{error}</div> : <div></div>}

							{parsedCsvData ? (
								<div className="table-responsive">
									<table className="table table-bordered table-striped">
										<tbody>
											{parsedCsvData.map((col, idx) =>
												<tr key={idx}>
													{Object.keys(col).map((key, i) =>
														<td key={key}>
															{col[key]}
														</td>
													)}
												</tr>
											)}
										</tbody>
									</table>
								</div>
							) : (<div></div>)
							}

						</div>
					</div>

				</div>
			</div>
		</div>
	);
};

export default ImportCSV;
