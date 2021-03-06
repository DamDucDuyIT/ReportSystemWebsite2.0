import { push } from "react-router-redux";
import * as authService from "../../services/Authentication";
import * as dataService from "../../services/DataService";
import * as globalService from "../../services/GlobalService";
import * as signalR from "@aspnet/signalr";

const requestProjectsType = "REQUEST_PROJECTS";
const receiveProjectsType = "RECEIVE_PROJECTS";

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

  addProject: data => async (dispatch, getState) => {
    var res = await AddNewProject(data);
    if (res.status === 200) {
      loadData(dispatch, getState().projectManagement_Projects.isLoaded);
    }
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
  const projects = await dataService.get(
    "api/projects/getprojectsusercreateandreceive?sortby=code&issortascending=true&email=" +
      authService.getLoggedInUser().email
  );
  var projectList = [];

  projects.items.map(project => {
    // console.log(project.from);
    var progress = globalService.getProgress(project.from, project.to);
    project.progress = progress;
    projectList.push(project);
  });
  // console.log(projects);
  dispatch({
    type: receiveProjectsType,
    isLoaded,
    projects: projectList
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
      code: data.code,
      name: data.name,
      description: data.description,
      departmentId: departmentId,
      from: data.projectDeadline[0],
      to: data.projectDeadline[1],
      creatorEmail: email,
      projectMembers: []
    };
    if (data.members.length > 0) {
      var members = [];
      for (var i = 0; i < data.members.length; i++) {
        var member = {
          name: data.memberNames[i],
          phoneNumber: data.memberPhoneNumbers[i],
          email: data.memberEmails[i],
          department: data.memberDepartments[i]
        };
        members.push(member);
      }
      project.projectMembers = members;
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

  return state;
};
