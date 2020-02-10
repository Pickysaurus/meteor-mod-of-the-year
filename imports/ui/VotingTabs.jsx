import React, { Component } from 'react';

import Tabs from './Tabs.jsx';
import VotePage from './VotePage.jsx';
import MyVotesPage from './MyVotesPage.jsx';
import ScoresPage from './ScoresPage.jsx';

class VotingTabs extends Component {
    constructor(props) {
        super();
        this.state = {
            showAdult: false,
            error: null,
        };
    }

    toggleNSFW() {
        this.setState({showAdult: !this.state.showAdult});
    }

    componentDidCatch(error, info) {
        // Need to add a proper render error catcher here. 
        this.setState({error: {name: error, info: info}});
    }

    render() {
        const { games, gamesLoading, user, votes, nominations } = this.props;
        const { error, showAdult } = this.state;

        return (
            <div>
            {!error ?
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
            : <div class="error">{error.name}<br />{error.info}<br />Please refresh the page and try again.</div> }
            </div>
        );
    }
}

export default (VotingTabs);