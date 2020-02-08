import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { ModVotes } from '../api/mod-votes';
import { Nominations } from '../api/nominations';
import WinnersTable from './WinnersTable';

class ScoresPage extends Component {
    constructor(props) {
        super();

        this.state = {
            authorScores: [],
            voteCount: 0,
            nominationCount: 0,
            displayGames: [],
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
        const { allvotes, allNominations} = this.props;

        if (!modsOverall.length || voteCount !== allvotes.length) this.calculateOverallMods();
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
        const { allvotes } = this.props;
        if (!allvotes.length) return null;

        let modTable = [];
        allvotes.forEach((vote) => {
            const existingEntry = modTable.find(m => m.gameId === vote.gameId && m.id === vote.modId);
            if (!existingEntry) modTable.push({ gameId: vote.gameId, id: vote.modId, game: vote.gameTitle, gameData: vote.gameDomain, name: vote.modName, nsfw: vote.nsfw, image: vote.modImage, url: `https://nexusmods.com/${vote.gameDomain}/mods/${vote.modId}`, votes: 1 });
            else existingEntry.votes += 1;
        });

        modTable.sort((a,b) => a.votes > b.votes ? -1 : 1);
        this.setState({modsOverall: modTable, voteCount: allvotes.length});
    }

    renderTopOverallMods() {
        const { displayGames, modsOverall } = this.state;

        if(!modsOverall.length) return (<p>No votes yet.</p>);

        return modsOverall.map((mod) => {
            if (displayGames.length && displayGames.indexOf(mod.game) === -1) return '';
            return (<p key={`${mod.gameId}-${mod.id}`}>{mod.name} - {mod.game} ({mod.votes} votes)</p>);
        });

    }

    
    render() {
        const { showAdult } = this.props;

        return (
            <div>
                <h2>Top Mods</h2> 
                <label>
                <input type="checkbox" checked={showAdult} onChange={this.props.toggleNSFW} /> Show adult content
                </label>
                <WinnersTable entries={this.state.modsOverall} winnerClass="mod-image-large" tableItemName='Mod' adult={showAdult} />
                <h2>Top Authors</h2>
                <WinnersTable entries={this.state.authorScores} winnerClass="user-image user-image-large" tableItemName="Author" adult={showAdult} />
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('allvotes');
    Meteor.subscribe('allnominations');
  
    return {
        allvotes: ModVotes.find({}, { sort: { createdAt: -1 } }).fetch(),
        allNominations: Nominations.find({}).fetch(),
    };
  })(ScoresPage);