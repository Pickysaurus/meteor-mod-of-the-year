import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ModVotes } from '../api/mod-votes';
import { Nominations } from '../api/nominations';

import PageHeader from './PageHeader.jsx';
import VotingTabs from './VotingTabs.jsx';
import Footer from './Footer';
import About from './About';

class App extends Component {
  constructor(props) {
    super();

    this.state = {
      apiKey : sessionStorage.getItem('key'),
      user : null,
      loggingIn: false,
      gamesLoading: false,
      games: [],
    }
  }

  setLogin(userData) {
    if (this.state.loggingIn) return;

    this.setState({loggingIn: true}, () => {
      if (userData) {
        this.setState({ user: userData, apiKey: userData.key }, () => sessionStorage.setItem('key', userData.key));
        this.getGames();
      }
      else this.setState({ user: null, apiKey: null }, () => {
        Meteor.call('logout');
        sessionStorage.removeItem('key');
      });

      this.setState({loggingIn: false})
    });
  }

  async getGames() {
    const { gamesLoading, user, games } = this.state;

    if (gamesLoading) return;

    this.setState({gamesLoading : true}, () => {

        if (!user || games.length > 1) return this.setState({gamesLoading: false});

        Meteor.call('getGames', user.key, (error, result) => {
            if (error) {console.log('error getting games', error); return this.updateGames(allGames);}
            this.updateGames(result);
        });

        this.setState({gamesLoading: false});
    });
}

updateGames(games) {
  this.setState({games: games});
}

  render() {
    const { apiKey, games, gamesLoading, user } = this.state;

    return (
      <div>
        <PageHeader apiKey = {apiKey} user = {user} setLogin={this.setLogin.bind(this)} />
        <div id="container">
          <About />
          <VotingTabs 
            games={games}
            gamesLoading={gamesLoading}
            getGames={this.getGames.bind(this)}
            user={user} 
            votes={this.props.votes} 
            nominations={this.props.nominations} 
          />
        </div>
        <Footer />
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('modvotes');
  Meteor.subscribe('nominations');

  return {
      votes: ModVotes.find({}, { sort: { createdAt: -1 } }).fetch(),
      nominations: Nominations.find({}, {sort: { createdAt: -1}}).fetch(),
  };
})(App);