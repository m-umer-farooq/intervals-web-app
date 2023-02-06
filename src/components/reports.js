import React, { useEffect, useState, useRef } from "react";
import AuthUser from "./AuthUser";
import { DatePicker, Space } from 'antd';
import 'antd/dist/antd.min.css';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
import Papa from "papaparse";
import { Modal, Button } from 'react-bootstrap';
import parse from 'html-react-parser';

const Reports = () => {

  const { http } = AuthUser();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState();

  const [modules, setModules] = useState();
  const [workTypes, setWorkTypes] = useState();
  const [mileStones, setMileStones] = useState();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrors] = useState('');
  const [successMessage, setSuccess] = useState('');
  const [items, setItems] = useState();
  const [pageCount, setPageCount] = useState(0);
  const [showExportButton, setShowExportButton] = useState(false);

  const perPage = 15;
  const offSet = 0;

  let currentDate = new Date();
  let beginDatePick = moment(currentDate).subtract(1, 'months').startOf('month').add(25, 'days').format('YYYY-MM-DD');
  let endDatePick = moment(currentDate).startOf('month').add(24, 'days').format('YYYY-MM-DD');

  const { RangePicker } = DatePicker;
  const [begintDate, setBeginDate] = useState(beginDatePick);
  const [endDate, setEndDate] = useState(endDatePick);

  // Search filters state
  const [clientSelected, setSelectedClient] = useState('');
  const [projectSelected, setSelectedProject] = useState('');
  const [moduleSelected, setSelectedModule] = useState('');
  const [milesStoneSelected, setSelectedMileStone] = useState('');
  const [workTypeSelected, setSelectedWorkType] = useState('');
  const [billableSelected, setSelectedBillable] = useState('');

  const getClients = async () => {

    setLoading(true)

    await http.get('/client').then((res) => {
      //console.table(res.data.client)
      setClients(res.data.client);
    }).catch(error => {
      setErrors(error.message);
    });

    setLoading(false)
  };

  const handleClients = async (clientID) => {

    setLoading(true)

    setSelectedClient(clientID);

    if (clientID !== '') {
      await http.get('/project?clientid=' + clientID + '&limit=2000').then((res) => {
        setProjects(res.data.project);
      }).catch(error => {
        setErrors(error.message);

      });
    } else {

      setSelectedProject('')
      setSelectedModule('')
      setSelectedMileStone('')
      setSelectedClient('')
      setSelectedWorkType('')
      setSelectedBillable('')

      setProjects([])
      setModules([])
      setWorkTypes([])

    }

    setLoading(false)
  }

  const handleProjects = async (projectID) => {

    if (projectID !== '') {

      setLoading(true)

      setSelectedProject(projectID);
      // Project Modules
      await http.get('/projectmodule?projectid=' + projectID + '&limit=2000').then((res) => {
        setModules(res.data.projectmodule);
      }).catch(error => {
        setErrors(error.message);
      });

      //Project MileStones
      await http.get('/projectmilestone?projectid=' + projectID + '&limit=2000').then((res) => {
        setMileStones(res.data.milestone);
      }).catch(error => {
        setErrors(error.message);
      });

      //Project WorkType
      await http.get('/projectworktype?projectid=' + projectID + '&limit=2000').then((res) => {
        setWorkTypes(res.data.projectworktype);

      }).catch(error => {
        setErrors(error.message);
      });

      setLoading(false)
    }
    else {
      setSelectedProject('')
      setSelectedModule('')
      setSelectedMileStone('')
      setSelectedWorkType('')
      setSelectedBillable('')
      setModules([]);
      setWorkTypes([]);
    }
  }

  const handleMileStones = (mileStoneID) => {
    setSelectedMileStone(mileStoneID);
  }

  const handleModules = (moduleID) => {
    setSelectedModule(moduleID);
  }

  const handleWorkType = (workTypeID) => {
    setSelectedWorkType(workTypeID);
  }

  const handleBillable = (billable) => {
    setSelectedBillable(billable)
  }

  const Filter = async () => {

    setLoading(true);

    let query_string = '';

    if (begintDate !== '' && endDate !== '') { query_string += 'datebegin=' + begintDate + '&dateend=' + endDate + '&'; }
    if (clientSelected) { query_string += 'clientid=' + clientSelected + '&'; }
    if (projectSelected) { query_string += 'projectid=' + projectSelected + '&'; }
    if (milesStoneSelected) { query_string += 'milestoneid=' + milesStoneSelected + '&'; }
    if (workTypeSelected) { query_string += 'worktypeid=' + workTypeSelected + '&'; }
    if (moduleSelected) { query_string += 'moduleid=' + moduleSelected + '&'; }
    if (billableSelected) { query_string += 'billable=' + billableSelected + '&'; }

    if (query_string !== '') {

      query_string = '?limit=' + perPage + '&offset=' + offSet + '&sortfield=t.date&sortdir=desc&' + query_string;
      //console.log(query_string);
      await http.get('/time' + query_string).then((res) => {
        //console.table(res.data.time);
        setPageCount(Math.ceil(res.data.listcount / perPage))
        setItems(res.data.time)
      }).catch(error => {
        setErrors(error.message);
      });
    }
    setLoading(false);
  }

  // For Pagination
  const handlePageClick = async (data) => {

    setLoading(true);

    let currentPage = data.selected + 1;
    let offSet = (currentPage - 1) * perPage;

    let query_string = '';

    if (begintDate !== '' && endDate !== '') { query_string += 'datebegin=' + begintDate + '&dateend=' + endDate + '&'; }
    if (clientSelected) { query_string += 'clientid=' + clientSelected + '&'; }
    if (projectSelected) { query_string += 'projectid=' + projectSelected + '&'; }
    if (milesStoneSelected) { query_string += 'milestoneid=' + milesStoneSelected + '&'; }
    if (workTypeSelected) { query_string += 'worktypeid=' + workTypeSelected + '&'; }
    if (moduleSelected) { query_string += 'moduleid=' + moduleSelected + '&'; }
    if (billableSelected) { query_string += 'billable=' + billableSelected + '&'; }

    if (query_string !== '') {
      query_string = '?limit=' + perPage + '&offset=' + offSet + '&sortfield=t.date&sortdir=desc&' + query_string;
      await http.get('/time' + query_string).then((res) => {
        setItems(res.data.time)
      }).catch(error => {
        setErrors(error.message);
      });
    }
    refreshCheckBoxes()
    setShowExportButton(false)
    setLoading(false);
  }

  const changeListner = ($e) => {

    let selectItems = document.getElementsByClassName('acc-item');
    const isSelectorChecked = $e.target.checked;

    if (isSelectorChecked) {
      for (let item of selectItems) {
        item.checked = true;
      }
      setShowExportButton(true)
    } else {
      for (let item of selectItems) {
        item.checked = false;
      }

      setShowExportButton(false)
    }
  }

  const itemsChangeListner = ($e) => {

    let selector = document.getElementsByClassName('select-all')[0];
    let selectItems = document.getElementsByClassName('acc-item');
    let checkBoxesChecked = 0
    let totalCheckBoxes = selectItems.length

    for (let item of selectItems) {
      if (item.checked) {
        checkBoxesChecked++
      }
    }

    if (totalCheckBoxes === checkBoxesChecked) {
      selector.checked = true
      setShowExportButton(true)
    } else if (checkBoxesChecked < totalCheckBoxes && checkBoxesChecked > 0) {
      selector.checked = false
      setShowExportButton(true)
    } else {
      setShowExportButton(false)
    }
  }

  const refreshCheckBoxes = () => {

    let selector = document.getElementsByClassName('select-all')[0];
    selector.checked = false

    let selectItems = document.getElementsByClassName('acc-item');

    for (let item of selectItems) {
      item.checked = false
    }
  }

  const handleExport = () => {

    let data = []

    let selectItems = document.getElementsByClassName('acc-item');

    for (let item of selectItems) {

      if (item.checked) {

        for (let record of items) {

          if (record.id === item.value) {
            let time = record.time;
            time.toString()
            let innerData = [
              record.client ? record.client : '-',
              record.project ? record.project : '-',
              record.module ? record.module : '-',
              record.worktype ? record.worktype : '-',
              record.task ? record.task : '-',
              record.firstname ? parse(record.firstname) + ' ' + parse(record.lastname) : '-',
              record.date ? record.date : '-',
              (record.billable === 't') ? ('Yes') : ('No'),
              time ? time : '-']

            data.push(innerData)
          }
        }
      }
    }

    const fields = ['Client', 'Project', 'Module', 'Work Type', 'Task', 'Person', 'Date', 'Billable', 'Time'];

    const csv = Papa.unparse({
      data,
      fields,
    }, { delimiter: ';' });

    const blob = new Blob([csv]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob, { type: 'text/csv' });
    const timestamp = Date.now();
    a.download = 'Summary_Report_' + timestamp + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    //console.log(data)
  }

  const [show, setShow] = useState(false);
  const [editItemDetail, setEditItemDetail] = useState('');

  const handleClose = () => {
    setShow(false)
  }

  const editHourRef = useRef(null);
  const editDescriptionRef = useRef(null);
  const editBillableRef = useRef(null);
  const editIDRef = useRef(null);
  const editTaskRef = useRef(null);

  const [tasks, setTasks] = useState([]);

  const editItem = async (item) => {
    setLoading(true)
    //console.log('project id' + item.projectid)
    await http.get('/task?projectid=' + item.projectid + '&limit=2000').then((res) => {
      setTasks(res.data.task);
      setEditItemDetail(item)
      setShow(true)
    }).catch(error => {
      setErrors(error.message);
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
    }, 5000)
  }

  const updateHours = async () => {
    setLoading(true)
    let id = editIDRef.current.value;
    let description = editDescriptionRef.current.value;
    let hours = editHourRef.current.value;
    let billable = editBillableRef.current.value;
    let task = editTaskRef.current.value;

    await http.post('/time/' + id, {
      time: hours,
      description: description,
      billable: billable,
      taskid: task,
    }).then((res) => {
      Filter();
      (res?.data?.error_message) ? (setErrorBox(res?.data?.error_message)) : (setErrors(''));
      (res?.data?.success_message) ? (setSuccessBox(res?.data?.success_message)) : (setSuccess(''));
    }).catch(error => {
      setErrors(error.message);
    });
    setLoading(false)
    setShow(false)
  }

  useEffect(() => {
    getClients()
    // eslint-disable-next-line
  }, []);

  return (
    <div className='container-fluid'>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group mb-3'>
            <label className='form-lable'>ID</label>
            <input type="text" ref={editIDRef} className='form-control' readOnly defaultValue={editItemDetail.id} />
          </div>
          <div className='form-group mb-3'>
            <label className='form-lable'>Task</label>
            <select className='form-control' name="taskUpdate" ref={editTaskRef} defaultValue={editItemDetail.taskid}>
              <option>Select</option>
              {tasks ? (
                <>
                  {tasks.map((task, index) => (
                    <option key={task.id} value={task.id}>{parse(task.title)}</option>
                  ))}
                </>
              ) : (<option value="">No Tasks</option>)}
            </select>

          </div>
          <div className='form-group mb-3'>
            <label className='form-lable'>Description</label>
            <textarea name="descriptionUpdate" rows={6} ref={editDescriptionRef} className="form-control" defaultValue={editItemDetail.description ? (parse(editItemDetail.description)) : ('')}></textarea>
          </div>
          <div className='form-group mb-3'>
            <label className='form-lable'>Billable</label>
            <select className="form-control" name="billableUpdate" ref={editBillableRef} defaultValue={editItemDetail.billable}>
              <option value="t">Yes</option>
              <option value="f">No</option>
            </select>
          </div>
          <div className='form-group mb-3'>
            <label className='form-lable'>Hours</label>
            <input type="number" name="hoursUpdate" ref={editHourRef} className='form-control' defaultValue={editItemDetail.time} />
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={(e) => updateHours()}>Submit</Button>
        </Modal.Footer>
      </Modal>

      <div className='row'>
        <div className='col-md-2'>
          <div className="my-3">
            <h6 className="mb-3 mt-3">Filter Options:</h6>
            <div className='col-md-12 mb-3'>
              <label className="form-label">Date Range</label>
              <div>
                <Space direction="vertical" size={12}>
                  <RangePicker
                    ranges={{
                      'Default': [moment(beginDatePick, 'YYYY-MM-DD'), moment(endDatePick, 'YYYY-MM-DD')],
                      'This Month': [moment().startOf('month'), moment().endOf('month')],
                      'Last 7 Days': [moment().add(-7, 'd'), moment()],
                      'Last 14 Days': [moment().add(-14, 'd'), moment()],
                      'Last 30 Days': [moment().add(-30, 'd'), moment()],
                      'Last 90 Days': [moment().add(-90, 'd'), moment()],
                    }}
                    defaultValue={[moment(beginDatePick, 'YYYY-MM-DD'), moment(endDatePick, 'YYYY-MM-DD')]}
                    onChange={(values) => {
                      const beginDate = moment(values[0]).format('YYYY-MM-DD')
                      const endDate = moment(values[1]).format('YYYY-MM-DD')
                      setBeginDate(beginDate)
                      setEndDate(endDate)
                    }}
                  />
                </Space>
              </div>
            </div>
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
              <label className="form-label">Milestones</label>
              <select className="form-select" id="milestones" onChange={(e) => handleMileStones(e.target.value)}>
                <option value="">All MileStones</option>
                {mileStones ? (
                  <>
                    {mileStones.map((mileStone, index) => (
                      <option key={mileStone.id} value={mileStone.id}>{mileStone.title}</option>
                    ))}
                  </>
                ) : (<option value="">No MileStone</option>)}
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
                        <option key={module.id} value={module.id}>{module.name}</option>
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
                        <option key={workType.worktypeid} value={workType.worktypeid}>{workType.worktype}</option>
                      ) : (
                        <option key={workType.id} value={workType.id}>{parse(workType.name)}</option>
                      )
                    ))}
                  </>
                ) : (<option value="">No Work Types</option>)}
              </select>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Billable</label>
              <select className="form-select" id="billable" onChange={(e) => handleBillable(e.target.value)}>
                <option value="">Both</option>
                <option value="t">Yes</option>
                <option value="f">No</option>

              </select>
            </div>
          </div>

          <div className="col-md-12 mb-3">
            <button className='btn btn-primary' onClick={Filter}>Filter</button>
          </div>

        </div>

        <div className='col-md-10'>
          <div className="my-3">
            {errorMessage ? (<div className="alert alert-danger">{errorMessage}</div>) : (<div></div>
            )}
            {successMessage ? (<div className="alert alert-success">{successMessage}</div>) : (<div></div>)}
            <div className="d-flex">
              <h4>Summary Report &nbsp;</h4>
              {(loading) ? (
                <>
                  <div className="spinner-grow text-info" role="status"><span className="sr-only"></span></div>
                </>
              ) : (
                <div></div>
              )}
            </div>

            {items ? (
              <>
                <div className='row'>
                  <div className='col-md-12'>
                    {showExportButton ? (
                      <div className='col-md-2 my-3'>
                        <button className='btn btn-sm btn-primary' onClick={handleExport}>Export</button>
                      </div>

                    ) : (
                      <div className='col-md-2 my-3'>
                        &nbsp;
                      </div>
                    )}
                  </div>
                </div>
                {(items.length) ? (
                  <div className='row'>
                    <div className='col-md-12'>
                      <table className='table table-striped table-bordered'>
                        <thead>
                          <tr>
                            <th>
                              <input type="checkbox" name="select-all" onChange={(e) => changeListner(e)} className='select-all' />
                            </th>
                            <th>Client</th>
                            <th>Project</th>
                            <th>Module</th>
                            <th>Work Type</th>
                            <th>Task</th>
                            <th>Person</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Billable</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index}>
                              <td><input type="checkbox" name="time_id" onChange={(e) => itemsChangeListner(e)} className='acc-item' value={item.id} /></td>
                              <td>{item.client ? (parse(item.client)) : ('')}</td>
                              <td>{item.project ? (parse(item.project)) : ('')}</td>
                              <td>{item.module ? (parse(item.module)) : ('')}</td>
                              <td>{item.worktype ? (parse(item.worktype)) : ('')}</td>
                              <td>{item.task ? (parse(item.task)) : ('')}</td>
                              <td>{item.firstname ? (item.firstname) : ('')} {item.lastname ? (item.lastname) : ('')}</td>
                              <td>{item.date}</td>
                              <td>{item.time}</td>
                              <td>{(item.billable === 't') ? ('Yes') : ('No')}</td>
                              <td><button className='btn btn-primary btn-sm' onClick={(e) => editItem(item)}>Edit</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className='row'>
                    <div className='col-md-12 justify-content-center'>No Data To Display</div>
                  </div>
                )}
              </>
            ) : (<div>&nbsp;</div>)
            }
          </div>

          {items ? (

            <ReactPaginate
              previousLabel={'Pervious'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={'pagination justify-content-center'}
              pageClassName={'page-itme'}
              pageLinkClassName={'page-link'}
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              breakClassName={'page-item'}
              breakLinkClassName={'page-link'}
              activeClassName={'active'}
            />

          ) : (
            <div></div>
          )}

        </div>
      </div>
    </div >

  )
};
export default Reports;