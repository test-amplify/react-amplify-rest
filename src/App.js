import React, { useState, useEffect } from 'react';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import Amplify, { Auth, API } from 'aws-amplify';
import awsconfig from './aws-exports';
import { Hub } from '@aws-amplify/core';

Amplify.configure(awsconfig);

function App() {

  let [user, setUser] = useState(null)
  
  let [name, setName] = useState(null)

  let [email, setEmail] = useState(null)
  
  let [lastname, setlastname] = useState(null)
  let [userList, setUserList] = useState([])
  let [showDetails,setshowDetails]=useState(false)
  let [editScenario,seteditScenario]=useState(false)
  let [UserId, setUserId] = useState(null)
  useEffect(() => {
    
    let updateUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser()
        console.log("user>>>>>",user)
        if (user) {
         await apicall();
        }
        setUser(user)
      } catch {
        setUser(null)
      }
    }
    Hub.listen('auth', updateUser) // listen for login/signup events

    // we are not using async to wait for updateUser, so there will be a flash of page where the user is assumed not to be logged in. If we use a flag 
    updateUser() // check manually the first time because we won't get a Hub event
    return () => Hub.remove('auth', updateUser) // cleanup

  }, []);




  const apicall = async () => {
    console.log("api call started")
    const response = await API.get("UserApi", "/users");
    console.log("response>>>", response)
    if(response.length)setshowDetails(true)
    setUserList(response)
    
  }
  const handleSubmit = async() => {
    console.log("response>>>", name,email)
    if(editScenario){
      const resp = await API.put("UserApi", "/users", { body: { id: UserId, firstname:name, email:email, lastname: lastname } });
    }else{
    const resp = await API.post("UserApi", "/users", { body: { id: Date.now().toString(), firstname:name, email:email, lastname: lastname } });
    console.log("post resp........>>>", resp)
    }
    await apicall();
  };
  const handleEdit=async(user) => {
    console.log("user>>edit",user)
    seteditScenario(true);
    setEmail(user.email);
    setUserId(user.id);
   setlastname(user.lastname);
   setName(user.firstname);
  }
  const handleDelete=async(id,user) => {
//const resp = await API.delete("userApi",`/users:${id}`,{ body: user });
const resp = await API.delete("UserApi", "/users", { body:user });
  }

  return (
    <div className="container">
   <nav class="navbar navbar-inverse">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="#">Welcome {user ? user.username : null}</a>
    </div>
    <ul class="nav navbar-nav">


    <AmplifySignOut />
    </ul>
  </div>
</nav> 
      <div className="container">
        
          <legend>Add</legend>
          <div className="form-group">
            <label htmlFor="title">First Name</label>
            <input type="text" className="form-control" id="name" placeholder="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="content">Last Name</label>
            <input type="text" className="form-control" id="lastName" placeholder="Last Name" value={lastname} onChange={e => setlastname(e.target.value)} />
            </div> 
            <div className="form-group">
            <label htmlFor="content">Email</label>
            <input type="text" className="form-control" id="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>           
             <button type="submit" className="btn btn-primary" onClick={() =>{handleSubmit()}} >
            Submit         
             </button>
        <hr />
        <legend>List of Users</legend>
        {showDetails ? (

          <table>
    <thead>
      <tr>
        <th style={{width:200}}>Id</th>
        <th style={{width:200}}>First Name</th>
        <th style={{width:200}}>Last Name</th>
        <th style={{width:200}} >Email</th>
        <th style={{width:200}}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {showDetails ? (
       
        userList.map((user) => (
          <tr key={user.id}>
             <td style={{width:200}}>{user.id}</td>
             <td style={{width:200}}>{user.firstname}</td>
             <td style={{width:200}}>{user.lastname}</td>
            <td style={{width:200}} >{user.email}</td>
            
            <td style={{width:200}}>
              <button className="button muted-button" onClick={() =>{handleEdit(user)}} >Edit</button>
              {/* <button className="button muted-button" onClick={() =>{handleDelete(user.id,user)}}>Delete</button> */}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={3}>No users</td>
        </tr>
      )}
    </tbody>
  </table>
):null}
               
      

      </div>
                                                      




    </div>
 
  );
}


export default withAuthenticator(App);