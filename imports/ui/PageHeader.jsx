import React, { Component } from 'react';
import Profile from './Profile';

class PageHeader extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
        <div id="header-banner">
            <div id="header-content">
                <Profile apiKey={this.props.apiKey} setLogin={this.props.setLogin} user={this.props.user} />
                <h1>🏆 Mod of the Year 2019</h1>
            </div>
        </div>
        );
    }
} 

export default PageHeader