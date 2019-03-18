import { push } from "react-router-redux";
import * as authService from "../../services/Authentication";
import * as dataService from "../../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestProjectsType = "REQUEST_PROJECTS";
const receiveProjectsType = "RECEIVE_PROJECTS";

const requestDepartmentsType = "REQUEST_DEPARTMENTS";
const receiveDepartmentsType = "RECEIVE_DEPARTMENTS";

const initialState = {
  projects: [],
  isLoading: false,
  hubConnection: null
};

export const actionCreators = {
  requestProjects: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().projectManagement_Projects.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      var hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("/hub?email=" + authService.getLoggedInUser().email)
        .build();

      hubConnection.on("LoadData", () => {
        loadData(dispatch, isLoaded);
      });

      hubConnection
        .start()
        .then(() => {
          console.log("Hub connection started");
        })
        .catch(err => {
          console.log("Error while establishing connection");
        });

      dispatch({
        type: requestProjectsType,
        isLoaded,
        hubConnection
      });
      loadData(dispatch, isLoaded);
    }
  },

  addProject: data => async dispatch => {
    var res = await AddNewProject(data);
    return res;
  },

  updateProject: data => async dispatch => {
    var res = await UpdateProject(data, dispatch);
    if (res.status === 200) {
      loadData(dispatch);
    }
    return res;
  }
};

export const loadData = async (dispatch, isLoaded) => {
  const projects = await dataService.get("api/projects/getall");
  // console.log(projects);
  dispatch({
    type: receiveProjectsType,
    isLoaded,
    projects
  });
};

// export const loadDepartments = async (dispatch, isLoaded) => {
//   const email = authService.getLoggedInUser().email;
//   const departments = await dataService.get(
//     `api/departments/getchilddepartmentofuser?email=${email}`
//   );
//   console.log(departments);
//   dispatch({
//     type: receiveProjectsType,
//     isLoaded,
//     departments
//   });
// };

export const AddNewProject = async data => {
  // console.log(data);
  var currentUser = authService.getLoggedInUser();
  var departmentId = currentUser.departmentId;
  var email = currentUser.email;
  try {
    var project = [];
    project = {
      Code: data.code,
      Name: data.name,
      Description: data.description,
      DepartmentId: departmentId,
      From: data.projectDeadline[0],
      To: data.projectDeadline[1],
      CreatorEmail: email,
      ProjectMembers: []
    };
    if (data.members.length > 0) {
      var members = [];
      for (var i = 0; i < data.members.length; i++) {
        var member = {
          Name: data.memberNames[i],
          PhoneNumber: data.memberPhoneNumbers[i],
          Email: data.memberEmails[i],
          Department: data.memberDepartments[i]
        };
        members.push(member);
      }
      project.ProjectMembers = members;
    }
    var res = await dataService.post("api/projects/add", project);
    return res;
  } catch (e) {
    console.log(e);
  }

  // const projects = await dataService.get("api/projects/getall");
  // console.log(projects);
  // dispatch({
  //   type: receiveProjectsType,
  //   isLoaded,
  //   projects
  // });
};

export const UpdateProject = async (data, dispatch) => {
  try {
    const projectId = data.projectId.value;
    var project = await dataService.get(`api/projects/getproject/${projectId}`);
    const deadline = data.projectDeadline.value;

    const dates = [
      deadline[0].format("DD-MM-YYYY"),
      deadline[1].format("DD-MM-YYYY")
    ];
    data.from = dates[0];
    data.to = dates[1];

    project.name = data.name.value;
    project.description = data.description.value;
    project.from = data.from;
    project.to = data.to;

    project.projectMembers = data.projectMembers;

    // console.log(project);

    var res = await dataService.put(
      `api/projects/update/${projectId}`,
      project
    );
    // console.log(res);
    return res;
    // loadData(dispatch);
  } catch (e) {
    console.log(e);
  }
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestProjectsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveProjectsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      projects: action.projects
    };
  }

  if (action.type === requestDepartmentsType) {
    return {
      ...state,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveDepartmentsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      department: action.departments
    };
  }

  return state;
};
