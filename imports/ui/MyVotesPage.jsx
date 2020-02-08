import React, { Component } from 'react';
import ReactBootstrap, { Table } from 'react-bootstrap';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import ReactTimeAgo from 'react-time-ago';

JavascriptTimeAgo.locale(en);

class MyVotesPage extends Component {
    renderVotes() {
        const sortedData = this.sortVotes();
        const keys = Object.keys(sortedData);

        return keys.map(game => {
            const gameObject = sortedData[game];
            return (
                <Table key={game}>
                    <thead>
                        <tr>
                        <th colSpan='3' className="game-title" style={{backgroundImage:`linear-gradient(to left, #1c1c1c 75%, transparent), url(https://staticdelivery.nexusmods.com/Images/games/4_3/tile_${gameObject.id}.jpg)`}}><h3>{gameObject.name}</h3></th>
                        </tr>
                        <tr>
                        <th className="name">Mod</th>
                        <th>Time</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {gameObject.data.map(v => { 
                        return (
                        <tr key={v._id}>
                            <td className="name" style={{backgroundImage: `url(${v.modImage})`}}><a href={`https://nexusmods.com/${v.gameDomain}/mods/${v.modId}`} target="_blank">{v.modName}</a></td>
                            <td><ReactTimeAgo date={v.createdAt} /></td>
                            <td><button className="modinfo-btn" onClick={() => this.deleteVote(v._id)}>Remove</button></td>
                        </tr>);
                        })}
                    </tbody>
                </Table>
                
            )
        });
    }

    renderNominations() {
        const { nominations } = this.props;
        return (
            <Table>
                <thead>
                    <tr>
                    <th className="name">Author</th>
                    <th>Time</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {nominations.length ? nominations.map(n => {
                        return (
                            <tr key={n._id}>
                                <td className="name authorname"><a href={`https://nexusmods.com/users/${n.authorId}`}><img className="user-image user-image-table" src={n.avatar}/>{n.name}</a></td>
                                <td><ReactTimeAgo date={n.createdAt} /></td>
                                <td><button className="modinfo-btn" onClick={() => this.deleteNomination(n._id)}>Remove</button></td>
                            </tr>
                        );
                    })
                    : <tr><td colSpan="3">You haven't voted for any authors yet.</td></tr>}
                </tbody>
            </Table>
        );
    }

    sortVotes() {
        const { votes } = this.props;
        let sortedData = {}
        votes.forEach(v => {
            if (!sortedData[v.gameId]) sortedData[v.gameId] = {name: v.gameTitle, id: v.gameId, data: []};
            sortedData[v.gameId].data.push(v);
        });
        return sortedData;
    }

    deleteVote(id) {
        Meteor.call('removeVote',id);
    }

    deleteNomination(id) {
        Meteor.call('removeNomination', id);
    }
    
    render() {
        return (
            <div>
                <h2>My Mod Votes</h2>
                {this.renderVotes()}
                <br />
                <h2>My Mod Author Nominations</h2>
                {this.renderNominations()}
            </div>
        );
    }
}

export default MyVotesPage;