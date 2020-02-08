import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

class Profile extends Component {
    constructor(props) {
        super();

        this.state = {
            showMenu: false,
        }

        this.showMenu = this.showMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();

        this.setState({ showMenu: true }, () => {
            document.addEventListener('click', this.closeMenu);
        });
    }

    closeMenu() {
        this.setState({ showMenu: false }, () => {
            document.removeEventListener('click', this.closeMenu);
        });
    }

    async login(key = null) {
        // Clear login session if already logged in.
        if (this.props.user) return this.props.setLogin(null);

        // Start the SSO login
        try {
            const apiKey = key ? key : await nexusSSOLogin();
            await Meteor.call('validateAPIkey', apiKey, (error, result) => {
                if (error) return alert('Error validating API key' + error);
                return this.props.setLogin(result);
            });
        }
        catch(err) {
            // Catch SSO failures and launch the fallback modal.
            console.log(err);
            if (err === 'SSO Error') {
                // Fallback time.
            }
        }
        
    }

    render () {
        const { apiKey, user } = this.props;
        if (!user && apiKey) this.login(apiKey);

        return (
        <span id="profile">
            <button className="profile-button" onClick={this.showMenu}>
                {user ? user.name : <i>Logged out</i>}
            </button>
            <div className="user-image" style={{backgroundImage: user && user.profile_url ? `url(${user.profile_url})` : ''}} onClick={this.showMenu}/>
            {this.state.showMenu 
            ?
            <div className="profile-menu">
                <button className="profile-button profile-menu-button" onClick={this.login.bind(this, null)}>{user ? 'Log Out' : 'Log In'}</button>
            </div> 
            : null }
        </span>
        );
    }
}

function nexusSSOLogin() {
    return new Promise((resolve, reject) => {
  
      const application_slug = "vortex";
  
      // Open the web socket.
      window.socket = new WebSocket('wss://sso.nexusmods.com');
  
      socket.onerror = function (error) {
        return reject(new Error('SSO error.'));
      }
  
      socket.onopen = function (event) {
        // console.log('SSO Connection open!');
  
        // Generate or retrieve a request ID and connection token (if we are reconnecting)
        let uuid = null;
        let token = null;
        uuid = sessionStorage.getItem("uuid");
        token = sessionStorage.getItem("connection_token");
  
        if (uuid === null) {
          uuid = uuidv4();
          sessionStorage.setItem('uuid', uuid);
        }
  
        if (uuid !== null) {
  
          let data = {
            id: uuid,
            token: token,
            protocol: 2,
          };
  
          // Send the SSO request
          socket.send(JSON.stringify(data));
  
          // Now we can direct the user to the authorisation page
          window.open(`https://www.nexusmods.com/sso?id=${uuid}&application=${application_slug}`, '_blank');
        } else { 
          console.error('ID was not calculated correctly.');
          reject('ID was not calculated correctly.');
        };
      }
  
      socket.onclose = function (event) {
        // console.log("SSO Connection closed!", event.code, event.reason);
      };
  
      socket.onmessage = function (event) {
        // console.log('Message', event)
  
        // Parse the response
        const response = JSON.parse(event.data);
  
        if (response && response.success) {
          if (response.data.hasOwnProperty('connection_token')) sessionStorage.setItem("connection_token", response.data.connection_token);
          else if (response.data.hasOwnProperty('api_key')) {
            // We got the API key back!
            const apiKey = response.data.api_key;
            sessionStorage.removeItem("uuid");
            sessionStorage.removeItem("connection_token");
            socket.close();
            resolve(apiKey);
          }
        }
      }
  
    });
  }
  
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }

export default Profile;