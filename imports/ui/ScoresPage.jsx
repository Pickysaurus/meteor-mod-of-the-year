import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { ModVotes } from '../api/mod-votes';
import { Nominations } from '../api/nominations';
import WinnersTable from './WinnersTable';

class ScoresPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            authorScores: [],
            voteCount: 0,
            nominationCount: 0,
            displayGame: null,
            modsOverall: []
        }
    }

    componentDidUpdate() {
        this.updateTables();
    }

    componentDidMount() {
        this.updateTables();
    }

    updateTables() {
        const { modsOverall, authorScores, voteCount, nominationCount } = this.state;
        const { allVotes, allNominations} = this.props;

        if (!modsOverall.length || voteCount !== allVotes.length) this.calculateOverallMods();
        if (!authorScores.length || nominationCount !== allNominations.length) this.calculateTopAuthors();
    }

    calculateTopAuthors() {
        const { allNominations } = this.props;
        if (!allNominations.length) return [];
        let nominationData = [];
        allNominations.forEach((n) => {
            const authorEntry = nominationData.find(d => d.id === n.authorId);
            if (!authorEntry) nominationData.push({ id: n.authorId, name: n.name, image: n.avatar, url: `https://nexusmods.com/users/${n.authorId}` , votes: 1 });
            else authorEntry.votes += 1;
        });

        nominationData.sort((a, b) => a.votes > b.votes ? -1 : 1);

        this.setState({authorScores: nominationData, nominationCount: allNominations.length});
        return nominationData;
    }

    calculateOverallMods() {
        const { allVotes } = this.props;
        const { displayGame } = this.state;
        if (!allVotes.length) return null;

        let votes = [...allVotes];

        if (displayGame) votes = votes.filter(v => v.gameTitle === displayGame);

        let modTable = [];
        votes.forEach((vote) => {
            const existingEntry = modTable.find(m => m.gameId === vote.gameId && m.id === vote.modId);
            if (!existingEntry) modTable.push({ gameId: vote.gameId, id: vote.modId, game: vote.gameTitle, gameData: vote.gameDomain, name: vote.modName, nsfw: vote.nsfw, image: vote.modImage, url: `https://nexusmods.com/${vote.gameDomain}/mods/${vote.modId}`, votes: 1 });
            else existingEntry.votes += 1;
        });

        modTable.sort((a,b) => a.votes > b.votes ? -1 : 1);
        this.setState({modsOverall: modTable, voteCount: allVotes.length});
    }

    listGamesForFilter = (allVotes) => {
        let filterGames = [];
        allVotes.forEach(v => {
            return filterGames.indexOf(v.gameTitle) === -1 ? filterGames.push(v.gameTitle) : undefined;
        });

        return filterGames.map(g => {
            return (
                <option key={g}>{g}</option>
            );
        });
    }

    filterChange(event) {
        if (event.target.value !== 'All games') {
            this.setState({displayGame: event.target.value}, () => this.calculateOverallMods())
        }
        else this.setState({displayGame: null}, () => this.calculateOverallMods());
    }

    
    render() {
        const { allVotes, showAdult } = this.props;

        return (
            <div>
                <h2>Top Mods</h2> 
                <div className="gameFilter">
                <label>
                    Filter by game: 
                <select onChange={this.filterChange.bind(this)}>
                <option key="all">All games</option>
                {this.listGamesForFilter(allVotes)}
                </select>
                </label>
                </div>
                <div>
                <label>
                <input type="checkbox" checked={showAdult} onChange={this.props.toggleNSFW} /> Show adult content
                </label>
                </div>
                <WinnersTable entries={this.state.modsOverall} tableItemName='Mod' adult={showAdult} />
                <h2>Top Authors</h2>
                <WinnersTable entries={this.state.authorScores} imageClass="user-image user-image-large" imageContClass="user-image-cont" tableItemName="Author" adult={showAdult} />
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('allVotes');
    Meteor.subscribe('allnominations');
  
    return {
        allVotes: ModVotes.find({}, { sort: { createdAt: -1 } }).fetch(),
        allNominations: Nominations.find({}).fetch(),
    };
  })(ScoresPage);