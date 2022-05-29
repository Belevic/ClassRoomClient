
import React, { useState, useEffect } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import { Container, Navbar, Dropdown, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointDown, faHome, faHandPointUp } from "@fortawesome/free-solid-svg-icons";

var socketClient = null;
const ClassRoom = () => {

    const [userInfo, setUserInfo] = useState({
        userName: '',
        handUp: false
    });

    const [users, setUsers] = useState({
        users: []   
    });

    const [loginNotification, setLoginNotification] = useState({
        text: ''
    });

    const [notification, setNotification] = useState({
        text: ''
    });

    const connectToSocket = () => {
        let Sock = new SockJS('http://localhost:8080/ws');
        socketClient = over(Sock);
        socketClient.connect({}, onConnected, onError);
    }

    const onConnected = () => { 
        socketClient.subscribe('/classRoom/public', onMessageReceived);
        userEnter();
    }

    const userEnter = () => {
        var message = {
            senderName: userInfo.userName
        };
        socketClient.send("/app/enter", {}, JSON.stringify(message));
    }

    const userLogout = () => {
        socketClient.disconnect();
        setUserInfo({...userInfo, connected: false});
        localStorage.setItem("connected", false);
        window.location.reload();
    }

    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch(payloadData.status){
            case "ENTER":
                localStorage.setItem("connected", true);
                setUserInfo({...userInfo, connected: true})
                setLoginNotification({...loginNotification, text: ''})
                setNotification({...notification, text: payloadData.message})
                break;
            case "MESSAGE":
                setNotification({...notification, text: payloadData.message})
                break;
            case "LEAVE":
                setNotification({...notification, text: payloadData.message})
                break;
            case "ERROR":
                setLoginNotification({...loginNotification, text: payloadData.message})
                setUserInfo({...userInfo, text: payloadData.message});
                break;
            case "UPDATE":
                setUsers({...users, users: payloadData.users});
                break;
        }
    }

    const onError = (err) => {
        console.log(err);
    }

    const changeHand = () => {
        if (socketClient) {
            var message = {
            senderName: userInfo.userName,
        };
        socketClient.send("/app/message", {}, JSON.stringify(message));
        setUserInfo({...userInfo, handUp: !userInfo.handUp});
        }
    }

    const handleUsername = (event) => {
        const {value} = event.target;
        setUserInfo({...userInfo, userName: value, handUp: false});
    }

    const handleNotification = (event) => {
        const {value} = event.target;
        setNotification({...notification, text: value});
    }

    const handleLoginNotification = (event) => {
        const {value} = event.target;
        setLoginNotification({...loginNotification, text: value});
    }

    const registerUser = () => {
        connectToSocket(); 
    }

    return (
        <div className="container">
        {(localStorage.getItem("connected") !== null & localStorage.getItem("connected") === "true") ?
        <div className="chatContainer">
           <Navbar className='navbar'>
            <Container>
                <Dropdown className="dropDown">
                    <Dropdown.Toggle className='dropDown'>
                        Actions
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="dropDownMenu">
                        <Dropdown.Item onClick={changeHand}>{userInfo.handUp ? <span>Raise hand down</span> : <span>Raise hand up</span>}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Dropdown className="dropDown">
                        <Dropdown.Toggle className='dropDown'>
                             {userInfo.userName}
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropDownMenu">
                            <Dropdown.Item onClick={userLogout}><FontAwesomeIcon icon={faHome} />   Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Navbar.Collapse>
            </Container>
        </Navbar> 
        <div className="classRoom">
            <div className="classTitle">Class members</div>
            <div className="classContent">
                <table className="table">
                    <thead>
                        <tr></tr>
                    </thead>
                    <tbody>
                    {users.users.map((user,index)=>(
                        <tr key={index}>
                            <td>{user.name} {user.handUp ? <FontAwesomeIcon icon={faHandPointUp} /> : <FontAwesomeIcon icon={faHandPointDown} />}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="notificationAlert">
                {
                    notification.text !== '' ? 
                    <div class="alert alert-info alert-dismissible fade show">
                        <strong>Info!</strong> {notification.text}
                    <button type="button" class="btn-close" onClick={handleNotification}></button>
                    </div>  
                    : 
                    <div></div>}
            </div>
        </div>
        </div>
        :
        <div className="register">
            <input
                id="user-name"
                placeholder="Your name"
                name="userName"
                value={userInfo.userName}
                onChange={handleUsername}
                margin="normal"
              />
              <button className="buttonEnter" onClick={registerUser}>
                Enter
              </button> 
              <div className="loginNotificationAlert">
                {
                    loginNotification.text !== '' ? 
                    <div class="alert alert-danger alert-dismissible fade show">
                        <strong>Error!</strong> {userInfo.text}
                        <button type="button" class="btn-close" onClick={handleLoginNotification}></button>
                    </div> 
                    :
                    <div></div>
                }
            </div>
        </div>}
    </div>
    )
}

export default ClassRoom