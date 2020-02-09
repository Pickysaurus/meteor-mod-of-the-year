import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

import Tabs from './Tabs.jsx';
import VotePage from './VotePage.jsx';
import MyVotesPage from './MyVotesPage.jsx';
import ScoresPage from './ScoresPage.jsx';

class VotingTabs extends Component {
    constructor(props) {
        super();
        this.state = {
            showAdult: false,
        };
    }

    toggleNSFW() {
        this.setState({showAdult: !this.state.showAdult});
    }

    componentDidCatch(error, info) {
        // Need to add a proper render error catcher here. 
    }

    render() {
        const { games, gamesLoading, user, votes, nominations } = this.props;
        const { showAdult } = this.state;

        return (
            <Tabs>
                <div label="🔥 Current Scores">
                    <ScoresPage
                        games={games}
                        votes={votes}
                        nominations={nominations}
                        showAdult={showAdult}
                        toggleNSFW={this.toggleNSFW.bind(this)}
                    />
                </div>
                <div label="Vote">
                    <VotePage 
                        user={user} 
                        votes={user ? votes : []} 
                        nominations={user ? nominations.filter(n => n.owner === user.user_id) : []} 
                        games={games}
                        gamesLoading={gamesLoading}
                        getGames={this.props.getGames}
                        showAdult={showAdult}
                        toggleNSFW={this.toggleNSFW.bind(this)}
                    />
                </div>
                <div label="My Votes">
                {user 
                ? <MyVotesPage 
                    user={user} 
                    votes={user ? votes.filter(v => v.owner === user.user_id) : []} 
                    nominations={user ? nominations.filter(n => n.owner === user.user_id) : []} 
                /> 
                : 'Please log in to see your votes.'}
                </div>
            </Tabs>
        );
    }
}

export default (VotingTabs);